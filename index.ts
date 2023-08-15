import { Hono } from 'https://deno.land/x/hono@v3.4.1/mod.ts'
import { load } from 'https://deno.land/std@0.198.0/dotenv/mod.ts'
import { Payload } from './types.ts'
import { tweet } from './twitter.ts'
import { marclipify } from './marclip.ts'

const timelog = (text: string) => {
    console.log(`${new Date().toLocaleString('ja-JP', { timeZone: 'JST' })}: ${text}`)
}

const env = await load()
const [secret, authToken, ct0] = [
    'MISSKEY_WEBHOOK_SECRET',
    'TWITTER_AUTH_TOKEN',
    'TWITTER_CT0'
].map(key => Deno.env.get(key) ?? env[key] ?? '')

const app = new Hono()

app.post('/', async c => {
    const requestSecret: string = c.req.header('X-Misskey-Hook-Secret') ?? ''
    if (requestSecret !== secret) {
        const msg = '403 Forbidden (Incorrect Secret)'
        timelog(msg)
        return c.text(msg, 403)
    }
    const payload: Payload = await c.req.json()
    const { text, cw, visibility, localOnly, files } = payload.body.note
    if (!['public', 'home'].includes(visibility) || localOnly) {
        const msg = `403 Forbidden (Post visibility: ${localOnly ? 'local only' : visibility})`
        timelog(msg)
        return c.text(msg, 403)
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
        const msg = '403 Forbidden (Empty content)'
        timelog(msg)
        return c.text(msg, 403)
    }
    const res = await tweet(cw ? marclipify(cw, tweetContent) : tweetContent, authToken, ct0)
    if (res.status === 200) {
        const msg = '200 OK (Successfully tweeted)'
        timelog(`${msg}\n${tweetContent}`)
        return c.text(msg, 200)
    } else if (res.status === 403) {
        const msg = '200 OK (Successfully tweeted)'
        timelog(`${msg}\n\n${tweetContent}`)
        return c.text('403 Forbidden (Error when tweeting)', 403)
    } else {
        const msg = '200 OK (Successfully tweeted)'
        timelog(`${msg}\n${tweetContent}`)
        return c.text('403 Forbidden (Unknown error)', 403)
    }
})

Deno.serve(app.fetch)
