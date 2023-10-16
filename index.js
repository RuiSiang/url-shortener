const fs = require('fs-extra')
const dotenv = require('dotenv')

const Koa = require('koa');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();
const urlMap = JSON.parse(fs.readFileSync('urls.json', 'utf-8'))
const template = fs.readFileSync('render.html', 'utf-8')

dotenv.config()

router.get('/_', (ctx, next) => {
  console.log('test')
});

router.get(/^\/\_([a-kmnp-zA-HJ-Z2-9]{4})/, (ctx, next) => {
  const token = ctx.url.slice(2)
  if (urlMap[token]) {
    ctx.body = template.replace(/\{\{url\}\}/g, urlMap[token])
  }
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const port = parseInt(process.env.PORT || '3000')
app.listen(port);
console.log(`URL shortener listening on port ${port}`)