import { Hono } from "hono/mod.ts";
import { Payload } from "./types.ts";
import { tweet, uploadMediaFromURL } from "./twitter.ts";

const timelog = (text: string, content?: string) => {
  console.log(
    `${new Date().toLocaleString("ja-JP", { timeZone: "JST" })}: ${text}\n${
      content?.replace(/^/gm, "> ") ?? ""
    }`,
  );
};

const [secret, authToken, ct0] = [
  "MISSKEY_WEBHOOK_SECRET",
  "TWITTER_AUTH_TOKEN",
  "TWITTER_CT0",
].map((key) => Deno.env.get(key) ?? "");

const app = new Hono();

app.post("/", async (c) => {
  const requestSecret: string = c.req.header("X-Misskey-Hook-Secret") ?? "";
  if (requestSecret !== secret) {
    const msg = "wrong secret";
    timelog(msg);
    return c.text(msg, 403);
  }
  const payload: Payload = await c.req.json();
  const { text, cw, visibility, localOnly, files } = payload.body.note;
  if (localOnly) {
    const msg = `post visibility: "local only"`;
    timelog(msg);
    return c.text(msg, 403);
  }
  if (visibility !== "public" && visibility !== "home") {
    const msg = `post visibility: "${visibility}"`;
    timelog(msg);
    return c.text(msg, 403);
  }
  const uploadableImages = (files ?? []).filter((f) =>
    f.type === "image/jpeg" || f.type === "image/png" ||
    f.type === "image/webp"
  );
  const uploadableVideos = (files ?? []).filter((f) =>
    f.type === "image/gif" || f.type === "video/mp4"
  );
  const [uploadFiles, unuploadFiles] = uploadableVideos.length > 0
    ? [
      uploadableImages.slice(0, 1),
      [
        ...uploadableImages,
        ...uploadableVideos.slice(1),
      ],
    ]
    : [
      uploadableImages.slice(0, 4),
      [
        ...uploadableImages.slice(4),
        ...uploadableVideos,
      ],
    ];
  const mediaIds = await Promise.all(
    uploadFiles.map(async (file) =>
      await uploadMediaFromURL(file.url, file.type, authToken, ct0)
    ),
  );

  const filesStr: string = [
    ...unuploadFiles,
    ...(files ?? []).filter((f) =>
      !(f.type.includes("image") || f.type === "video/mp4")
    ),
  ].reduce((p: string, c) => {
    return `${p}\n${c.type.includes("image") ? "🖼" : "📄"} ${c.url}`;
  }, "");
  const tweetContent = (cw ? `${cw}...\n\n` : "") + (text ?? "") + filesStr;
  if (!tweetContent) {
    const msg = "empty content";
    timelog(msg);
    return c.text(msg, 403);
  }
  const res = await tweet(tweetContent, authToken, ct0, mediaIds);
  if (res.status === 200) {
    const msg = "successfully tweeted";
    timelog(msg, tweetContent);
    return c.text(msg, 200);
  }
  const msg = "error while tweeting";
  timelog(msg, tweetContent);
  return c.text(msg, 403);
});

Deno.serve(app.fetch);
