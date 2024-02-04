<script setup>
import { defineProps } from "vue";
import { useIpcRenderer } from "@vueuse/electron";
const ipcRenderer = useIpcRenderer();

const props = defineProps({
    version: String,
    build_label: String,
});

const minimiseApp = () => {
    ipcRenderer.invoke("minimise-app");
};

const toggleApp = () => {
    ipcRenderer.invoke("toggle-app");
};

const closeApp = () => {
    ipcRenderer.invoke("close-app");
};
</script>

<template>
    <header>
        <span class="title">EchoMods | {{ version }} ({{ build_label }})</span>
        <div class="buttons">
            <button @click="minimiseApp">
                <img src="../images/minimiseApp.webp" alt="_" />
            </button>
            <button @click="toggleApp">
                <img src="../images/toggleApp.webp" alt="/" />
            </button>
            <button @click="closeApp">
                <img src="../images/closeApp.webp" alt="X" />
            </button>
        </div>
    </header>
</template>

<style scoped lang="scss">
header {
    width: 100%;
    height: calc(3rem - 1px);
    line-height: 3rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
	border-bottom: 1px solid rgba(255,255,255, 0.1);
    .title {
        color: rgba(255, 255, 255, 0.3);
        font-family: "Arial";
        text-align: center;
        -webkit-app-region: drag;
        width: 100%;
        height: 100%;
        padding-left: 3rem;
    }
    .buttons {
        display: flex;
		height: 100%;
        button {
            height: 100%;
            background: none;
            border: none;
            transition: all 0.3s;
            cursor: pointer;
            display: flex;
            align-items: center;
            opacity: 0.3;
            &:hover {
                opacity: 1;
            }
			&:focus {
				outline: none;
			}
        }
        img {
            width: auto;
            height: 1rem;
        }
    }
}
</style>