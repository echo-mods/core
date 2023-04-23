export const fetchAPI = async (url) => {
    const apiServer = "mod-manager.onrender.com"
    try {
        const response = await fetch(`https://${apiServer}/api${url}`)
        const result = await response.json()
        return result
    } catch (err) { return undefined }
}