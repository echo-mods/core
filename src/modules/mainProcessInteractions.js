import { useIpcRenderer } from '@vueuse/electron'

let ipcRenderer

export const askGamePath = async (game) => {
  if (!ipcRenderer) {
    ipcRenderer = useIpcRenderer()
  }
  const pathToGame = await ipcRenderer.invoke('settings_pickInstallationPath', game)
  return new Promise((resolve) => {
    let wait = setInterval(() => {
      if (pathToGame.value !== null) {
        clearInterval(wait)
        resolve(pathToGame.value)
      }
    }, 100);
  })
}