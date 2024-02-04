import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { configDotenv } from "dotenv";
import { NsisUpdater } from "electron-updater"
import { fileURLToPath } from 'url';
import { exec } from 'node:child_process'
import path, { dirname } from "path";
import Store from "electron-store"
import AdmZip from "adm-zip"
import WebTorrent from "webtorrent"
configDotenv()
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { openExternal } = shell

const Storage = new Store();
Store.initRenderer()

app.setAsDefaultProtocolClient('echomods')

const Torrent = new WebTorrent();

let mainWindow
let currentlyInstalling
let auth_windows = []

const createWindow = async () => {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		minWidth: 800,
		minHeight: 600,
		autoHideMenuBar: true,
		titleBarStyle: "hidden",
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});
	mainWindow.maximize();
	mainWindow.loadFile("dist/index.html");


	// Set progress function
	const setProgress = (value) => mainWindow.setProgressBar(value)

	// Open deeplink if present
	if (process.argv.length > 1) {
		mainWindow.on("ready-to-show", () => {
			mainWindow.webContents.send("deeplink", {
				targetLink: process.argv[process.argv.length - 1],
			});
		});
	}

	// Build installation function
	const installBuild = async (magnet, installationPath, mod_id, build_id) => {
		return new Promise((resolve, reject) => {
			// Process state
			let extracting = false

			// Called during download
			const onTorrent = (download) => {
				// When torrent downloaded
				download.on("done", async () => {
					// Warn user about unresponsive application
					dialog.showMessageBox({
						title: "Предупреждение",
						message: "Пока мод устанавливается программа может не отвечать.",
						type: "warning"
					})
					// Prepate archive for unpacking
					const archivePath = path.resolve(installationPath, download.name)
					const archive = new AdmZip(archivePath);
					const entries = archive.getEntries()
					const entryCount = entries.length
					// Unpack
					extracting = true
					for (let i = 0; i < entryCount; i++) {
						try {
							const entry = entries[i];
							const relativePath = entry.entryName.substring(entry.entryName.indexOf('/') + 1);
							const destinationPath = `${installationPath}/${relativePath}`;
							if (!entry.isDirectory) archive.extractEntryTo(entry, destinationPath, true);
						} catch { }
						setProgress((i + 1) / entryCount)
					}
					extracting = false
					currentlyInstalling = undefined
					setProgress(-1)
					resolve()
				});
			};
			// Check if torrent is duplicate
			const torrents = Torrent.torrents
			for (let i = 0; i < torrents.length; i++) {
				if (torrents[i].magnetURI === magnet) return
			}
			// Start download
			Torrent.add(magnet, { path: installationPath }, onTorrent)
			currentlyInstalling = {
				mod_id,
				build_id,

			}
		})
	}
	// // TEST
	// console.log("Download start")
	// await installBuild("magnet:?xt=urn:btih:c3c9f18c2e21bb8820600380b4c540d3a3b47047&dn=TK.zip&tr=http%3A%2F%2Flocalhost%3A8000%2Fannounce", "C:/Users/andre/GitHub/core/test", 69, 420)
	// console.log("Done!")

	// Auth windows
	const closeAuthWindows = (event) => {
		auth_windows.forEach(win => {
			try {
				win.close()
			} catch { }
		})
		auth_windows = []
	}

	//////////////////
	// IPC HANDLERS //
	//////////////////

	ipcMain.handle(
		"start_auth",
		async (event) => {
			const auth_win = new BrowserWindow({
				width: 550,
				height: 650,
				frame: false,
				show: false,
				parent: mainWindow,
				modal: true,
				webPreferences: {
					preload: path.join(__dirname, 'preload.auth.js'),
				}
			})
			auth_win.loadURL('http://localhost:5173/auth/login?electron=true')
			auth_win.once('ready-to-show', () => {
				auth_win.show()
			})
			auth_windows.push(auth_win)
		}
	)
	ipcMain.handle("finish_auth", async (event, cred) => {
		mainWindow.webContents.send("authorize_client", cred)
		closeAuthWindows()
	})
	ipcMain.handle("close_auth_window", closeAuthWindows);

	// Window controls
	ipcMain.handle("minimise-app", () => {
		mainWindow.minimize();
	});
	ipcMain.handle("toggle-app", () => {
		if (mainWindow.isMaximized()) {
			mainWindow.restore();
		} else {
			mainWindow.maximize();
		}
	});
	ipcMain.handle("close-app", () => {
		mainWindow.close();
	});
	ipcMain.handle("set-progress", (event, value) => {
		setProgress(value)
	});
	ipcMain.handle(
		"install-build",
		installBuild
	)
	// URL handler
	ipcMain.handle("link", (event, link) => {
		openExternal(link);
	});

	ipcMain.handle("pick-installation-path", (event, game) => {
		let savePath = null;
		const games = {
			soc: "Тенью Чернобыля",
			cs: "Чистым Небом",
			cop: "Зовом Припяти",
		};
		try {
			savePath = dialog.showOpenDialogSync(mainWindow, {
				title: `Выберите папку с ${games[game]}`,
				properties: ["openDirectory"],
			})[0];
		} catch (err) {
			return;
		}
		return savePath;
	});
}


const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
	app.quit()
} else {
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		// Someone tried to run a second instance, we should focus our window.
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore()
			mainWindow.focus()
			mainWindow.webContents.send("deeplink", {
				targetLink: commandLine[commandLine.length - 1],
			});
		}
	})
	app.whenReady().then(() => {
		// Create window
		createWindow();
		app.on("activate", () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				createWindow();
			}
		});
		// Auto updates logic
		const autoUpdater = new NsisUpdater()
		autoUpdater.on('download-progress', (progressObj) => {
			const message = `Скачивание - ${progressObj.percent}%`
			mainWindow.webContents.send("au-downloaded", message)
		})
		autoUpdater.on('update-downloaded', (info) => {
			mainWindow.webContents.send("au-downloaded", true)
		});
		autoUpdater.checkForUpdatesAndNotify()
	});
}

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
