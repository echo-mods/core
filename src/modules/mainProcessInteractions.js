import { useIpcRenderer } from '@vueuse/electron'

let ipcRenderer = useIpcRenderer()

export const askGamePath = async (game) => {
	const pathToGame = await ipcRenderer.invoke('pick-installation-path', game)
	return new Promise((resolve) => {
		let wait = setInterval(() => {
			if (pathToGame.value !== null) {
				clearInterval(wait)
				resolve(pathToGame.value)
			}
		}, 100);
	})
}

export const openExternal = async (link) => {
	await ipcRenderer.invoke('link', link)
}