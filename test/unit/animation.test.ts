import { describe, expect, test } from "vitest";
import {
	animations,
	transformFramesForPosition,
} from "../../src/animations/frames";

describe("animation frames", () => {
	test("transform for position down (no change)", () => {
		const slide = animations.slide;
		const transformed = transformFramesForPosition(slide, "down");
		expect(transformed).toEqual(slide);
	});

	test("transform for position up", () => {
		const slide = animations.slide;
		const transformed = transformFramesForPosition(slide, "up");
		expect(transformed).not.toEqual(slide);
		expect(transformed[0].y).not.toBe(slide[0].y);
	});

	test("transform for position left", () => {
		const slide = animations.slide;
		const transformed = transformFramesForPosition(slide, "left");
		expect(transformed).not.toEqual(slide);
		expect(transformed[0].x).not.toBe(slide[0].x);
	});
});
