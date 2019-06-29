"use strict";

const { Stream } = require("stream");
const fs = require("mz/fs");

module.exports = function() {
	return async (ctx, next) => {
		await next();

		if (ctx.body instanceof Stream) {
			if (ctx.body.calculateLength && typeof ctx.body.calculateLength === "function") {
				ctx.length = await ctx.body.calculateLength();

				return;
			}

			/*
			 * If there's a "path" property than the stream is considered a "file stream"
			 */
			if (ctx.body.path) {
				await fs.stat(ctx.body.path)
					.then((stats) => {
						ctx.length = stats.size
					})
					.catch(() => {
						ctx.length = -1
					});

				return;
			}

			// use -1 to show we can't determine what the content length is.
			ctx.length = -1;
		}
	}
};
