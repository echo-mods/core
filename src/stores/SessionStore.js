import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { initStorage } from '../modules/storage'

const Storage = initStorage()

export const useSessionStore = defineStore('session', () => {
    const currentSection = ref(Storage.get("section") || "explore")
    const OpenModID = ref(Storage.get("current_mod"))
    const installationPaths = ref(Storage.get("installation_paths"))
    const downloading = ref()
    const titleFrag = ref()

    function savePath() {
        Storage.set("installation_paths", installationPaths)
    }

    return { currentSection, OpenModID, installationPaths, downloading, savePath, titleFrag }
})