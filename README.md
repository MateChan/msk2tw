# msk2tw

MisskeyのWebhook機能を利用して、Misskeyでのノートを自動的にTwitterに転送します。

> このツールはTwitter WebAppのCookieを利用して、ブラウザに見せかけて投稿をおこないます。また、MisskeyのメディアURLをそのまま貼り付けて投稿します。
>
> これらのような、Twitter公式に認められていない手段を使ったり、FediverseのURLを投稿することによって、Twitterアカウントがロックされたり凍結されたりする可能性が無いとは言い切れません。
>
> 自己責任で使用してください。

## 使い方

### 環境変数の追加

Denoの環境変数に以下を追加します。

- `MISSKEY_WEBHOOK_SECRET`
  - MisskeyのWebhookで設定したシークレットを入力します。
- `TWITTER_AUTH_TOKEN`
- `TWITTER_CT0`
  - ブラウザでTwitterにログインし、Cookieから取得した`auth_token`と`ct0`の値を入力します。

Deno Deployで動かす場合は、プロジェクトの「Settings」→「Environment Variable」から、GUIで環境変数を設定してください。

ローカルで実行する場合は、以下の内容を記述した`.env`ファイルを作成して、`index.ts`と同じディレクトリに配置してください。

```ini
MISSKEY_WEBHOOK_SECRET=''
TWITTER_AUTH_TOKEN=''
TWITTER_CT0=''
```

### 実行

```sh
deno run --allow-net --allow-env --allow-read ./index.ts
```
