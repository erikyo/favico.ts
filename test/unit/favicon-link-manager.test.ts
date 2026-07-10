import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { FaviconLinkManager } from "../../src/core/favicon-link-manager";

describe("favicon-link-manager", () => {
	let manager: FaviconLinkManager;

	beforeEach(() => {
		document.head.innerHTML = "";
		manager = new FaviconLinkManager(window);
	});

	afterEach(() => {
		manager.destroy();
	});

	test("creates new link if none exists", () => {
		manager.initialize({});
		const links = document.head.querySelectorAll("link");
		expect(links.length).toBe(1);
		expect(links[0].getAttribute("rel")).toBe("icon");
	});

	test("uses existing shortcut icon", () => {
		const link = document.createElement("link");
		link.rel = "shortcut icon";
		link.href = "/favicon.ico";
		document.head.appendChild(link);

		manager.initialize({});
		const links = document.head.querySelectorAll("link");
		expect(links.length).toBe(1);
		expect(manager.getBaseImageHref()).toContain("/favicon.ico");
	});

	test("setIconSrc and reset", () => {
		const link = document.createElement("link");
		link.rel = "icon";
		link.href = "/favicon.ico";
		document.head.appendChild(link);

		manager.initialize({});
		manager.setIconSrc("data:image/png;base64,...");
		expect(link.getAttribute("href")).toBe("data:image/png;base64,...");
		expect(link.getAttribute("type")).toBe("image/png");

		manager.reset();
		expect(link.getAttribute("href")).toContain("/favicon.ico");
		expect(link.hasAttribute("type")).toBe(false);
	});

	test("destroy removes created elements", () => {
		manager.initialize({});
		expect(document.head.querySelectorAll("link").length).toBe(1);
		manager.destroy();
		expect(document.head.querySelectorAll("link").length).toBe(0);
	});
});
