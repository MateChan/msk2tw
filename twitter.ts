import { match } from "https://deno.land/x/pattern_match@1.0.0-beta.3/mod.ts";
import { CreateTweetRequest } from "./types.ts";

export const tweet = async (
  text: string,
  authToken: string,
  ct0: string,
  mediaIds?: string[],
) => {
  const url =
    "https://twitter.com/i/api/graphql/tTsjMKyhajZvK4q76mpIBg/CreateTweet";
  const authorization =
    "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";
  const body: CreateTweetRequest = {
    variables: {
      tweet_text: text,
    },
    features: {
      tweetypie_unmention_optimization_enabled: true,
      responsive_web_edit_tweet_api_enabled: true,
      graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
      view_counts_everywhere_api_enabled: true,
      longform_notetweets_consumption_enabled: true,
      responsive_web_twitter_article_tweet_consumption_enabled: false,
      tweet_awards_web_tipping_enabled: false,
      longform_notetweets_rich_text_read_enabled: true,
      longform_notetweets_inline_media_enabled: true,
      responsive_web_graphql_exclude_directive_enabled: true,
      verified_phone_label_enabled: false,
      freedom_of_speech_not_reach_fetch_enabled: true,
      standardized_nudges_misinfo: true,
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
        true,
      responsive_web_media_download_video_enabled: false,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_enhance_cards_enabled: false,
    },
  };
  if (mediaIds) {
    body.variables.media = {
      "media_entities": mediaIds.map((mediaId) => (
        {
          "media_id": mediaId,
          "tagged_users": [],
        }
      )),
      "possibly_sensitive": false,
    };
  }

  return await fetch(url, {
    headers: {
      "content-type": "application/json",
      "authorization": authorization,
      "x-csrf-token": ct0,
      "cookie": `auth_token=${authToken}; ct0=${ct0};`,
    },
    body: JSON.stringify(body),
    method: "POST",
  });
};

export const uploadMediaFromURL = async (
  mediaURL: string,
  type: string,
  authToken: string,
  ct0: string,
) => {
  const authorization =
    "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA";

  const res = await fetch(mediaURL);
  const blob = await res.blob();
  const mediaType = match(type, {
    "image/jpeg": () => "tweet_image",
    "image/png": () => "tweet_image",
    "image/webp": () => "tweet_image",
    "image/gif": () => "tweet_gif",
    "video/mp4": () => "tweet_video",

    [match._]: () => {
      throw new Error(`Unsupported media type: ${type}`);
    },
  });

  const initURL =
    `https://upload.twitter.com/i/media/upload.json?command=INIT&total_bytes=${blob.size}&media_type=${
      encodeURIComponent(type)
    }&media_category=${mediaType}`;

  // メディアアップロードを宣言する
  const uploadInitRes = await fetch(initURL, {
    method: "POST",
    headers: {
      "authorization": authorization,
      "x-csrf-token": ct0,
      "cookie": `auth_token=${authToken}; ct0=${ct0};`,
      "Origin": "https://twitter.com",
    },
  });
  if (!uploadInitRes.ok) {
    throw new Error("Failed to initialize upload");
  }
  const mediaInfo: { media_id_string: string } = await uploadInitRes.json();

  // 5MBごとに分割してアップロード
  const chunkSize = 5 * 1024 * 1024;
  const chunks = [];
  for (let i = 0; i < blob.size; i += chunkSize) {
    chunks.push(blob.slice(i, i + chunkSize));
  }

  await Promise.all(chunks.map(async (chunk, index) => {
    const appendURL =
      `https://upload.twitter.com/i/media/upload.json?command=APPEND&media_id=${mediaInfo.media_id_string}&segment_index=${index}`;
    const body = new FormData();
    body.append("media", chunk);
    const uploadAppendRes = await fetch(appendURL, {
      method: "POST",
      body,
      headers: {
        "authorization": authorization,
        "x-csrf-token": ct0,
        "cookie": `auth_token=${authToken}; ct0=${ct0};`,
        "Origin": "https://twitter.com",
      },
    });
    if (!uploadAppendRes.ok) {
      throw new Error(`Failed to upload chunk ${index}`);
    }
  }));

  // アップロード完了
  const finalizeURL =
    `https://upload.twitter.com/i/media/upload.json?command=FINALIZE&media_id=${mediaInfo.media_id_string}`;
  const uploadFinalizeRes = await fetch(finalizeURL, {
    method: "POST",
    headers: {
      "authorization": authorization,
      "x-csrf-token": ct0,
      "cookie": `auth_token=${authToken}; ct0=${ct0};`,
      "Origin": "https://twitter.com",
    },
  });
  if (!uploadFinalizeRes.ok) {
    throw new Error("Failed to finalize upload");
  }

  return mediaInfo.media_id_string;
};
