export const tweet = async (text: string, authToken: string, ct0: string) => {
    const url = 'https://api.twitter.com/1.1/statuses/update.json'
    const authorization = 'Bearer AAAAAAAAAAAAAAAAAAAAAF7aAAAAAAAASCiRjWvh7R5wxaKkFp7MM%2BhYBqM%3DbQ0JPmjU9F6ZoMhDfI4uTNAaQuTDm2uO9x3WFVr2xBZ2nhjdP0'
    return await fetch(url, {
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': authorization,
            'x-csrf-token': ct0,
            'cookie': `auth_token=${authToken}; ct0=${ct0}`
        },
        body: `status=${text}`,
        method: 'POST'
    })
}
