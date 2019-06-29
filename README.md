# koa-stream-length

Middleware to set content length value for a stream

## Usage

```bash
$ npm install koa-stream-length
```

```javascript
const web = createKoa();
web.use(require("koa-stream-length")());

/*
 * In your route/middleware set the response to a stream
 */
const route = async (ctx) => {
  ctx.body = createSomeStream();
}
```

## Calculating length

If the stream has a `calculateLength` (async) function then that function is called to return the length of the stream.

If the body stream has a `path` property, it is treated like a file stream and the file is stat'd for it's size.

## See

`koa-simple-web` for a simple way to run a Koa server.
