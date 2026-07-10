import { ImageError } from "../utils/errors";

type ValidImageSource =
	| HTMLImageElement
	| ImageBitmap
	| HTMLCanvasElement
	| string;

export class ImageLoader {
	private document: Document;
	private window: Window;

	constructor(windowObject: Window) {
		this.window = windowObject;
		this.document = windowObject.document;
	}

	public async loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = this.document.createElement("img");
			img.crossOrigin = "anonymous";

			img.onload = () => resolve(img);
			img.onerror = () =>
				reject(new ImageError(`Failed to load image from source: ${src}`));

			img.src = src;
		});
	}

	public async resolveImage(
		source: ValidImageSource,
	): Promise<HTMLImageElement | ImageBitmap | HTMLCanvasElement> {
		if (typeof source === "string") {
			return this.loadImage(source);
		}

		if (
			"HTMLImageElement" in this.window &&
			source instanceof (this.window as any).HTMLImageElement
		) {
			const img = source as HTMLImageElement;
			if (!img.complete || !img.src) {
				return this.loadImage(img.src);
			}
			return img;
		}

		if (
			"ImageBitmap" in this.window &&
			source instanceof (this.window as any).ImageBitmap
		) {
			return source as ImageBitmap;
		}

		if (
			"HTMLCanvasElement" in this.window &&
			source instanceof (this.window as any).HTMLCanvasElement
		) {
			return source as HTMLCanvasElement;
		}

		throw new ImageError("Invalid image source type provided");
	}

	public createFallback(size: number): HTMLCanvasElement {
		const canvas = this.document.createElement("canvas");
		canvas.width = size;
		canvas.height = size;
		return canvas;
	}
}
