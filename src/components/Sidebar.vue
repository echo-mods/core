<script setup>
import { Icon } from "@iconify/vue";
import { useSessionStore } from "../stores/SessionStore.js";
const sessionStore = useSessionStore();

const setSection = (sectionName) => {
    sessionStore.currentSection = sectionName;
};

console.log(sessionStore)
</script>

<template>
    <div id="sidebar">
        <button
            @click="setSection('explore')"
            :class="{ selected: sessionStore.currentSection === 'explore' }"
        >
            <Icon icon="streamline:store-1-solid" />
        </button>
        <button
            @click="setSection('settings')"
            :class="{ selected: sessionStore.currentSection === 'settings' }"
            style="margin-top: auto"
        >
            <Icon icon="line-md:cog-filled-loop" />
        </button>
    </div>
</template>

<style scoped lang="scss">
#sidebar {
    min-height: calc(100vh - 5rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem 1rem;
    gap: 0.5rem;
	border-right: 1px solid rgba(255,255,255, 0.1);
    button {
        height: 2rem;
        width: 2rem;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 0.5rem;
        background: none;
        color: white;
        cursor: pointer;
        transition: all 0.3s;
        border: none;
        aspect-ratio: 1 !important;
        outline: none;
        position: relative;
        > svg {
            position: absolute;
            width: calc(80% - 0.3rem);
        }
        &:hover {
			transform: scale(1.3) rotate3d(0.3, 0.3, 0, 35deg);
			perspective: 10rem;
			box-shadow: 0 0 0.2rem rgba(255, 255, 255, 0.5) inset;
        }
        &:active,
        &.selected {
			transform: scale(1.3) rotate3d(0.3, 0.3, 0, 35deg);
			perspective: 10rem;
			filter: drop-shadow(0 0 0.4rem white);
			box-shadow: 0 0 0.4rem white inset;
        }
        img {
            height: calc(2rem / 2);
            transition: all 0.3s;
        }
        .selected img {
            transform: scale(1.04);
        }
    }
}
</style>
