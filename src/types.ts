import type { RGB } from "./utils/color";

export type BadgePosition = "up" | "down" | "left" | "leftup" | "upleft";
export type BadgeAnimation = "slide" | "fade" | "pop" | "popFade" | "none";
export type BadgeType = "circle" | "rectangle";
export type BadgeValue = number | string | null;

export interface FavicoOptions {
	backgroundColor?: string;
	textColor?: string;
	fontFamily?: string;
	fontStyle?: string;
	type?: BadgeType;
	position?: BadgePosition;
	animation?: BadgeAnimation;
	elementId?: string | false;
	element?: HTMLElement | null;
	dataUrl?: ((url: string) => void) | false;
	onUpdate?: (url: string) => void;
	window?: Window;
	fallbackSize?: number;

	// Legacy support
	bgColor?: string;
	win?: Window;
}

export interface InternalOptions {
	backgroundColor: RGB;
	textColor: RGB;
	fontFamily: string;
	fontStyle: string;
	type: BadgeType;
	position: BadgePosition;
	animation: BadgeAnimation;
	elementId: string | false;
	element: HTMLElement | null;
	dataUrl: ((url: string) => void) | false;
	onUpdate: ((url: string) => void) | false;
	window: Window;
	fallbackSize: number;
}

export interface BadgeOptions {
	n: BadgeValue;
	x: number;
	y: number;
	w: number;
	h: number;
	o: number;
	len?: number;
}

export interface AnimationFrame {
	x: number;
	y: number;
	w: number;
	h: number;
	o: number;
}

export interface RenderContext {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	width: number;
	height: number;
	baseImage: HTMLImageElement | ImageBitmap | HTMLCanvasElement;
}
