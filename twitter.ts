export const tweet = async (text: string, authToken: string, ct0: string) => {
    const url = 'https://twitter.com/i/api/graphql/tTsjMKyhajZvK4q76mpIBg/CreateTweet'
    const authorization = 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA'
    const body = {
        variables: {
            tweet_text: text
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
            tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
            responsive_web_media_download_video_enabled: false,
            responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
            responsive_web_graphql_timeline_navigation_enabled: true,
            responsive_web_enhance_cards_enabled: false
        }
    }
    return await fetch(url, {
        headers: {
            'content-type': 'application/json',
            'authorization': authorization,
            'x-csrf-token': ct0,
            'cookie': `auth_token=${authToken}; ct0=${ct0};`
        },
        body: JSON.stringify(body),
        method: 'POST',
    })
}
