<script setup>
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { askGamePath } from "../modules/mainProcessInteractions";
import { useSessionStore } from "../stores/SessionStore.js";
import { useIpcRenderer } from "@vueuse/electron";
import { useSupabase } from "../composables/useSupabase";
import { useUsername } from "../composables/useUsername";

const supabase = useSupabase();

const sessionStore = useSessionStore();
const ipcRenderer = useIpcRenderer();

const refreshing = ref(false);

if (!sessionStore.installationPaths) sessionStore.installationPaths = {};

const setGamePath = async (game) => {
    let pathToGame = await askGamePath(game);
    if (!pathToGame) {
        return;
    }
    sessionStore.installationPaths[game] = pathToGame;
    sessionStore.savePath();
    refreshing.value = true;
    setTimeout(() => {
        refreshing.value = false;
    }, 1);
};

const startAuth = () => {
    ipcRenderer.invoke("start_auth");
};

const user = ref();

onMounted(async () => {
    const {
        data: { user: user_fetched },
    } = await supabase.auth.getUser();
    user.value = user_fetched;
});

ipcRenderer.on("authorize_client", async (event, refresh_token) => {
    const { data, error } = await supabase.auth.refreshSession({
        refresh_token,
    });
    window.location.reload();
});

const logout = async () => {
	await supabase.auth.signOut()
	window.location.reload()
}
</script>

<template>
    <div id="settings">
        <h2 class="heading">Аккаунт</h2>
        <button @click="startAuth" v-if="user === null">Войти</button>
        <div class="user" v-else-if="user !== null">
            <img class="pfp" v-if="user.user_metadata.avatar_url" :src="user.user_metadata.avatar_url" />
            <div class="data">
                <h2 class="name" v-if="user.user_metadata.full_name">{{ user.user_metadata.full_name }}</h2>
                <h3 class="username">{{ useUsername(user) }}</h3>
                <p class="email">{{ user.email }}</p>
            </div>
			<button style="margin-left: auto;" @click="logout">Выйти</button>
        </div>
        <hr style="opacity: 0.2" />
        <h2 class="heading">Пути установки</h2>
        <div class="game-paths" v-if="!refreshing">
            <h4>Тень чернобыля</h4>
            <button @click="setGamePath('soc')">
                {{ sessionStore.installationPaths["soc"] || "Путь не указан" }}
            </button>
            <h4>Чистое небо</h4>
            <button @click="setGamePath('cs')">
                {{ sessionStore.installationPaths["cs"] || "Путь не указан" }}
            </button>
            <h4>Зов припяти</h4>
            <button @click="setGamePath('cop')">
                {{ sessionStore.installationPaths["cop"] || "Путь не указан" }}
            </button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#settings {
    margin: 1.5rem;
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.01);
    height: calc(100% - 5rem);
    outline: 1px rgba(255, 255, 255, 0.4) solid;
    border-radius: 1rem;
    backdrop-filter: blur(1px);
    overflow: auto;
    .game-paths {
        display: flex;
        flex-direction: column;
        width: fit-content;
        gap: 1rem;
        h4 {
            margin: 0;
        }
    }
	.user {
		display: flex;
		align-items: center;
		gap: 2rem;
		padding: 1rem;
		.pfp {
			border-radius: 5rem;
			width: 6rem;
			aspect-ratio: 1;
		}
		.data {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			> * {
				margin: 0;
			}
		}
	}
}

button {
    text-align: left;
    color: rgb(185, 185, 185);
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 0.5rem;
    box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.3);
    padding: 0.6rem 1rem;
    transition: all 0.3s ease-in-out;
}
button:hover {
    box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.2);
}
</style>
