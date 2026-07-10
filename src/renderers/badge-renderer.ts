import type { BadgeOptions, InternalOptions, RenderContext } from "../types";

function computeBadgeGeometry(
	opts: BadgeOptions,
	width: number,
	height: number,
): BadgeOptions {
	let len = 1;
	let n = opts.n;

	if (typeof n === "number") {
		if (Number.isNaN(n)) n = "";
		else if (n < 0) n = "";
		else if (n > 999) len = 3;
		else len = `${n}`.length;
	} else if (typeof n === "string") {
		len = n.length;
	} else {
		n = "";
		len = 0;
	}

	let { x, y, w, h, o } = opts;
	x = width * x;
	y = height * y;
	w = width * w;
	h = height * h;

	let _more = false;
	if (len === 2) {
		x = x - w * 0.4;
		w = w * 1.4;
		_more = true;
	} else if (len >= 3) {
		x = x - w * 0.65;
		w = w * 1.65;
		_more = true;
	}

	return { n, x, y, w, h, o, len };
}

export function renderBadge(
	ctx: RenderContext,
	opts: BadgeOptions,
	config: InternalOptions,
): void {
	const { context, width, height, baseImage } = ctx;
	const geom = computeBadgeGeometry(opts, width, height);

	context.clearRect(0, 0, width, height);
	context.drawImage(baseImage, 0, 0, width, height);

	context.beginPath();
	const fontMultiplier = typeof geom.n === "number" && geom.n > 99 ? 0.85 : 1;
	context.font = `${config.fontStyle} ${Math.floor(geom.h * fontMultiplier)}px ${config.fontFamily}`;
	context.textAlign = "center";

	if (config.type === "circle") {
		const more = geom.len && geom.len >= 2;
		if (more) {
			context.moveTo(geom.x + geom.w / 2, geom.y);
			context.lineTo(geom.x + geom.w - geom.h / 2, geom.y);
			context.quadraticCurveTo(
				geom.x + geom.w,
				geom.y,
				geom.x + geom.w,
				geom.y + geom.h / 2,
			);
			context.lineTo(geom.x + geom.w, geom.y + geom.h - geom.h / 2);
			context.quadraticCurveTo(
				geom.x + geom.w,
				geom.y + geom.h,
				geom.x + geom.w - geom.h / 2,
				geom.y + geom.h,
			);
			context.lineTo(geom.x + geom.h / 2, geom.y + geom.h);
			context.quadraticCurveTo(
				geom.x,
				geom.y + geom.h,
				geom.x,
				geom.y + geom.h - geom.h / 2,
			);
			context.lineTo(geom.x, geom.y + geom.h / 2);
			context.quadraticCurveTo(geom.x, geom.y, geom.x + geom.h / 2, geom.y);
		} else {
			context.arc(
				geom.x + geom.w / 2,
				geom.y + geom.h / 2,
				geom.h / 2,
				0,
				2 * Math.PI,
			);
		}
	} else {
		// rectangle
		context.rect(geom.x, geom.y, geom.w, geom.h);
	}

	const bg = config.backgroundColor;
	context.fillStyle = `rgba(${bg.r},${bg.g},${bg.b},${geom.o})`;
	context.fill();
	context.closePath();

	if (config.type === "circle") {
		context.beginPath();
		context.stroke();
		context.closePath();
	}

	const tc = config.textColor;
	context.fillStyle = `rgba(${tc.r},${tc.g},${tc.b},${geom.o})`;

	let displayText = geom.n;
	let textY = geom.y + geom.h - geom.h * 0.15;

	if (typeof geom.n === "number" && geom.n > 999) {
		displayText = `${geom.n > 9999 ? 9 : Math.floor(geom.n / 1000)}k+`;
		textY = geom.y + geom.h - geom.h * 0.2;
	}

	if (displayText !== "") {
		context.fillText(
			String(displayText),
			Math.floor(geom.x + geom.w / 2),
			Math.floor(textY),
		);
	}
}
