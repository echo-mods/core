import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { initStorage } from '../modules/storage'

const Storage = initStorage()

export const useSessionStore = defineStore('session', () => {
    const currentSection = ref(Storage.get("section") || "explore")
    const currentMod = ref(Storage.get("current_mod"))
    const installationPaths = ref(Storage.get("installation_paths"))
    const installations = ref()

    function savePath() {
        Storage.set("installation_paths", installationPaths)
    }

    return { currentSection, currentMod, installationPaths, installations, savePath }
})