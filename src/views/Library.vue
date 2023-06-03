<script setup>
import { storeToRefs } from 'pinia';
import { useSessionStore } from '../stores/SessionStore.js'
import { useIpcRenderer } from '@vueuse/electron'
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
            if (percentage === 100) { mod.completed = true }
        }
    });
});

</script>

<template>
    <div id="library">
        <TransitionGroup name="views">
            <div v-for="mod in installations" :style="{ completed: mod.completed }">
                <img :src="`${mod.imageURL}`">
                <h2>{{ mod.name }}</h2>
                <h3 v-if="!mod.completed" v-html="`${mod.progress || 'Неизвестная ошибка...'}`"></h3>
                <h3 v-if="mod.completed" v-html="`<b>Установка завершена</b>`"></h3>
                <div class="progress" :style="{ width: mod.progressWidth }"></div>
            </div>
        </TransitionGroup>
        <h3 id="emptymsg" v-if="!installations || installations.length === 0">👀 Тут пусто...</h3>
    </div>
</template>

<style scoped>
#emptymsg {
    width: 100%;
    text-align: center;
}

#library {
    padding: 1rem;
}

#library > div {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-radius: 1rem;
    border: 2px rgba(255, 255, 255, 0.5) dashed;
    backdrop-filter: blur(1px);
    padding: 0.5rem;
    height: 6rem;
    overflow: hidden;
}

#library > div.completed .progress {
    background-color: rgba(115, 255, 0, 0.4);
    border: 0 transparent solid;
}

#library > div h3 {
    margin-left: auto;
    text-align: center;
}

#library > div img {
    height: 100%;
    border-radius: 0.5rem;
    box-shadow: 0 0 0.5rem 0.2rem rgba(0,0,0,0.5);
}

#library > div .progress {
    background-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 0 1.5rem 0.5rem rgba(255, 255, 255, 0.2);
    position: absolute;
    bottom: 0;
    left: 0;
    height: 100%;
    transition: all 0.3s;
    z-index: -1;
    border-right: 1px dashed rgba(255, 255, 255, 0.3);
}
</style>