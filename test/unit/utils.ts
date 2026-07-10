import { vi } from "vitest";

export function createMockContext() {
	return {
		clearRect: vi.fn(),
		drawImage: vi.fn(),
		beginPath: vi.fn(),
		moveTo: vi.fn(),
		lineTo: vi.fn(),
		quadraticCurveTo: vi.fn(),
		arc: vi.fn(),
		rect: vi.fn(),
		fill: vi.fn(),
		stroke: vi.fn(),
		closePath: vi.fn(),
		fillText: vi.fn(),
		font: "",
		textAlign: "",
		fillStyle: "",
	} as unknown as CanvasRenderingContext2D;
}
