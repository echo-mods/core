<script setup>
import { onMounted } from 'vue'
import { useSessionStore } from '../stores/SessionStore.js'
import { Icon } from "@iconify/vue"
const sessionStore = useSessionStore()

const setSection = (sectionName) => {
  sessionStore.currentSection = sectionName
}
</script>

<template>
  <div id="sidebar">
    <button @click="setSection('explore')" :class="{ selected: sessionStore.currentSection === 'explore' }">
      <TransitionGroup name="sidebar-icon">
        <Icon v-if="sessionStore.currentSection === 'explore'" icon="line-md:star-filled" />
        <Icon v-else icon="line-md:star-alt-twotone" />
      </TransitionGroup>
    </button>
    <button @click="setSection('explore_files')" :class="{ selected: sessionStore.currentSection === 'explore_files' }">
      <TransitionGroup name="sidebar-icon">
        <Icon v-if="sessionStore.currentSection === 'explore_files'" icon="line-md:document-code-twotone" />
        <Icon v-else icon="line-md:document-code" />
      </TransitionGroup>
    </button>
    <button @click="setSection('settings')" :class="{ selected: sessionStore.currentSection === 'settings' }"
      style="margin-top: auto;">
      <TransitionGroup name="sidebar-icon">
        <Icon v-if="sessionStore.currentSection === 'settings'" icon="line-md:cog-filled-loop" />
        <Icon v-else icon="line-md:cog-filled" />
      </TransitionGroup>
    </button>
  </div>
</template>

<style scoped>
#sidebar {
  min-height: calc(100vh - 4rem);
  background-color: rgba(0, 0, 0, 0.5);
  box-shadow: 0 0 2rem rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 0.5rem;
  gap: 0.5rem;
}

#sidebar button {
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
}

#sidebar button > svg {
  position: absolute;
  width: calc(80% - 0.3rem);
}

#sidebar button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 1rem rgba(255, 255, 255, 0.3);
}

#sidebar button:active,
#sidebar button.selected {
  background-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 1rem rgba(255, 255, 255, 1);
}

#sidebar button img {
  height: calc(2rem / 2);
  transition: all 0.3s;
}

#sidebar button.selected img {
  transform: scale(1.04)
}

.sidebar-icon-move,
.sidebar-icon-enter-active,
.sidebar-icon-leave-active {
  transition: all 1.5s ease-in-out;
}

.sidebar-icon-enter-from,
.sidebar-icon-leave-to {
  opacity: 0;
}</style>