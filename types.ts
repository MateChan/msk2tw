export type Payload = {
    body: {
        note: Note
    }
}

type Note = {
    text: string | null
    cw: string | null
    visibility: 'public' | 'home' | 'followers' | 'specified'
    localOnly: boolean
    files: File[]
}

type File = {
    url: string
    type: string
}
