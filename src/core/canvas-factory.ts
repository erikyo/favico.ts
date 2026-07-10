import type { RenderContext } from "../types";
import { RenderError } from "../utils/errors";

export class CanvasFactory {
	private document: Document;

	constructor(windowObject: Window) {
		this.document = windowObject.document;
	}

	public createContext(
		width: number,
		height: number,
		baseImage: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
	): RenderContext {
		const canvas = this.document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext("2d", { willReadFrequently: true });
		if (!context) {
			throw new RenderError("Failed to get 2d canvas context");
		}

		return {
			canvas,
			context,
			width,
			height,
			baseImage,
		};
	}
}
