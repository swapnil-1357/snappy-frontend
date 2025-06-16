import { v4 as uuidv4 } from 'uuid'

export const generateShortUniqueId = () => {
    const uuid = uuidv4()
    const shortId = uuid.replace(/-/g, '').substring(0, 8)
    return shortId
}

