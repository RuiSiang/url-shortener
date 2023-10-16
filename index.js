const fs = require('fs-extra')
const dotenv = require('dotenv')
const path = require('path')
const bodyParser = require('koa-bodyparser');
const validator = require('validator')

const Koa = require('koa')
const Router = require('@koa/router')

const app = new Koa()
const router = new Router()
app.use(bodyParser());

const urlMap = JSON.parse(fs.readFileSync('urls.json', 'utf-8'))
const newTemplate = fs.readFileSync(path.join(process.cwd(), 'render', 'new.html'), 'utf-8')
const externalTemplate = fs.readFileSync(path.join(process.cwd(), 'render', 'external.html'), 'utf-8')

dotenv.config()

router.get('/_', (ctx, next) => {
  ctx.body = newTemplate
})

const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const genRndStr = () => {
  let result = '';
  const charLength = chars.length;
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
}

router.post('/_', (ctx, next) => {
  if (ctx.request.body && ctx.request.body['auth'] && ctx.request.body['auth'] == process.env.AUTH) {
    if (ctx.request.body['url'] && validator.isURL(ctx.request.body['url'])) {
      const rndStr = genRndStr()
      urlMap[rndStr] = ctx.request.body['url']
      fs.writeFileSync('urls.json', JSON.stringify(urlMap), { charset: 'utf-8' })
      ctx.redirect(`/_${rndStr}`)
    } else {
      ctx.status = 401
      ctx.body = 'Invalid URL'
    }
  } else {
    ctx.status = 403
    ctx.body = 'Unauthorized'
  }
})

router.get(/^\/\_([a-kmnp-zA-HJ-NP-Z2-9]{4})/, (ctx, next) => {
  const token = ctx.url.slice(2)
  if (urlMap[token]) {
    console.log(ctx.request)
    ctx.body = externalTemplate.replace(/\{\{shortened\}\}/g, `${ctx.host}/_${token} `).replace(/\{\{url\}\}/g, urlMap[token])
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods())

const port = parseInt(process.env.PORT || '3000')
app.listen(port)
console.log(`URL shortener listening on port ${port}`)
