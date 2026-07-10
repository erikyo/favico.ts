import { renderVideoFrame } from "../renderers/image-renderer";
import type { RenderContext } from "../types";
import { MediaError } from "../utils/errors";
import type { Scheduler } from "./scheduler";

export class MediaController {
	private scheduler: Scheduler;
	private renderContext: RenderContext;
	private updateIconCallback: (canvas: HTMLCanvasElement) => void;
	private isStopped = true;
	private videoElement: HTMLVideoElement | null = null;
	private stream: MediaStream | null = null;
	private isInternalVideo = false;
	private videoFrameHandle: number | null = null;
	private rAFHandle: number | null = null;
	private playListener: (() => void) | null = null;
	private endedListener: (() => void) | null = null;
	private errorListener: (() => void) | null = null;

	constructor(
		scheduler: Scheduler,
		renderContext: RenderContext,
		updateIconCallback: (canvas: HTMLCanvasElement) => void,
	) {
		this.scheduler = scheduler;
		this.renderContext = renderContext;
		this.updateIconCallback = updateIconCallback;
	}

	public async startWebcam(
		windowObject: Window,
		width: number,
		height: number,
		constraints?: MediaStreamConstraints,
	): Promise<MediaStream> {
		this.stop();
		if (!windowObject.navigator.mediaDevices?.getUserMedia) {
			throw new MediaError("Webcam access not supported in this environment");
		}

		let acquiredStream: MediaStream;
		try {
			acquiredStream = await windowObject.navigator.mediaDevices.getUserMedia(
				constraints || { video: true, audio: false },
			);
		} catch (e: unknown) {
			const error = e as Error;
			throw new MediaError(
				`Webcam permission denied or failed: ${error.message}`,
			);
		}

		this.stream = acquiredStream;

		const video = windowObject.document.createElement("video");
		video.width = width;
		video.height = height;
		video.autoplay = true;
		video.muted = true;
		video.srcObject = acquiredStream;

		try {
			await this.startVideo(video, true);
		} catch (e) {
			this.stop();
			throw e;
		}

		return acquiredStream;
	}

	public async startVideo(
		video: HTMLVideoElement,
		isInternal = false,
	): Promise<void> {
		this.stop();
		this.isStopped = false;
		this.videoElement = video;
		this.isInternalVideo = isInternal;

		return new Promise<void>((resolve, reject) => {
			if (!video.paused && !video.ended) {
				this.attachListeners();
				this.drawVideoLoop();
				resolve();
				return;
			}

			const onPlay = () => {
				this.cleanupPlayResolver();
				this.attachListeners();
				if (!this.isStopped && this.videoElement === video) {
					this.drawVideoLoop();
				}
				resolve();
			};

			const onError = () => {
				this.cleanupPlayResolver();
				reject(new MediaError("Failed to play video"));
			};

			this.playListener = onPlay;
			this.errorListener = onError;

			video.addEventListener("play", onPlay, { once: true });
			video.addEventListener("error", onError, { once: true });

			video.play().catch((e: unknown) => {
				this.cleanupPlayResolver();
				reject(e);
			});
		});
	}

	private cleanupPlayResolver(): void {
		if (this.videoElement) {
			if (this.playListener) {
				this.videoElement.removeEventListener("play", this.playListener);
				this.playListener = null;
			}
			if (this.errorListener) {
				this.videoElement.removeEventListener("error", this.errorListener);
				this.errorListener = null;
			}
		}
	}

	private attachListeners(): void {
		if (!this.videoElement) return;

		this.playListener = () => {
			if (!this.isStopped) this.drawVideoLoop();
		};
		this.endedListener = () => {
			this.cancelFrame();
		};
		this.errorListener = () => {
			this.stop();
		};

		this.videoElement.addEventListener("play", this.playListener);
		this.videoElement.addEventListener("ended", this.endedListener);
		this.videoElement.addEventListener("error", this.errorListener);
	}

	private removeListeners(): void {
		if (!this.videoElement) return;

		if (this.playListener) {
			this.videoElement.removeEventListener("play", this.playListener);
			this.playListener = null;
		}
		if (this.endedListener) {
			this.videoElement.removeEventListener("ended", this.endedListener);
			this.endedListener = null;
		}
		if (this.errorListener) {
			this.videoElement.removeEventListener("error", this.errorListener);
			this.errorListener = null;
		}
	}

	private cancelFrame(): void {
		if (this.videoFrameHandle !== null && this.videoElement) {
			if ("cancelVideoFrameCallback" in this.videoElement) {
				(this.videoElement as any).cancelVideoFrameCallback(
					this.videoFrameHandle,
				);
			}
			this.videoFrameHandle = null;
		}
		if (this.rAFHandle !== null) {
			this.scheduler.cancelFrame(this.rAFHandle);
			this.rAFHandle = null;
		}
	}

	public stop(): void {
		this.isStopped = true;
		this.cancelFrame();
		this.cleanupPlayResolver();
		this.removeListeners();

		if (this.stream) {
			this.stream.getTracks().forEach((track) => {
				track.stop();
			});
			this.stream = null;
		}
		if (this.videoElement) {
			if (this.isInternalVideo) {
				this.videoElement.srcObject = null;
			}
			this.videoElement = null;
		}
		this.isInternalVideo = false;
	}

	private drawVideoLoop(): void {
		if (this.isStopped || !this.videoElement) return;
		if (this.videoElement.paused || this.videoElement.ended) return;

		renderVideoFrame(this.renderContext, this.videoElement);
		this.updateIconCallback(this.renderContext.canvas);

		if ("requestVideoFrameCallback" in this.videoElement) {
			this.videoFrameHandle = (
				this.videoElement as any
			).requestVideoFrameCallback(() => this.drawVideoLoop());
		} else {
			this.rAFHandle = this.scheduler.requestFrame(() => this.drawVideoLoop());
		}
	}
}
