<script setup>
import { ref } from "vue"
import { storeToRefs } from 'pinia';
import { askGamePath } from '../modules/mainProcessInteractions'
import { useSessionStore } from '../stores/SessionStore.js'
import { useIpcRenderer } from '@vueuse/electron'

const sessionStore = useSessionStore()
var ipcRenderer = useIpcRenderer()

const refreshing = ref(false)

if (!sessionStore.installationPaths) sessionStore.installationPaths = {}

const setGamePath = async (game) => {
    let pathToGame = await askGamePath(game)
    if (!pathToGame) { return }
    sessionStore.installationPaths[game] = pathToGame
    sessionStore.savePath()
    refreshing.value = true
    setTimeout(() => {
        refreshing.value = false
    }, 1);
}
</script>

<template>
    <div id="settings">
        <h2 class="heading">Пути установки</h2>
        <div class="game-paths" v-if="!refreshing">
            <h4>Тень чернобыля</h4>
            <button @click="setGamePath('soc')">{{ sessionStore.installationPaths["soc"] || "Путь не указан" }}</button>
            <h4>Чистое небо</h4>
            <button @click="setGamePath('cs')">{{ sessionStore.installationPaths["cs"] || "Путь не указан" }}</button>
            <h4>Зов припяти</h4>
            <button @click="setGamePath('cop')">{{ sessionStore.installationPaths["cop"] || "Путь не указан" }}</button>
        </div>
    </div>
</template>

<style scoped>
#settings {
    margin: 1.5rem;
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.01);
    height: calc(100% - 5rem);
    outline: 0.1rem rgba(255, 255, 255, 0.6) dashed;
    border-radius: 1rem;
    backdrop-filter: blur(1px);
    overflow: auto;
}

#settings .game-paths {
    display: flex;
    flex-direction: column;
    width: fit-content;
    gap: 1rem;
}

#settings .game-paths h4 {
    margin: 0;
}

#settings .game-paths button {
    text-align: left;
    color: rgb(185, 185, 185);
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 0.5rem;
    box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.3);
    padding: 0.6rem 1rem;
    transition: all 0.3s ease-in-out;
}

#settings .game-paths button:hover {
    box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.2);
}
</style>