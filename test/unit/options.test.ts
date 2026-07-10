import { describe, expect, test } from "vitest";
import { defaultOptions } from "../../src/defaults";
import Favico from "../../src/index";

describe("options", () => {
	test("defaults are merged", () => {
		const instance = new Favico() as any;
		const globalOpts = instance.globalOptions;
		expect(globalOpts.fontFamily).toBe(defaultOptions.fontFamily);
		expect(globalOpts.type).toBe("circle");
		expect(globalOpts.backgroundColor).toEqual({ r: 221, g: 0, b: 0 });
	});

	test("legacy bgColor is supported", () => {
		const instance = new Favico({ bgColor: "#00f" }) as any;
		expect(instance.globalOptions.backgroundColor).toEqual({
			r: 0,
			g: 0,
			b: 255,
		});
	});

	test("setOptions modifies global options without mutating originals", () => {
		const instance = new Favico();
		instance.setOptions({ position: "up" });
		const globalOpts = (instance as any).globalOptions;
		expect(globalOpts.position).toBe("up");

		expect(defaultOptions.position).toBe("down");
	});

	test("deprecated setOpt works", () => {
		const instance = new Favico();
		instance.setOpt("position", "left");
		expect((instance as any).globalOptions.position).toBe("left");

		instance.setOpt({ position: "upleft" });
		expect((instance as any).globalOptions.position).toBe("upleft");
	});
});
