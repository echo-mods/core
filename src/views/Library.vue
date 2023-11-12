<script setup>
import { ref } from "vue"
import { storeToRefs } from 'pinia';
import { useSessionStore } from '../stores/SessionStore.js'
import { useIpcRenderer } from '@vueuse/electron'
import { Icon } from "@iconify/vue"
var ipcRenderer = useIpcRenderer()
const sessionStore = useSessionStore()

function formatSizeUnits(bytes){
    if      (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + " GB"; }
    else if (bytes >= 1048576)    { bytes = (bytes / 1048576).toFixed(2) + " MB"; }
    else if (bytes >= 1024)       { bytes = (bytes / 1024).toFixed(2) + " KB"; }
    else if (bytes > 1)           { bytes = bytes + " bytes"; }
    else if (bytes == 1)          { bytes = bytes + " byte"; }
    else                          { bytes = "0 bytes"; }
    return bytes;
}

const { installations } = storeToRefs(sessionStore)

ipcRenderer.on('download-progress', (event, percentage, modID, downloadedBytes) => {
    installations.value.forEach(mod => {
        if (mod.id == modID) {
            mod.progress = `Загрузка - ${Math.round(percentage)}%<br>(${formatSizeUnits(downloadedBytes)})`
            mod.progressWidth = `${percentage}%`
        }
    });
});
  
ipcRenderer.on('extract-progress', (event, modID, percentage) => {
    installations.value.forEach(mod => {
        if (mod.id == modID) {
            mod.progress = `Распаковка - ${Math.round(percentage)}%`
            mod.progressWidth = `${percentage}%`
            if (percentage === 100) { setTimeout(() => {
                mod.completed = true
            }, 1000); }
        }
    });
});

const removeIndex = (index) => {
    installations.value.splice(index, 1)
}

</script>

<template>
    <div id="library">
        <div id="installations">
            <h2>Установки</h2>
            <TransitionGroup name="inst-cards">
                <div class="mod-installation" v-for="(mod, index) in installations" :class="{ completed: mod.completed }" key="index">
                    <h2>{{ mod.name }}</h2>
                    <h3 v-if="!mod.completed" v-html="`${mod.progress || '...'}`"></h3>
                    <div class="completed-indicator" v-else>
                        <Icon icon="line-md:confirm-circle-twotone"/>
                        <button @click="removeIndex(index)">
                            <Icon icon="mdi:close"/>
                        </button>
                    </div>
                    <div class="progress" :style="{ width: mod.progressWidth }"></div>
                </div>
                <h3 v-if="installations.length === 0">Тут пусто</h3>
            </TransitionGroup>
        </div>
    </div>
</template>

<style scoped>

#library {
    padding: 1rem;
    display: flex;
    gap: 1rem;
}

#installations {
    width: 25%;
    min-width: fit-content;
    border-right: 1px solid rgba(255,255,255,0.2);
    border-left: 1px solid rgba(255,255,255,0.2);
    border-radius: 0.5rem;
    padding: 1rem;
    height: calc(100vh - 6rem);
}

#installations > h2 {
    text-align: center;
}

#installations > h3 {
    position: absolute;
    text-align: center;
}

#installations > div {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-radius: 1rem;
    border: 1px rgba(255, 255, 255, 0.3) solid;
    backdrop-filter: blur(1px);
    padding: 0.5rem;
    height: 3rem;
    overflow: hidden;
}

#installations > div h3 {
    margin-left: auto;
    text-align: center;
}

#installations > div .progress {
    backdrop-filter: blur(1rem);
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 1.5rem 0.5rem rgba(255, 255, 255, 0.2);
    position: absolute;
    bottom: 0;
    left: 0;
    height: 100%;
    transition: all 0.3s;
    z-index: -1;
    border-right: 1px solid rgba(255, 255, 255, 0.3);
}

#installations > div.completed .progress {
    opacity: 0;
    border: 0 transparent solid;
}

#installations > div > .completed-indicator {
    margin-left: auto;
    display: flex;
    gap: 0.5rem;
}

#installations > div > .completed-indicator > button {
    background: none;
    border: none;
    cursor: pointer;
}

#installations > div > .completed-indicator svg {
    height: 1.75rem;
    transform: translateY(15%);
}

.inst-cards-enter-from,
.inst-cards-leave-to {
    opacity: 0;
    translate: -2rem 0;
}

.inst-cards-enter-active,
.inst-cards-leave-active {
    transition: all 0.3s;
}
</style>