export class Scheduler {
	private window: Window;
	private animHandles: Set<number> = new Set();
	private timeoutHandles: Set<ReturnType<typeof setTimeout>> = new Set();

	constructor(windowObject: Window) {
		this.window = windowObject;
	}

	public requestFrame(callback: () => void): number {
		const handle = this.window.requestAnimationFrame(() => {
			this.animHandles.delete(handle);
			callback();
		});
		this.animHandles.add(handle);
		return handle;
	}

	public cancelFrame(handle: number): void {
		this.window.cancelAnimationFrame(handle);
		this.animHandles.delete(handle);
	}

	public setTimeout(
		callback: () => void,
		ms: number,
	): ReturnType<typeof setTimeout> {
		const handle = setTimeout(() => {
			this.timeoutHandles.delete(handle);
			callback();
		}, ms);
		this.timeoutHandles.add(handle);
		return handle;
	}

	public clearTimeout(handle: ReturnType<typeof setTimeout>): void {
		clearTimeout(handle);
		this.timeoutHandles.delete(handle);
	}

	public clear(): void {
		for (const handle of this.animHandles) {
			this.window.cancelAnimationFrame(handle);
		}
		this.animHandles.clear();

		for (const handle of this.timeoutHandles) {
			clearTimeout(handle);
		}
		this.timeoutHandles.clear();
	}
}
