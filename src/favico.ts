import { AnimationController } from "./core/animation-controller";
import { CanvasFactory } from "./core/canvas-factory";
import { checkBrowserSupport, isBrowser } from "./core/environment";
import { FaviconLinkManager } from "./core/favicon-link-manager";
import { ImageLoader } from "./core/image-loader";
import { MediaController } from "./core/media-controller";
import { Scheduler } from "./core/scheduler";
import { defaultOptions } from "./defaults";
import { renderImage } from "./renderers/image-renderer";
import type {
	BadgeAnimation,
	FavicoOptions,
	InternalOptions,
	RenderContext,
} from "./types";
import { hexToRgb } from "./utils/color";
import { EnvironmentError, InitializationError } from "./utils/errors";

export class Favico {
	private globalOptions: InternalOptions;
	private linkManager!: FaviconLinkManager;
	private canvasFactory!: CanvasFactory;
	private imageLoader!: ImageLoader;
	private scheduler!: Scheduler;
	private animationController!: AnimationController;
	private mediaController!: MediaController;
	private renderContext!: RenderContext;

	private isReady = false;
	private readyPromise: Promise<void>;
	private destroyed = false;
	private browserWindow: Window;

	constructor(options?: FavicoOptions) {
		this.browserWindow =
			options?.window ||
			options?.win ||
			(typeof window !== "undefined" ? window : ({} as Window));

		this.globalOptions = this.normalizeInitialOptions(options || {});

		if (!isBrowser(this.browserWindow)) {
			this.readyPromise = Promise.resolve(); // Safe exit on SSR
			return;
		}

		if (!checkBrowserSupport(this.browserWindow)) {
			this.readyPromise = Promise.resolve(); // Safe exit on unsupported browser
			return;
		}

		this.scheduler = new Scheduler(this.browserWindow);
		this.linkManager = new FaviconLinkManager(this.browserWindow);
		this.canvasFactory = new CanvasFactory(this.browserWindow);
		this.imageLoader = new ImageLoader(this.browserWindow);

		this.readyPromise = this.init().catch((e) => {
			// Catch internally so we don't cause unhandled rejections
			// if the consumer doesn't explicitly await ready()
			this.destroyed = true;
			throw e;
		});

		// Prevent unhandled promise rejection warning
		this.readyPromise.catch(() => {});
	}

	private normalizeInitialOptions(opts: FavicoOptions): InternalOptions {
		const merged = { ...defaultOptions, ...opts };
		if (opts.bgColor) merged.backgroundColor = opts.bgColor;

		return {
			backgroundColor: hexToRgb(merged.backgroundColor || "#d00") || {
				r: 221,
				g: 0,
				b: 0,
			},
			textColor: hexToRgb(merged.textColor || "#fff") || {
				r: 255,
				g: 255,
				b: 255,
			},
			fontFamily: merged.fontFamily || "sans-serif",
			fontStyle: merged.fontStyle || "bold",
			type: merged.type || "circle",
			position: merged.position || "down",
			animation: merged.animation || "slide",
			elementId: merged.elementId || false,
			element: merged.element || null,
			dataUrl: merged.dataUrl || false,
			onUpdate: merged.onUpdate || false,
			window: this.browserWindow,
			fallbackSize: merged.fallbackSize || 32,
		};
	}

	private mergePartialOptions(
		base: InternalOptions,
		opts: FavicoOptions,
	): InternalOptions {
		const merged = { ...base };

		if (opts.backgroundColor)
			merged.backgroundColor =
				hexToRgb(opts.backgroundColor) || base.backgroundColor;
		else if (opts.bgColor)
			merged.backgroundColor = hexToRgb(opts.bgColor) || base.backgroundColor;

		if (opts.textColor)
			merged.textColor = hexToRgb(opts.textColor) || base.textColor;
		if (opts.fontFamily) merged.fontFamily = opts.fontFamily;
		if (opts.fontStyle) merged.fontStyle = opts.fontStyle;
		if (opts.type) merged.type = opts.type;
		if (opts.position) merged.position = opts.position;
		if (opts.animation) merged.animation = opts.animation;

		if (opts.elementId !== undefined) merged.elementId = opts.elementId;
		if (opts.element !== undefined) merged.element = opts.element;
		if (opts.dataUrl !== undefined) merged.dataUrl = opts.dataUrl;
		if (opts.onUpdate !== undefined) merged.onUpdate = opts.onUpdate;
		if (opts.fallbackSize !== undefined)
			merged.fallbackSize = opts.fallbackSize;

		return merged;
	}

	private async init(): Promise<void> {
		this.linkManager.initialize({
			element: this.globalOptions.element,
			elementId: this.globalOptions.elementId,
			dataUrl: this.globalOptions.onUpdate || this.globalOptions.dataUrl,
		});

		const baseHref = this.linkManager.getBaseImageHref();

		let baseImage: HTMLImageElement | HTMLCanvasElement;
		if (baseHref) {
			try {
				baseImage = await this.imageLoader.loadImage(baseHref);
			} catch (e) {
				baseImage = this.imageLoader.createFallback(
					this.globalOptions.fallbackSize,
				);
			}
		} else {
			baseImage = this.imageLoader.createFallback(
				this.globalOptions.fallbackSize,
			);
		}

		const w = baseImage.width || this.globalOptions.fallbackSize;
		const h = baseImage.height || this.globalOptions.fallbackSize;

		this.renderContext = this.canvasFactory.createContext(w, h, baseImage);

		this.animationController = new AnimationController(
			this.scheduler,
			this.renderContext,
			(canvas) => this.updateIcon(canvas),
		);

		this.mediaController = new MediaController(
			this.scheduler,
			this.renderContext,
			(canvas) => this.updateIcon(canvas),
		);

		this.isReady = true;
		this.reset();
	}

