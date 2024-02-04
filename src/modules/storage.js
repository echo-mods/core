const StorageModule = require('electron-store'); 
let Storage = null

export const initStorage = () => {
    if (!Storage) {
        Storage = new StorageModule();
    }
    return Storage
}