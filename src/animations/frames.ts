import type { AnimationFrame, BadgeAnimation } from "../types";

export const animationDuration = 40;

const fade: AnimationFrame[] = [
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 0.0 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 0.1 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 0.2 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 0.3 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 0.4 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 0.5 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 0.6 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 0.7 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 0.8 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 0.9 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1.0 },
];

const none: AnimationFrame[] = [{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 }];

const pop: AnimationFrame[] = [
	{ x: 1, y: 1, w: 0, h: 0, o: 1 },
	{ x: 0.9, y: 0.9, w: 0.1, h: 0.1, o: 1 },
	{ x: 0.8, y: 0.8, w: 0.2, h: 0.2, o: 1 },
	{ x: 0.7, y: 0.7, w: 0.3, h: 0.3, o: 1 },
	{ x: 0.6, y: 0.6, w: 0.4, h: 0.4, o: 1 },
	{ x: 0.5, y: 0.5, w: 0.5, h: 0.5, o: 1 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 },
];

const popFade: AnimationFrame[] = [
	{ x: 0.75, y: 0.75, w: 0, h: 0, o: 0 },
	{ x: 0.65, y: 0.65, w: 0.1, h: 0.1, o: 0.2 },
	{ x: 0.6, y: 0.6, w: 0.2, h: 0.2, o: 0.4 },
	{ x: 0.55, y: 0.55, w: 0.3, h: 0.3, o: 0.6 },
	{ x: 0.5, y: 0.5, w: 0.4, h: 0.4, o: 0.8 },
	{ x: 0.45, y: 0.45, w: 0.5, h: 0.5, o: 0.9 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 },
];

const slide: AnimationFrame[] = [
	{ x: 0.4, y: 1, w: 0.6, h: 0.6, o: 1 },
	{ x: 0.4, y: 0.9, w: 0.6, h: 0.6, o: 1 },
	{ x: 0.4, y: 0.9, w: 0.6, h: 0.6, o: 1 },
	{ x: 0.4, y: 0.8, w: 0.6, h: 0.6, o: 1 },
	{ x: 0.4, y: 0.7, w: 0.6, h: 0.6, o: 1 },
	{ x: 0.4, y: 0.6, w: 0.6, h: 0.6, o: 1 },
	{ x: 0.4, y: 0.5, w: 0.6, h: 0.6, o: 1 },
	{ x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 },
];

export const animations: Record<BadgeAnimation, AnimationFrame[]> = {
	fade,
	none,
	pop,
	popFade,
	slide,
};

export function transformFramesForPosition(
	frames: AnimationFrame[],
	position: string,
): AnimationFrame[] {
	const isUp = position.includes("up");
	const isLeft = position.includes("left");

	if (!isUp && !isLeft) return frames;

	return frames.map((step) => {
		const transformed = { ...step };

		if (isUp) {
			if (transformed.y < 0.6) {
				transformed.y = transformed.y - 0.4;
			} else {
				transformed.y = transformed.y - 2 * transformed.y + (1 - transformed.w);
			}
		}

		if (isLeft) {
			if (transformed.x < 0.6) {
				transformed.x = transformed.x - 0.4;
			} else {
				transformed.x = transformed.x - 2 * transformed.x + (1 - transformed.h);
			}
		}

		return transformed;
	});
}
