import { describe, expect, test } from "vitest";
import { renderBadge } from "../../src/renderers/badge-renderer";
import type { InternalOptions, RenderContext } from "../../src/types";
import { createMockContext } from "./utils";

describe("badge renderer", () => {
	const baseInternalOpts: InternalOptions = {
		backgroundColor: { r: 255, g: 0, b: 0 },
		textColor: { r: 255, g: 255, b: 255 },
		fontFamily: "sans-serif",
		fontStyle: "bold",
		type: "circle",
		position: "down",
		animation: "slide",
		elementId: false,
		element: null,
		dataUrl: false,
		window: {} as Window,
	};

	const getContext = () => {
		const context = createMockContext();
		const ctx: RenderContext = {
			canvas: {} as HTMLCanvasElement,
			context,
			width: 32,
			height: 32,
			baseImage: {} as HTMLImageElement,
		};
		return { ctx, context };
	};

	test("renders 1", () => {
		const { ctx, context } = getContext();
		renderBadge(
			ctx,
			{ n: 1, x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 },
			baseInternalOpts,
		);
		expect(context.fillText).toHaveBeenCalledWith("1", 22, 29);
	});

	test("renders 999+", () => {
		const { ctx, context } = getContext();
		renderBadge(
			ctx,
			{ n: 1000, x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 },
			baseInternalOpts,
		);
		expect(context.fillText).toHaveBeenCalledWith("1k+", 16, 28);
	});

	test("renders empty string for null, negative or NaN", () => {
		const { ctx, context } = getContext();
		renderBadge(
			ctx,
			{ n: null as any, x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 },
			baseInternalOpts,
		);
		expect(context.fillText).not.toHaveBeenCalled();

		renderBadge(
			ctx,
			{ n: -5, x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 },
			baseInternalOpts,
		);
		expect(context.fillText).not.toHaveBeenCalled();

		renderBadge(
			ctx,
			{ n: NaN, x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 },
			baseInternalOpts,
		);
		expect(context.fillText).not.toHaveBeenCalled();
	});

	test("renders strings", () => {
		const { ctx, context } = getContext();
		renderBadge(
			ctx,
			{ n: "abc", x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 },
			baseInternalOpts,
		);
		expect(context.fillText).toHaveBeenCalledWith("abc", 16, 29);
	});

	test("rectangle geometry", () => {
		const { ctx, context } = getContext();
		renderBadge(
			ctx,
			{ n: 1, x: 0.4, y: 0.4, w: 0.6, h: 0.6, o: 1 },
			{ ...baseInternalOpts, type: "rectangle" },
		);
		expect(context.rect).toHaveBeenCalled();
		expect(context.arc).not.toHaveBeenCalled();
	});
});
