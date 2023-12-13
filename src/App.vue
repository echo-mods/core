<script setup>
// Composables
import { useIpcRenderer } from "@vueuse/electron";
import { initStorage } from './modules/storage'
import { useSupabase } from "./composables/useSupabase";

// Components
import Topbar from "./components/Topbar.vue";
import NoInternet from "./components/NoInternet.vue";
import Sidebar from "./components/Sidebar.vue";

// Views
import ExploreView from "./views/Explore.vue";
import LibraryView from "./views/Library.vue";
import SettingsView from "./views/Settings.vue";
import DetailsView from "./views/Details.vue";

// Vue imports
import { ref, watchEffect } from "vue";
import { storeToRefs } from "pinia";

// Pinia stores
import { useSessionStore } from "./stores/SessionStore.js";

const Storage = initStorage()

const supabase = useSupabase();

const ipcRenderer = useIpcRenderer();
const sessionStore = useSessionStore();

const { currentSection, currentMod } = storeToRefs(sessionStore);

// Connection management
const internet_present = ref(navigator.onLine);
const update = () => {
    internet_present.value = navigator.onLine;
};
window.addEventListener("offline", update);
window.addEventListener("online", update);

watchEffect(() => Storage.set("section", currentSection.value))

ipcRenderer.on("deeplink", async (event, params) => {
	const { targetLink: link } = params
	const trimmed = link.split("echomods://")[1]
	if (!trimmed) { return }
	const constructed = `https://deeplink.action/` + trimmed.slice(0, trimmed.length)
	const url = new URL(constructed)
	const action = url.searchParams.get("action")
	switch (action) {
		case ("openmod"): {
			console.log(url.href)
			const id = url.searchParams.get("id")
			const { data: mod } = await supabase.from("mods").select("*, mod-builds(*)").eq("mod_id", id).single();
			if (mod) {
				currentMod.value = mod
				currentSection.value = "details"
			}
			break
		}
	}
})
</script>

<template>
    <Topbar version="0.2.4" build_label="dev build" />
    <NoInternet v-if="false && !internet_present" />
    <main v-else>
        <Sidebar />
        <div id="content">
            <Transition name="view" mode="out-in">
                <ExploreView v-if="sessionStore.currentSection === 'explore'" />
                <DetailsView
                    v-else-if="sessionStore.currentSection === 'details'"
                />
                <LibraryView
                    v-else-if="sessionStore.currentSection === 'library'"
                />
                <SettingsView
                    v-else-if="sessionStore.currentSection === 'settings'"
                />
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
