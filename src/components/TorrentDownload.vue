<script setup>
import { Icon } from "@iconify/vue";
import { useIpcRenderer } from "@vueuse/electron";
import { onMounted, reactive, defineProps } from "vue";
import { askGamePath } from "../modules/mainProcessInteractions";
import { useSessionStore } from "../stores/SessionStore.js";
import { storeToRefs } from "pinia";

const props = defineProps({
    magnet: String,
    mod: Object,
    build: Object,
});

const { magnet, mod, build } = props;

const sessionStore = useSessionStore();
const { installationPaths } = storeToRefs(sessionStore);

const ipcRenderer = useIpcRenderer();

let torrent = reactive({
    name: "",
    infoHash: "",
    magnetURI: "",
    timeRemaining: 0,
    downloaded: 0,
    downloadSpeed: 0,
    numPeers: 0,
    ready: false,
    done: false,
    progress: 0,
    uploadSpeed: 0,
});

const torrentKeys = Object.keys(torrent);

ipcRenderer.on("torrent-progress", (event, check, download) => {
	if (check === magnet) {
		torrentKeys.forEach((key) => (torrent[key] = download[key]));
    }
});

const formatSizeUnits = (bytes) => {
    if (bytes >= 1073741824) {
        bytes = (bytes / 1073741824).toFixed(2) + " ГБ";
    } else if (bytes >= 1048576) {
        bytes = (bytes / 1048576).toFixed(2) + " МБ";
    } else if (bytes >= 1024) {
        bytes = (bytes / 1024).toFixed(2) + " КБ";
    } else if (bytes > 1) {
        bytes = bytes + " байт";
    } else if (bytes == 1) {
        bytes = bytes + " байт";
    } else {
        bytes = "0 байт";
    }
    return bytes;
};

onMounted(async () => {
    const gameID = mod.platform;
    let installationPath = installationPaths.value[gameID];
    if (!mod.standalone && installationPath == null) {
        const pathToGame = await askGamePath(gameID);
        if (!pathToGame) {
            return;
        }
        installationPaths.value[gameID] = pathToGame;
        installationPath = pathToGame;
        sessionStore.savePath();
    }
    ipcRenderer.invoke("install_build", magnet, installationPath, torrentKeys);
});
</script>

<template>
    <div class="_torrent-download" v-if="torrent && torrent.ready">
        <p><Icon icon="mdi:account-network" /> {{ torrent.numPeers }}</p>
        <p v-if="torrent.progress < 1">
            Скачивание - {{ (torrent.progress * 100).toFixed() }}% ({{
                formatSizeUnits(torrent.downloadSpeed)
            }}/секунду)
        </p>
        <p v-else>
            Мод раздаётся - {{ formatSizeUnits(torrent.uploadSpeed) }}/секунду
        </p>
        <div
            class="progress"
            :style="{ width: `${torrent.progress * 100}%` }"
        ></div>
    </div>
    <p style="text-align: center" v-else>
        <Icon icon="svg-spinners:ring-resize" />
        <br />
        <br />
        Получение информации о скачивании
        <br />
        (Это может занять некоторое время)
    </p>
</template>

<style lang="scss" scoped>
._torrent-download {
    .progress {
        transition: width 0.1s ease-in-out;
        position: absolute;
        bottom: 0;
        left: 0;
        height: 4px;
        background-color: orange;
    }
}
</style>
