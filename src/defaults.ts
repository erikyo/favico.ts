import type { FavicoOptions } from "./types";

export const defaultOptions: Omit<FavicoOptions, "window" | "win"> = {
	backgroundColor: "#d00",
	textColor: "#fff",
	fontFamily: "sans-serif",
	fontStyle: "bold",
	type: "circle",
	position: "down",
	animation: "slide",
	elementId: false,
	element: null,
	dataUrl: false,
	fallbackSize: 32,
};
