<script setup>
import { defineProps } from "vue"
import { ipcRenderer } from "../modules/ipcRenderer"
const props = defineProps({
    "version": String,
    "build_label": String
})

const minimiseApp = () => {
    ipcRenderer.send("minimiseApp")
}

const toggleApp = () => {
    ipcRenderer.send("toggleApp")
}

const closeApp = () => {
    ipcRenderer.send("closeApp")
}
</script>

<template>
    <header>
        <span class="title">SMM | {{ version }} ({{ build_label }})</span>
        <div class="buttons">
            <button @click="minimiseApp"><img src="../images/minimiseApp.webp" alt="_"></button>
            <button @click="toggleApp"><img src="../images/toggleApp.webp" alt="/"></button>
            <button @click="closeApp"><img src="../images/closeApp.webp" alt="X"></button>
        </div>
    </header>
</template>


<style>
header {
    background-color: rgb(30,30,30);
    width: 100%;
    height: 2rem;
    line-height: 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
}

header .title {
    color: rgb(90,90,90);
    font-family: "Arial";
    text-align: center;
    -webkit-app-region: drag;
    width: 100%;
    height: 2rem;
    padding-left: 3rem;
}

header .buttons {
    display: flex;
}

.buttons button {
    height: 2rem;
    background: none;
    border: none;
    background-color: rgb(30,30,30);
    transition: all 0.3s;
    cursor: pointer;
    display: flex;
    align-items: center;
}

.buttons button:hover {
    background-color: rgb(15,15,15);
}

.buttons img {
    width: auto;
    height: 0.8rem;
    filter: brightness(0.4);
}
</style>