"use strict";

const fs = require("fs");
const path = require("path");

const superagent = require("superagent");
const Router = require("koa-router");

const { assertThat, defined, equalTo, is, not } = require("hamjest");
const { hasStatusCode, hasContentLength } = require("superjest");

const SimpleWeb = require("koa-simple-web");

const port = 10002;

const pkgPath = path.join(__dirname, "..", "package.json");
const pkgLength = fs.readFileSync(pkgPath).length.toString();

describe("stream length middleware", function() {
	let pkg;
	let web;

	before(async function() {
		const router = new Router();
		router.get("/", async (ctx) => {
			ctx.status = 200;

			// override the content type since we're returning a stream of json.
			ctx.type = "application/json; charset=utf-8";

			ctx.body = pkg;
		});

		web = new SimpleWeb({ port: port });
		web.use(require("../src/stream-length")());
		web.route(router);

		await web.start();
	});

	after(async function() {
		await web.stop();
	});

	beforeEach(function() {
		pkg = fs.createReadStream(pkgPath);
	});

	it("should return content length of file", function(done) {
		superagent
			.get(`http://localhost:${port}/`)
			.end((err, resp) => {
				assertThat(resp, hasStatusCode(200));
				assertThat(resp, hasContentLength(equalTo(pkgLength)));

				done();
			});
	});

	it("should return content length by delegating to stream", function(done) {
		delete pkg.path;
		pkg.calculateLength = async function() {
			return pkgLength;
		};

		superagent
			.get(`http://localhost:${port}/`)
			.end((err, resp) => {
				assertThat(resp, hasStatusCode(200));
				assertThat(resp, hasContentLength(equalTo(pkgLength)));

				done();
			});
	});

	it("should return -1 when length not determinable", function(done) {
		delete pkg.path;

		superagent
			.get(`http://localhost:${port}/`)
			.end((err, resp) => {
				// a negative content length response will cause a parsing error in superagent
				assertThat(err, is(defined()));
				assertThat(resp, is(not(defined())));

				done();
			});
	});
});
