import { describe, expect, test } from "vitest";
import { hexToRgb } from "../../src/utils/color";

describe("color utils", () => {
	test("valid three-digit hex colors", () => {
		expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
		expect(hexToRgb("0f0")).toEqual({ r: 0, g: 255, b: 0 });
	});

	test("valid six-digit hex colors", () => {
		expect(hexToRgb("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
		expect(hexToRgb("00ff00")).toEqual({ r: 0, g: 255, b: 0 });
	});

	test("invalid colors", () => {
		expect(hexToRgb("#ff")).toBeNull();
		expect(hexToRgb("not-a-color")).toBeNull();
		expect(hexToRgb("")).toBeNull();
	});

	test("case normalization", () => {
		expect(hexToRgb("#F00")).toEqual({ r: 255, g: 0, b: 0 });
		expect(hexToRgb("00FF00")).toEqual({ r: 0, g: 255, b: 0 });
	});
});
