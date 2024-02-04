<script setup>
// Composables
import { useIpcRenderer } from "@vueuse/electron";
import { useSupabase } from "./composables/useSupabase";

// Components
import Topbar from "./components/Topbar.vue";
import Sidebar from "./components/Sidebar.vue";
import Backdrop from "./components/Backdrop.vue"

// Views
import ExploreView from "./views/Explore.vue"
import SettingsView from "./views/Settings.vue"

// Vue imports
import { onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";

// Pinia stores
import { useSessionStore } from "./stores/SessionStore.js";
import { initStorage } from './modules/storage'

// Other
import { Icon } from "@iconify/vue";

const supabase = useSupabase();

const ipcRenderer = useIpcRenderer();
const sessionStore = useSessionStore();
const Storage = initStorage()
const { currentSection, OpenModID, titleFrag } = storeToRefs(sessionStore);


// Connection management
const internet_present = ref(navigator.onLine);
const update = () => {
    internet_present.value = navigator.onLine;
};
window.addEventListener("offline", update);
window.addEventListener("online", update);
onMounted(update)

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
const updateData = ref()
ipcRenderer.on("au-downloaded", (event, data) => {
	updateData.value = data
})

// Save section that the user switched to
watch(sessionStore, () => {
	Storage.set("section", currentSection.value)
})
</script>

<template>
	<title>EchoMods{{ titleFrag ? " - " : "" }}{{ titleFrag }}</title>
	<Backdrop />
    <Topbar version="0.2.7" build_label="dev build" />
    <main>
        <Sidebar />
        <div id="content">
            <Transition name="view" mode="out-in">
                <ExploreView
                    v-if="sessionStore.currentSection === 'explore'"
                />
                <SettingsView
                    v-else-if="sessionStore.currentSection === 'settings'"
                />
            </Transition>
        </div>
		<div class="update-dialog" v-if="updateData">
			<Icon icon="line-md:download-outline-loop"/>
			<p v-if="updateData !== true">Доступно обновление</p>
			<h5 v-if="updateData === true">Обновление скачано - перезагрузите приложение чтобы установить его.</h5>
			<h5 v-else>{{ updateData }}</h5>
		</div>
    </main>
</template>

<style lang="scss" scoped>
.view-enter-active,
.view-leave-active {
    transition: all 0.2s ease-in-out;
}

.view-enter-from,
.view-leave-to {
    opacity: 0;
    transform: translateX(1rem);
}

.update-dialog {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	border-radius: 1rem;
	border: 2px solid rgba(255, 255, 255, 0.3);
	padding: 1rem;
	position: fixed;
	bottom: 1rem;
	right: 1rem;
	backdrop-filter: blur(0.1rem);
	> * {
		margin: 0;
	}
	svg {
		width: 2rem;
		margin: 0 auto;
	}
}
</style>
