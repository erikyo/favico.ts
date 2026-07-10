import type { RenderContext } from "../types";

export function renderImage(
	ctx: RenderContext,
	image: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
): void {
	const { context, width, height } = ctx;
	context.clearRect(0, 0, width, height);

	let w = image.width;
	let h = image.height;

	if (image instanceof HTMLImageElement) {
		w = image.naturalWidth || image.width;
		h = image.naturalHeight || image.height;
	}

	const ratio = Math.min(width / w, height / h);
	const drawWidth = w * ratio;
	const drawHeight = h * ratio;

	context.drawImage(image, 0, 0, drawWidth, drawHeight);
}

export function renderVideoFrame(
	ctx: RenderContext,
	video: HTMLVideoElement,
): void {
	const { context, width, height } = ctx;
	context.clearRect(0, 0, width, height);
	try {
		context.drawImage(video, 0, 0, width, height);
	} catch (_e) {
		// Firefox might throw if frame is not ready
	}
}
