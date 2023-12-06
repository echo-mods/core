const electron = require('electron');

process.once('loaded', () => {
	globalThis.ipcRenderer = electron.ipcRenderer;
});