	private assertUsable(): void {
		if (this.destroyed) {
			throw new InitializationError("Favico instance has been destroyed");
		}
	}

	private updateIcon(canvas: HTMLCanvasElement): void {
		if (this.destroyed) return;
		try {
			const url = canvas.toDataURL("image/png");
			this.linkManager.setIconSrc(url);
		} catch (e) {
			// Canvas taint errors
			throw new EnvironmentError("Canvas is tainted and cannot be exported");
		}
	}

	public async ready(): Promise<void> {
		this.assertUsable();
		await this.readyPromise;
	}

	public get isSupported(): boolean {
		return checkBrowserSupport(this.browserWindow);
	}

	public get browser(): { supported: boolean } {
		return { supported: this.isSupported };
	}

	public reset = (): void => {
		if (this.destroyed || !this.isReady) return;
		this.animationController.reset();
		this.mediaController.stop();
		this.scheduler.clear();

		const { context, width, height, baseImage } = this.renderContext;
		context.clearRect(0, 0, width, height);
		context.drawImage(baseImage, 0, 0, width, height);
		this.linkManager.reset();
	};

	public badge = async (
		number: number | string | null,
		opts?: FavicoOptions | string,
	): Promise<void> => {
		this.assertUsable();
		await this.ready();
		if (this.destroyed || !this.isReady) return;

		let optionsObj: FavicoOptions = {};
		if (typeof opts === "string") {
			optionsObj = { animation: opts as BadgeAnimation };
		} else if (opts) {
			optionsObj = opts;
		}

		if (number === null || number === "") {
			this.reset();
			return;
		}

		if (typeof number === "number" && number <= 0) {
			this.reset();
			return;
		}

		const internalOpts = this.mergePartialOptions(
			this.globalOptions,
			optionsObj,
		);

		await this.animationController.enqueue({
			options: { n: number, x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 },
			internalOptions: internalOpts,
		});
	};

	public image = async (
		source: HTMLImageElement | ImageBitmap | HTMLCanvasElement | string,
	): Promise<void> => {
		this.assertUsable();
		await this.ready();
		if (this.destroyed || !this.isReady) return;

		this.reset();
		const img = await this.imageLoader.resolveImage(source);
		renderImage(this.renderContext, img);
		this.updateIcon(this.renderContext.canvas);
	};

	/** @deprecated Use image(url) instead */
	public rawImageSrc = async (url: string): Promise<void> => {
		this.assertUsable();
		await this.ready();
		if (this.destroyed || !this.isReady) return;

		this.reset();
		this.linkManager.setIconSrc(url);
	};

	public startVideo = async (videoElement: HTMLVideoElement): Promise<void> => {
		this.assertUsable();
		await this.ready();
		if (this.destroyed || !this.isReady) return;

		this.reset();
		await this.mediaController.startVideo(videoElement);
	};

	public stopVideo = (): void => {
		if (this.destroyed || !this.isReady) return;
		this.reset();
	};

	/** @deprecated Use startVideo and stopVideo */
	public video = async (
		videoElement: HTMLVideoElement | "stop",
	): Promise<void> => {
		if (videoElement === "stop") {
			this.stopVideo();
			return;
		}
		return this.startVideo(videoElement);
	};

	public startWebcam = async (
		constraints?: MediaStreamConstraints,
	): Promise<MediaStream | undefined> => {
		this.assertUsable();
		await this.ready();
		if (this.destroyed || !this.isReady) return;

		this.reset();
		return this.mediaController.startWebcam(
			this.browserWindow,
			this.renderContext.width,
			this.renderContext.height,
			constraints,
		);
	};

	public stopWebcam = (): void => {
		if (this.destroyed || !this.isReady) return;
		this.reset();
	};

	/** @deprecated Use startWebcam() and stopWebcam() */
	public webcam = async (action?: "stop"): Promise<void> => {
		if (action === "stop") {
			this.stopWebcam();
			return;
		}
		await this.startWebcam();
	};

	/** @deprecated Use setOptions() */
	public setOpt = (key: string | FavicoOptions, value?: unknown): void => {
		if (this.destroyed) return;

		let opts: FavicoOptions = typeof key === "string" ? {} : key;
		if (typeof key === "string" && value !== undefined) {
			opts = { [key]: value };
		}

		this.setOptions(opts);
	};

	public setOptions = (options: FavicoOptions): void => {
		if (this.destroyed) return;
		this.globalOptions = this.mergePartialOptions(this.globalOptions, options);
	};

	public destroy = (): void => {
		if (this.destroyed) return;

		if (this.isReady) {
			this.animationController.reset();
			this.mediaController.stop();
			this.scheduler.clear();
			this.linkManager.destroy();
		}

		this.destroyed = true;
	};
}
