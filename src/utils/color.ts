export interface RGB {
	r: number;
	g: number;
	b: number;
}

export function hexToRgb(hex: string): RGB | null {
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	const fullHex = hex.replace(
		shorthandRegex,
		(_m, r, g, b) => r + r + g + g + b + b,
	);
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);

	if (!result) return null;

	return {
		r: parseInt(result[1] as string, 16),
		g: parseInt(result[2] as string, 16),
		b: parseInt(result[3] as string, 16),
	};
}
