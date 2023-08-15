import { Hono } from 'https://deno.land/x/hono@v3.4.1/mod.ts'
import { load } from 'https://deno.land/std@0.198.0/dotenv/mod.ts'
import { Payload } from './types.ts'
import { tweet } from './twitter.ts'
import { marclipify } from './marclip.ts'

const env = await load()
const [secret, authToken, ct0] = [
    'MISSKEY_WEBHOOK_SECRET',
    'TWITTER_AUTH_TOKEN',
    'TWITTER_CT0'
].map(key => Deno.env.get(key) ?? env[key] ?? '')

console.log({ secret, authToken, ct0 })

const app = new Hono()

app.post('/', async c => {
    const requestSecret: string = c.req.header('X-Misskey-Hook-Secret') ?? ''
    if (requestSecret !== secret) {
        return c.text('403 Forbidden (Incorrect Secret)', 403)
    }
    const payload: Payload = await c.req.json()
    console.log(payload)
    const { text, cw, visibility, localOnly, files } = payload.body.note
    if (!['public', 'home'].includes(visibility) || localOnly) {
        return c.text(`403 Forbidden (Post visibility: ${localOnly ? 'local only' : visibility})`)
    }
    const filesStr: string = (files ?? []).reduce((p, c, i) => {
        return p + `\n${(() => {
            if (!c.type.includes('image')) {
                return `📄 ${c.url}`
            } else if (cw) {
                return `\n![image ${i + 1}](${c.url})`
            } else {
                return `🖼 ${c.url}`
            }
        })()}`
    }, '')
    const tweetContent = ((text ?? '') + filesStr).replaceAll('\n', '  \n')
    if (!tweetContent) {
        return c.text('403 Forbidden (Empty text)', 403)
    }
    console.log(marclipify(cw || '', tweetContent))
    const res = await tweet(cw ? marclipify(cw, tweetContent) : tweetContent, authToken, ct0)
    if (res.status === 200) {
        return c.text('200 OK (Successfully tweeted)', 200)
    } else if (res.status === 403) {
        return c.text('403 Forbidden (Error when tweeting)', 403)
    } else {
        return c.text('403 Forbidden (Unknown error)', 403)
    }
})

Deno.serve(app.fetch)
