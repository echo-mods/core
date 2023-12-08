const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('ipcRenderer', {
	finish_auth: (refresh_token) => ipcRenderer.invoke("finish_auth", refresh_token)
})