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
import ExploreModsView from "./views/ExploreMods.vue";
import ExploreFilesView from "./views/ExploreFiles.vue";
import LibraryView from "./views/Library.vue";
import SettingsView from "./views/Settings.vue";
import ModDetailsView from "./views/ModDetails.vue";
import FileDetailsView from "./views/FileDetails.vue";

// Vue imports
import { onMounted, ref, watchEffect } from "vue";
import { storeToRefs } from "pinia";

// Pinia stores
import { useSessionStore } from "./stores/SessionStore.js";

const Storage = initStorage()

const supabase = useSupabase();

const ipcRenderer = useIpcRenderer();
const sessionStore = useSessionStore();

const { currentSection, OpenModID, titleFrag } = storeToRefs(sessionStore);

// Connection management
const internet_present = ref(navigator.onLine);
const update = () => {
    internet_present.value = navigator.onLine;
};
window.addEventListener("offline", update);
window.addEventListener("online", update);
onMounted(update)

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
				OpenModID.value = mod
				currentSection.value = "details"
			}
			break
		}
	}
})
</script>

<template>
	<title>EchoMods{{ titleFrag ? " - " : "" }}{{ titleFrag }}</title>
    <Topbar version="0.2.5" build_label="dev build" />
    <NoInternet v-if="!internet_present" />
    <main v-else>
        <Sidebar />
        <div id="content">
            <Transition name="view" mode="out-in">
                <ExploreModsView v-if="sessionStore.currentSection === 'explore'" />
                <ExploreFilesView v-if="sessionStore.currentSection === 'explore_files'" />
                <ModDetailsView
                    v-else-if="sessionStore.currentSection === 'details'"
                />
                <FileDetailsView
                    v-else-if="sessionStore.currentSection === 'file_details'"
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
