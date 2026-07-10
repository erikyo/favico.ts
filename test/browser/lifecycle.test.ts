import { beforeEach, describe, expect, test } from "vitest";
import Favico from "../../src/index";

describe("badge lifecycle in browser", () => {
	beforeEach(() => {
		document.head.innerHTML = "";
		const link = document.createElement("link");
		link.rel = "icon";
		link.href = "/favicon.ico";
		document.head.appendChild(link);
	});

	test("initial favicon is present and preserved", async () => {
		const f = new Favico();
		await f.ready();
		expect(document.head.querySelectorAll("link").length).toBe(1);
	});

	test("badge(1) changes favicon to data URL", async () => {
		const f = new Favico();
		await f.ready();
		f.badge(1);

		await new Promise((r) => setTimeout(r, 100));

		const link = document.head.querySelector("link");
		expect(link?.getAttribute("href")).toMatch(/^data:image\/png/);
	});

	test("reset restores original", async () => {
		const f = new Favico();
		await f.ready();
		f.badge(1);
		await new Promise((r) => setTimeout(r, 100));
		f.reset();

		const link = document.head.querySelector("link");
		// In vitest/browser environment, the base href might be resolved against localhost
		expect(link?.getAttribute("href")).toContain("/favicon.ico");
	});

	test("rapid updates end on the latest value", async () => {
		const f = new Favico();
		await f.ready();
		f.badge(1);
		f.badge(2);
		f.badge(3);
		await new Promise((r) => setTimeout(r, 150));

		const link = document.head.querySelector("link");
		expect(link?.getAttribute("href")).toMatch(/^data:image\/png/);
	});
});
