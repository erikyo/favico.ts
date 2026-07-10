import {
	animationDuration,
	animations,
	transformFramesForPosition,
} from "../animations/frames";
import { renderBadge } from "../renderers/badge-renderer";
import type { BadgeOptions, InternalOptions, RenderContext } from "../types";
import { isPageHidden } from "./environment";
import type { Scheduler } from "./scheduler";

interface AnimationQueueItem {
	options: BadgeOptions;
	internalOptions: InternalOptions;
	resolve: () => void;
}

export class AnimationController {
	private latestItem: AnimationQueueItem | null = null;
	private lastBadgeItem: AnimationQueueItem | null = null;
	private scheduler: Scheduler;
	private updateIconCallback: (canvas: HTMLCanvasElement) => void;
	private renderContext: RenderContext;

	private currentAnimationId = 0;
	private activeLoopHandle: number | null = null;

	constructor(
		scheduler: Scheduler,
		renderContext: RenderContext,
		updateIconCallback: (canvas: HTMLCanvasElement) => void,
	) {
		this.scheduler = scheduler;
		this.renderContext = renderContext;
		this.updateIconCallback = updateIconCallback;
	}

	public enqueue(item: Omit<AnimationQueueItem, "resolve">): Promise<void> {
		return new Promise((resolve) => {
			if (this.latestItem) {
				this.latestItem.resolve();
			}

			this.latestItem = { ...item, resolve };
			this.currentAnimationId++;
			const id = this.currentAnimationId;
			this.start(id);
		});
	}

	public reset(): void {
		if (this.latestItem) {
			this.latestItem.resolve();
			this.latestItem = null;
		}
		this.lastBadgeItem = null;
		this.currentAnimationId++;
		if (this.activeLoopHandle !== null) {
			this.scheduler.cancelFrame(this.activeLoopHandle);
			this.activeLoopHandle = null;
		}
	}

	private start(animId: number): void {
		if (animId !== this.currentAnimationId || !this.latestItem) return;

		const item = this.latestItem;

		const run = () => {
			if (animId !== this.currentAnimationId) return;
			this.runAnimation(
				item.options,
				item.internalOptions,
				false,
				() => {
					if (animId === this.currentAnimationId) {
						this.lastBadgeItem = item;
						this.latestItem = null;
						item.resolve();
					}
				},
				undefined,
				animId,
			);
		};

		if (this.lastBadgeItem && this.lastBadgeItem.options.n !== item.options.n) {
			this.runAnimation(
				this.lastBadgeItem.options,
				item.internalOptions,
				true,
				() => {
					run();
				},
				undefined,
				animId,
			);
		} else {
			run();
		}
	}

	private runAnimation(
		badgeOpts: BadgeOptions,
		internalOpts: InternalOptions,
		revert: boolean,
		callback: () => void,
		stepIndex?: number,
		animId?: number,
		lastTime?: number,
	): void {
		if (animId !== this.currentAnimationId) return;

		const type = isPageHidden(internalOpts.window)
			? "none"
			: internalOpts.animation;
		const frames = transformFramesForPosition(
			animations[type] || animations.none,
			internalOpts.position,
		);

		let step = stepIndex;
		if (step === undefined) {
			step = revert ? frames.length - 1 : 0;
		}

		const now = Date.now();
		const shouldDraw =
			lastTime === undefined || now - lastTime >= animationDuration;

		if (shouldDraw) {
			if (step >= 0 && step < frames.length) {
				const frameOpts = { ...badgeOpts, ...frames[step] };
				renderBadge(this.renderContext, frameOpts, internalOpts);
				this.updateIconCallback(this.renderContext.canvas);

				const nextStep = revert ? step - 1 : step + 1;

				this.activeLoopHandle = this.scheduler.requestFrame(() => {
					this.runAnimation(
						badgeOpts,
						internalOpts,
						revert,
						callback,
						nextStep,
						animId,
						now,
					);
				});
			} else {
				callback();
			}
		} else {
			this.activeLoopHandle = this.scheduler.requestFrame(() => {
				this.runAnimation(
					badgeOpts,
					internalOpts,
					revert,
					callback,
					step,
					animId,
					lastTime,
				);
			});
		}
	}
}
