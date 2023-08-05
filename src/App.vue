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

// Other imports
import { Icon } from '@iconify/vue';

// Connection management
const internet_present = ref(navigator.onLine)
const update = () => {
  internet_present.value = navigator.onLine
}
window.addEventListener("offline", update);
window.addEventListener("online", update);
</script>

<template>
  <Topbar version="0.1.5" build_label="dev build" />
  <NoInternet v-if="!internet_present" />
  <main v-else>
    <Sidebar />
    <div id="content">
      <Transition name="view" mode="out-in">
        <ExploreView v-if="sessionStore.currentSection === 'explore'" />
        <DetailsView v-else-if="sessionStore.currentSection === 'details'" />
        <LibraryView v-else-if="sessionStore.currentSection === 'library'" />
        <SettingsView v-else-if="sessionStore.currentSection === 'settings'" />
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