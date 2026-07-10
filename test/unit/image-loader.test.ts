import { describe, expect, test, vi } from "vitest";
import { ImageLoader } from "../../src/core/image-loader";
import { ImageError } from "../../src/utils/errors";

describe("image-loader", () => {
	test("loads valid image src", async () => {
		const loader = new ImageLoader(window);
		const origCreateElement = document.createElement.bind(document);
		vi.spyOn(document, "createElement").mockImplementation(
			(tagName: string) => {
				const el = origCreateElement(tagName);
				if (tagName === "img") {
					setTimeout(() => {
						if ((el as any).src && (el as any).src.includes("error")) {
							el.dispatchEvent(new Event("error"));
							if (el.onerror) el.onerror(new Event("error") as any);
						} else {
							el.dispatchEvent(new Event("load"));
							if (el.onload) el.onload(new Event("load") as any);
						}
					}, 10);
				}
				return el;
			},
		);

		const img = await loader.loadImage("http://localhost/test.png");
		expect(img).toBeInstanceOf(HTMLImageElement);
		expect(img.src).toBe("http://localhost/test.png");
		expect(img.crossOrigin).toBe("anonymous");

		vi.restoreAllMocks();
	});

	test("fallback size", () => {
		const loader = new ImageLoader(window);
		const canvas = loader.createFallback(32);
		expect(canvas.width).toBe(32);
		expect(canvas.height).toBe(32);
	});

	test("throws ImageError on failure", async () => {
		const loader = new ImageLoader(window);
		const origCreateElement = document.createElement.bind(document);
		vi.spyOn(document, "createElement").mockImplementation(
			(tagName: string) => {
				const el = origCreateElement(tagName);
				if (tagName === "img") {
					setTimeout(() => {
						if (el.onerror) el.onerror(new Event("error") as any);
					}, 10);
				}
				return el;
			},
		);

		await expect(loader.loadImage("error")).rejects.toThrow(ImageError);
		vi.restoreAllMocks();
	});
});
