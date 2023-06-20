export const fetchAPI = async (url) => {
    const apiServer = "localhost:3001" //"mod-manager.onrender.com"
    try {
        const response = await fetch(`http://${apiServer}/api${url}`)
        const result = await response.json()
        return result
    } catch (err) { return undefined }
}