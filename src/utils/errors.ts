export class FavicoError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FavicoError";
	}
}

export class EnvironmentError extends FavicoError {
	constructor(message: string) {
		super(message);
		this.name = "EnvironmentError";
	}
}

export class RenderError extends FavicoError {
	constructor(message: string) {
		super(message);
		this.name = "RenderError";
	}
}

export class ImageError extends FavicoError {
	constructor(message: string) {
		super(message);
		this.name = "ImageError";
	}
}

export class MediaError extends FavicoError {
	constructor(message: string) {
		super(message);
		this.name = "MediaError";
	}
}

export class InitializationError extends FavicoError {
	constructor(message: string) {
		super(message);
		this.name = "InitializationError";
	}
}
