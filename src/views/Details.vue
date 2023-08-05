<script setup>
import { ref, onMounted } from 'vue'
import ContentSlideshow from '../components/ContentSlideshow.vue';
import { askGamePath } from '../modules/mainProcessInteractions'
import { storeToRefs } from 'pinia';
import { useSessionStore } from '../stores/SessionStore.js'
import { useIpcRenderer } from '@vueuse/electron'

// Other imports
import { Icon } from '@iconify/vue';

var ipcRenderer = useIpcRenderer()

const sessionStore = useSessionStore()
const { currentSection, currentMod, installationPaths, installations } = storeToRefs(sessionStore)

const downloadAndInstallMod = (path) => {
    const modData = JSON.parse(JSON.stringify(currentMod.value))
    const success = ipcRenderer.invoke('downloadAndInstallMod', modData, path)
    if (!installations.value) { installations.value = [] }
    installations.value.push(modData)
    currentSection.value = "library"
    if (success === "path") { sessionStore.installationPaths[currentMod.value.game_required] = undefined }
}

const installMod = async () => {
    const gameID = currentMod.value.game_required
    var installationPath = installationPaths.value[gameID]
    if (currentMod) {
        if (!currentMod.standalone && installationPath == null) {
            const pathToGame = await askGamePath(gameID)
            if (!pathToGame) { return }
            installationPaths.value[gameID] = pathToGame
            installationPath = pathToGame
            sessionStore.savePath()
        }
        if (!installationPath) { return }
        downloadAndInstallMod(installationPath)
    }
}

</script>

<template>
    <div id="details">
        <div class="container">
            <ContentSlideshow :content="currentMod.content" />
            <div class="info">
                <p class="description">{{ currentMod.description }}</p>
                <div class="mini-info">
                    <p class="rating">
                        <Icon icon="streamline:interface-favorite-like-1-reward-social-up-rating-media-like-thumb-hand"/>
                        {{ currentMod.rating }} / 10
                    </p>
                    <p class="platform">
                        <Icon icon="eos-icons:installing"/>
                        {{ currentMod.platform }}
                    </p>
                    <button class="install" @click="installMod">
                        Установить
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#details {
    width: 100%;
    min-height: 100%;
    backdrop-filter: blur(1px);
    padding-bottom: 2rem;
}

#details p {
    color: white;
    font-family: sans-serif;
}

#details .container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

#details .info {
    width: 70%;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

#details .description {
    width: calc(100% - 11rem);
}

#details .mini-info {
    width: 8rem;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background-color: rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

#details .mini-info>p {
    margin: 0.5rem 0;
}

#details .mini-info>button {
    color: white;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 0.5rem;
    box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.3);
    padding: 0.6rem 0.4rem;
    transition: all 0.3s;
}

#details .mini-info>button:hover {
    box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.2);
}
</style>