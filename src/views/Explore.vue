<script setup>
import { computed } from '@vue/reactivity';
import { ref, onMounted } from 'vue'
import { useSessionStore } from '../stores/SessionStore.js'
import { fetchAPI } from "../modules/fetch"

const sessionStore = useSessionStore()
const cards = ref()

// Color interpolation system
var _interpolateColor = function (color1, color2, factor) {
    if (arguments.length < 3) { factor = 0.5; }
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};

const colorFromRating = computed((rating) => {
    const calculatedColor = _interpolateColor([255, 0, 0], [0, 255, 0], rating / 10)
    return `rgb(${calculatedColor[0]},${calculatedColor[1]},${calculatedColor[2]})`
})

const openModDetails = (mod) => {
    sessionStore.currentSection = "details"
    sessionStore.currentMod = mod
}

const loadSection = async () => {
    cards.value = await fetchAPI("/mods")
}
onMounted(loadSection)
</script>

<template>
    <div id="explore">
        <div class="card" v-for="mod in cards">
            <img :src="`${mod.imageURL}`" :alt="`${mod.name}`" class="thumbnail">
            <div class="text-info">
                <h2 class="name">{{ mod.name }}</h2>
                <h3 class="rating">
                    <i class="fa-solid fa-chart-simple"></i>
                    {{ (mod.rating / 10).toFixed(2) }}
                </h3>
                <button @click="openModDetails(mod)">
                    <i class="fa-solid fa-cloud-arrow-down"></i>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>

#explore {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    padding: 1.5rem;
    justify-content: space-around;
}

#explore .card {
    height: 10rem;
    border-radius: 1rem;
    backdrop-filter: blur(0.1rem);
    display: flex;
    padding: 0 1.5rem;
    align-items: center;
    border: 2px rgba(255, 255, 255, 0.5) dashed;
    gap: 1rem;
    width: min-content;
    backdrop-filter: blur(1px);
}

#explore .card .thumbnail {
    height: 80%;
    border-radius: 0.5rem;
}

#explore .card .text-info {
    display: flex;
    flex-direction: column;
    max-height: 90%;
    align-self: flex-start;
    width: fit-content;
}

#explore .card .name {
    color: white;
    font-family: "Inter", sans-serif;
    font-weight: 500;
    margin: 0.5em 0;
}

#explore .card .rating {
    color: white;
    font-family: "Inter", sans-serif;
    font-weight: 200;
    margin: 0;
    font-size: 1rem;
}

#explore .card button {
    margin: 1.2rem 0;
    height: 2rem;
    box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.3);
    border: none;
    background-color: rgba(0, 0, 0, 0);
    border-radius: 0.5rem;
    font-family: "Inter", sans-serif;
    font-weight: 200;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.6rem;
    transition: all 0.3s;
    cursor: pointer;
}

#explore .card button:hover {
    box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.2);
}
</style>