import { describe, expect, test, vi } from "vitest";
import { MediaController } from "../../src/core/media-controller";
import { Scheduler } from "../../src/core/scheduler";
import { MediaError } from "../../src/utils/errors";

describe("media-controller", () => {
	const mockRenderContext = {
		canvas: document.createElement("canvas"),
		context: { clearRect: vi.fn(), drawImage: vi.fn() } as any,
		width: 32,
		height: 32,
		baseImage: document.createElement("img"),
	};

	test("startWebcam throws if not supported", async () => {
		const scheduler = new Scheduler(window);
		const controller = new MediaController(
			scheduler,
			mockRenderContext,
			vi.fn(),
		);

		await expect(
			controller.startWebcam({ navigator: {} } as unknown as Window, 32, 32),
		).rejects.toThrow(MediaError);
	});

	test("startWebcam throws MediaError on permission denied", async () => {
		const scheduler = new Scheduler(window);
		const controller = new MediaController(
			scheduler,
			mockRenderContext,
			vi.fn(),
		);
		const win = {
			navigator: {
				mediaDevices: {
					getUserMedia: vi.fn().mockRejectedValue(new Error("Denied")),
				},
			},
		} as unknown as Window;

		await expect(controller.startWebcam(win, 32, 32)).rejects.toThrow(
			MediaError,
		);
	});

	test("startVideo starts loop if playing", async () => {
		const scheduler = new Scheduler(window);
		const controller = new MediaController(
			scheduler,
			mockRenderContext,
			vi.fn(),
		);
		const video = document.createElement("video");

		Object.defineProperty(video, "paused", { value: false });
		Object.defineProperty(video, "ended", { value: false });

		await controller.startVideo(video);
	});

	test("stop clears stream and handles", async () => {
		const scheduler = new Scheduler(window);
		const cancelFrameSpy = vi.spyOn(scheduler, "cancelFrame");
		const controller = new MediaController(
			scheduler,
			mockRenderContext,
			vi.fn(),
		);

		const video = document.createElement("video");
		Object.defineProperty(video, "paused", { value: false });
		Object.defineProperty(video, "ended", { value: false });

		await controller.startVideo(video);
		controller.stop();

		expect(cancelFrameSpy).toHaveBeenCalled();
	});
});
