const StorageModule = require('electron-store'); 
var Storage = null

export const initStorage = () => {
    if (!Storage) {
        Storage = new StorageModule();
    }
    return Storage
}