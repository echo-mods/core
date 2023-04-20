<script setup>
import { onMounted } from 'vue'
import { useSessionStore } from '../stores/SessionStore.js'
const sessionStore = useSessionStore()

const setSection = (sectionName) => {
  sessionStore.currentSection = sectionName
}
</script>

<template>
  <div id="sidebar">
    <button @click="setSection('explore')" :class="{ selected: sessionStore.currentSection === 'explore' }">
      <img src="../images/exploreIcon.webp">
    </button>
    <button @click="setSection('library')" :class="{ selected: sessionStore.currentSection === 'library' }">
      <img src="../images/libraryIcon.webp">
    </button>
    <button @click="setSection('settings')" :class="{ selected: sessionStore.currentSection === 'settings' }" style="margin-top: auto;">
      <img src="../images/settingsIcon.webp">
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
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
  background: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  aspect-ratio: 1;
  outline: none;
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
</style>