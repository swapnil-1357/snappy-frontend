export const timeAgo = (timestamp) => {
    const now = new Date()
    const secondsAgo = Math.floor((now - timestamp) / 1000)

    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 },
        { label: 'second', seconds: 1 }
    ]

    for (const interval of intervals) {
        const count = Math.floor(secondsAgo / interval.seconds)
        if (count > 0) {
            return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
        }
    }

    return 'just now'
}
