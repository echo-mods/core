import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { initStorage } from '../modules/storage'

const Storage = initStorage()

export const useSessionStore = defineStore('session', () => {
    const currentSection = ref("explore")
    const currentMod = ref()
    const installationPaths = ref(Storage.get("installation_paths"))
    const installations = ref()

    function savePath() {
        Storage.set("installation_paths", installationPaths)
    }

    return { currentSection, currentMod, installationPaths, installations, savePath }
})