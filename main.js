const { app, BrowserWindow, dialog, ipcMain } = require('electron');
if (require('electron-squirrel-startup')) app.quit();
try {
    require('electron-reload')(__dirname+"/dist/assets");
} catch (error) { }
require('dotenv').config()
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip')

const Store = require('electron-store');
const { url } = require('inspector');
Store.initRenderer();

async function createWindow() {
    if (require('electron-squirrel-startup')) { return }
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        autoHideMenuBar: true,
        titleBarStyle: 'hidden',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    mainWindow.maximize();
    mainWindow.loadFile('dist/index.html')

    ipcMain.on('minimiseApp', () => {
        mainWindow.minimize()
    })
    ipcMain.on('toggleApp', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore()
        } else {
            mainWindow.maximize()
        }
    })
    ipcMain.on('closeApp', () => {
        mainWindow.close()
    })
    ipcMain.handle('downloadAndInstallMod', async (event, modData, savePath) => {
        const { downloadURL, archive_type, standalone } = modData
        if (savePath == null) {
            try {
                savePath = dialog.showOpenDialogSync(mainWindow, {
                    title: "Выберите папку с игрой для установки мода",
                    properties: ["openDirectory"],
                })[0];
            } catch {
                return;
            }
        }
        const resolvedPath = path.resolve(savePath);
        const { promisify } = require("util");
        const finished = promisify(require("stream").finished);
        const splitURL = downloadURL.split(".")
        const archiveName = `installation_${modData.id}.${archive_type || "zip"}`
        const writer = fs.createWriteStream(`${resolvedPath}/${archiveName}`);
        try {
            // Import node-fetch using a dynamic import statement
            const fetch = (await import("node-fetch")).default;
            const response = await fetch(downloadURL);
            const totalBytes = parseInt(response.headers.get("content-length"), 10);
            let downloadedBytes = 0;

            response.body.on("data", (chunk) => {
                try {
                    downloadedBytes += chunk.length;
                    const percentage = (downloadedBytes / totalBytes) * 100;
                    event.sender.send("download-progress", percentage, modData.id, downloadedBytes);
                    mainWindow.setProgressBar(percentage / 100)
                } catch (error) {
                    console.error(error)
                }
            });

            response.body.pipe(writer);
            await finished(writer);
            // Remove progress bar

            const zip = new AdmZip(`${resolvedPath}/${archiveName}`);
            const entries = zip.getEntries();
            const totalEntries = entries.length;
            let entriesExtracted = 0;
            const overwrittenFiles = [];
            // Extracton message for client
            event.sender.send("extract-progress", 0);
            mainWindow.setProgressBar(0)
            zip.extractAllToAsync(
                resolvedPath,
                true,
                (entry, zipEntry) => {
                    entriesExtracted++;
                    const progress = Math.round((entriesExtracted / totalEntries) * 100);
                    event.sender.send("extract-progress", modData.id, progress);
                    mainWindow.setProgressBar(progress / 100);
                },
                (error) => {
                    if (error) {
                        console.error(`Error extracting zip file: ${error}`);
                    } else {
                        event.sender.send("extract-progress", 100);
                    }
                },
                overwrittenFiles
            );
            mainWindow.setProgressBar(-1)
            fs.unlinkSync(`${resolvedPath}/${archiveName}`); // delete the zip file
            
            // Remember installation
            
            
            return true;
        } catch (error) {
            console.log("Installation error -", error)
            return error
        }
    });


    ipcMain.handle('settings_pickInstallationPath', (event, game) => {
        let savePath = null
        const games = {
            soc: "ТЧ",
            cs: "ЧН",
            cop: "ЗП"
        }
        try {
            savePath = dialog.showOpenDialogSync(mainWindow, {
                title: `Выберите папку с ${games[game]}`,
                properties: ['openDirectory']
            })[0];
        } catch (err) { return }
        return savePath
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})