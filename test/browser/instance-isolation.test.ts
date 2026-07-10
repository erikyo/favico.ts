import { beforeEach, describe, expect, test } from "vitest";
import Favico from "../../src/index";

describe("instance isolation", () => {
	let link1: HTMLLinkElement;
	let link2: HTMLLinkElement;

	beforeEach(() => {
		document.head.innerHTML = "";
		link1 = document.createElement("link");
		link1.id = "link1";
		link1.rel = "icon";
		document.head.appendChild(link1);

		link2 = document.createElement("link");
		link2.id = "link2";
		link2.rel = "icon";
		document.head.appendChild(link2);
	});

	test("each instance updates only its own target", async () => {
		const f1 = new Favico({ elementId: "link1" });
		const f2 = new Favico({ elementId: "link2" });
		await f1.ready();
		await f2.ready();

		f1.badge(1);
		await new Promise((r) => setTimeout(r, 50));

		expect(link1.getAttribute("href")).toMatch(/^data:image\/png/);
		expect(link2.getAttribute("href")).toBeNull();

		f2.badge(2);
		await new Promise((r) => setTimeout(r, 50));
		expect(link2.getAttribute("href")).toMatch(/^data:image\/png/);
	});
});
