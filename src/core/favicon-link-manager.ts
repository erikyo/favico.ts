import { EnvironmentError } from "../utils/errors";

interface OriginalLinkState {
	element: HTMLLinkElement;
	href: string | null;
	type: string | null;
	sizes: string | null;
	rel: string | null;
	created: boolean;
	parent: Node | null;
	nextSibling: Node | null;
}

interface AttachedElementState {
	element: HTMLElement;
	src: string | null;
	href: string | null;
}

export class FaviconLinkManager {
	private document: Document;
	private originalLinks: OriginalLinkState[] = [];
	private attachedState: AttachedElementState | null = null;
	private dataUrlCallback: ((url: string) => void) | false = false;

	constructor(windowObject: Window) {
		this.document = windowObject.document;
	}

	public initialize(options: {
		element?: HTMLElement | null;
		elementId?: string | false;
		dataUrl?: ((url: string) => void) | false;
	}): void {
		this.dataUrlCallback = options.dataUrl || false;
		this.originalLinks = [];
		this.attachedState = null;

		let targetEl: HTMLElement | null = null;
		if (options.element) {
			targetEl = options.element;
		} else if (options.elementId) {
			targetEl = this.document.getElementById(options.elementId);
		}

		if (targetEl) {
			this.attachedState = {
				element: targetEl,
				src: targetEl.getAttribute("src"),
				href: targetEl.getAttribute("href"),
			};
			return;
		}

		const head = this.document.getElementsByTagName("head")[0];
		if (!head) throw new EnvironmentError("No head element found");

		const links = head.getElementsByTagName("link");
		for (let i = 0; i < links.length; i++) {
			const link = links.item(i);
			if (!link) continue;

			const rel = link.getAttribute("rel");
			if (
				rel &&
				/(^|\s)icon(\s|$)/i.test(rel) &&
				!rel.toLowerCase().includes("apple-touch-icon") &&
				!rel.toLowerCase().includes("mask-icon")
			) {
				this.originalLinks.push({
					element: link as HTMLLinkElement,
					href: link.getAttribute("href"),
					type: link.getAttribute("type"),
					sizes: link.getAttribute("sizes"),
					rel: rel,
					created: false,
					parent: link.parentNode,
					nextSibling: link.nextSibling,
				});
			}
		}

		if (this.originalLinks.length === 0) {
			const newLink = this.document.createElement("link");
			newLink.setAttribute("rel", "icon");
			head.appendChild(newLink);
			this.originalLinks.push({
				element: newLink,
				href: null,
				type: null,
				sizes: null,
				rel: "icon",
				created: true,
				parent: head,
				nextSibling: null,
			});
		}
	}

	public getBaseImageHref(): string | null {
		if (this.attachedState) {
			return (
				this.attachedState.element.getAttribute("src") ||
				this.attachedState.element.getAttribute("href")
			);
		}
		if (this.originalLinks.length > 0) {
			const last = this.originalLinks[this.originalLinks.length - 1];
			if (last?.element) {
				return last.element.getAttribute("href");
			}
		}
		return null;
	}

	public setIconSrc(url: string): void {
		if (this.dataUrlCallback) {
			this.dataUrlCallback(url);
		}

		if (this.attachedState) {
			const el = this.attachedState.element;
			if (el instanceof HTMLImageElement) {
				el.setAttribute("src", url);
			} else {
				el.setAttribute("href", url);
			}
		} else {
			for (const state of this.originalLinks) {
				if (state.element) {
					state.element.setAttribute("type", "image/png");
					state.element.setAttribute("href", url);
				}
			}
		}
	}

	public reset(): void {
		if (this.attachedState) {
			const el = this.attachedState.element;
			if (this.attachedState.src !== null) {
				el.setAttribute("src", this.attachedState.src);
			} else {
				el.removeAttribute("src");
			}

			if (this.attachedState.href !== null) {
				el.setAttribute("href", this.attachedState.href);
			} else {
				el.removeAttribute("href");
			}
		} else {
			for (const state of this.originalLinks) {
				if (!state.element) continue;
				if (state.href !== null) {
					state.element.setAttribute("href", state.href);
				} else {
					state.element.removeAttribute("href");
				}
				if (state.type !== null) {
					state.element.setAttribute("type", state.type);
				} else {
					state.element.removeAttribute("type");
				}
				if (state.sizes !== null) {
					state.element.setAttribute("sizes", state.sizes);
				} else {
					state.element.removeAttribute("sizes");
				}
				if (state.rel !== null) {
					state.element.setAttribute("rel", state.rel);
				} else {
					state.element.removeAttribute("rel");
				}

				if (!state.created && state.parent && !state.element.parentNode) {
					state.parent.insertBefore(state.element, state.nextSibling);
				}
			}
		}
	}

	public destroy(): void {
		this.reset();
		for (const state of this.originalLinks) {
			if (state.created && state.element?.parentNode) {
				state.element.parentNode.removeChild(state.element);
			}
		}
		this.originalLinks = [];
		this.attachedState = null;
	}
}
