<script setup>
// Components
import Topbar from './components/Topbar.vue';
import NoInternet from './components/NoInternet.vue'
import Sidebar from './components/Sidebar.vue'

// Views
import ExploreView from './views/Explore.vue';
import LibraryView from './views/Library.vue';
import SettingsView from './views/Settings.vue';
import DetailsView from './views/Details.vue';

// Vue imports
import { ref } from 'vue'

// Pinia stores
import { useSessionStore } from './stores/SessionStore.js'
const sessionStore = useSessionStore()

// Connection management
const internet_present = ref(navigator.onLine)
const update = () => {
  internet_present.value = navigator.onLine
}
window.addEventListener("offline", update);
window.addEventListener("online", update);
</script>

<template>
  <Topbar version="0.1.0" build_label="dev build" />
  <NoInternet v-if="!internet_present" />
  <main>
    <Sidebar />
    <div id="content">
      <Transition name="view" mode="out-in">
        <ExploreView v-if="sessionStore.currentSection === 'explore'" />
        <DetailsView v-if="sessionStore.currentSection === 'details'" />
        <LibraryView v-if="sessionStore.currentSection === 'library'" />
        <SettingsView v-if="sessionStore.currentSection === 'settings'" />
      </Transition>
    </div>
  </main>
</template>

<style scoped>
.view-enter-active,
.view-leave-active {
  transition: all 0.2s ease-in-out;
}

.view-enter-from,
.view-leave-to {
  opacity: 0;
  transform: translateX(1rem);
}
</style>