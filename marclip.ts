const encode = (str: string): string => {
    const arr = new TextEncoder().encode(str)
    const raw = String.fromCharCode(...arr)
    const b64 = btoa(raw)
    return String(b64 || '').replace(/[\+\/]/g, match => {
        return {
            '+': '-',
            '/': '_'
        }[match] || match
    }).replace(/=+$/, '')
}

export const marclipify = (cw: string, text: string) => {
    const url = 'https://matechan.com/marclip'
    const encodedText = encode(text)
    const param = new URLSearchParams({ 't': encodedText })
    return `${cw}\n${url}?${param.toString()}`
}