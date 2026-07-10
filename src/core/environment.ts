export function isBrowser(win?: Window): boolean {
	const targetWin = win || (typeof window !== "undefined" ? window : undefined);
	return (
		typeof targetWin !== "undefined" &&
		typeof targetWin.document !== "undefined"
	);
}

export function checkBrowserSupport(win?: Window): boolean {
	if (!isBrowser(win)) return false;
	const targetWin = win || window;

	try {
		const canvas = targetWin.document.createElement("canvas");
		return !!canvas.getContext?.("2d");
	} catch (_e) {
		return false;
	}
}

export function isPageHidden(win?: Window): boolean {
	if (!isBrowser(win)) return false;
	const doc = (win || window).document as Document & {
		msHidden?: boolean;
		webkitHidden?: boolean;
		mozHidden?: boolean;
	};
	return !!(doc.hidden || doc.msHidden || doc.webkitHidden || doc.mozHidden);
}
