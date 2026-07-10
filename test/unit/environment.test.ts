import { describe, expect, test } from "vitest";
import {
	checkBrowserSupport,
	isBrowser,
	isPageHidden,
} from "../../src/core/environment";

describe("environment", () => {
	test("isBrowser", () => {
		expect(isBrowser()).toBe(true); // jsdom has window
		expect(isBrowser({} as Window)).toBe(false); // missing document
	});

	test("checkBrowserSupport", () => {
		const mockWin = {
			document: {
				createElement: () => ({
					getContext: (type: string) => (type === "2d" ? {} : null),
				}),
			},
		} as unknown as Window;
		expect(checkBrowserSupport(mockWin)).toBe(true);

		const failWin = {
			document: {
				createElement: () => ({ getContext: null }),
			},
		} as unknown as Window;
		expect(checkBrowserSupport(failWin)).toBe(false);
	});

	test("isPageHidden", () => {
		const win = {
			document: { hidden: true },
		} as unknown as Window;
		expect(isPageHidden(win)).toBe(true);

		const win2 = {
			document: { webkitHidden: true },
		} as unknown as Window;
		expect(isPageHidden(win2)).toBe(true);

		const win3 = {
			document: {},
		} as unknown as Window;
		expect(isPageHidden(win3)).toBe(false);
	});
});
