import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import { configDotenv } from "dotenv";
import updater from "electron-updater"
import path from "path";
import fs from "fs"
import Store from "electron-store"

configDotenv()
const { openExternal } = shell
Store.initRenderer();

updater.autoUpdater.checkForUpdatesAndNotify()

app.setAsDefaultProtocolClient('echomods')

const gotTheLock = app.requestSingleInstanceLock()

let mainWindow
async function createWindow() {
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

	const closeAuthWindows = (event) => {
		auth_windows.forEach(win => {
			try {
				win.close()
			} catch { }
		})
		auth_windows = []
	}

	let auth_windows = []

	mainWindow.maximize();
	mainWindow.loadFile("dist/index.html");

	if (process.argv.length > 1) {
		mainWindow.on("ready-to-show", () => {
			mainWindow.webContents.send("deeplink", {
				targetLink: process.argv[process.argv.length - 1],
			});
		});
	}

	ipcMain.on("minimiseApp", () => {
		mainWindow.minimize();
	});
	ipcMain.on("toggleApp", () => {
		if (mainWindow.isMaximized()) {
			mainWindow.restore();
		} else {
			mainWindow.maximize();
		}
	});
	ipcMain.on("closeApp", () => {
		mainWindow.close();
	});
	ipcMain.handle("set_progress", (event, value) => {
		mainWindow.setProgressBar(value)
	});
	ipcMain.handle(
		"install_build",
		async (event, build, savePath, fileName, buffer) => {
			const filePath = path.resolve(savePath, fileName)
			await fs.mkdirSync(savePath, { recursive: true })
			await fs.writeFileSync(filePath, buffer);
		}
	)
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
					contextIsolation: false,
					preload: path.resolve('preload.js'),
				}
			})
			auth_win.loadURL('https://echomods.vercel.app/auth/login?electron=true')
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
	ipcMain.handle("is_electron", (event, link) => {
		return true
	});
	ipcMain.handle("close_auth_window", closeAuthWindows);
	ipcMain.handle("link", (event, link) => {
		openExternal(link);
	});

	ipcMain.handle("settings_pickInstallationPath", (event, game) => {
		let savePath = null;
		const games = {
			soc: "ТЧ",
			cs: "ЧН",
			cop: "ЗП",
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
		createWindow();
		app.on("activate", () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				createWindow();
			}
		});
	});
}

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
