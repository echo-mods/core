<script setup>
import { ref, onMounted } from "vue";

// Other imports
import { Icon } from "@iconify/vue";
import { useSupabase } from "../composables/useSupabase";
import { Platforms } from "../composables/useDatabase";
import { useSessionStore } from "../stores/SessionStore.js";

const supabase = useSupabase();

const sessionStore = useSessionStore();
const cards = ref();

const openModDetails = (mod_id) => {
    sessionStore.currentSection = "details";
    sessionStore.OpenModID = mod_id;
};

const pending = ref(true);
const loadSection = async () => {
    cards.value = (await supabase.from("mods").select("*, mod-builds(*)")).data;
    pending.value = false;
};
onMounted(loadSection);

const handle_postgres_changes = (payload) => {
    const mod = payload.eventType !== "DELETE" ? payload.new : payload.old;
    switch (payload.eventType) {
        case "INSERT":
            cards.value.push(mod);
            break;
        case "UPDATE":
            cards.value.forEach((mod_checking, index) => {
                if (mod_checking.mod_id === mod.mod_id) {
                    cards.value[index] = mod;
                }
            });
            break;
        case "DELETE":
            cards.value.forEach((mod_checking, index) => {
                if (mod_checking.mod_id === mod.mod_id) {
                    cards.value.splice(index, 1);
                }
            });
            break;
    }
};

const listener = supabase
    .channel("custom-all-channel")
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mods" },
        handle_postgres_changes
    )
    .subscribe();
</script>

<template>
    <div id="explore">
        <h1>Моды</h1>
        <hr style="width: 100%;" />
        <Icon v-if="pending" icon="svg-spinners:ring-resize" />
        <div v-else class="cards">
            <div
                class="card"
                v-for="mod in cards"
                :style="{ 'background-image': `url(${mod.thumbnail_url})` }"
            >
                <div class="overlay" />
                <div class="text-info">
                    <h2 class="name">{{ mod.name }}</h2>
                    <p class="platform" v-if="Platforms[mod.platform]">
                        {{ Platforms[mod.platform] }}
                    </p>
                    <button @click="openModDetails(mod.mod_id)">
                        Подробнее
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#explore {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
    svg {
        font-size: 2rem;
        width: 2rem;
        margin: 0 auto;
    }
    .cards {
        display: flex;
        flex-wrap: wrap;
        gap: 2rem;
        justify-content: space-around;
        .card {
            height: 12rem;
            border-radius: 1rem;
            backdrop-filter: blur(0.1rem);
            display: flex;
            padding: 0 1.5rem;
            align-items: center;
            gap: 1rem;
            backdrop-filter: blur(1px);
            background-size: cover;
            position: relative;
            overflow: hidden;
            .overlay {
                position: absolute;
                inset: 0;
                backdrop-filter: brightness(0.5);
                z-index: -1;
            }
            .text-info {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                width: 100%;
                height: 100%;
                .name {
                    color: white;
                    font-family: "Inter", sans-serif;
                    font-weight: 500;
                    margin: 0.5em 0;
                }

                .platform {
                    display: flex;
                    align-items: center;
                    gap: 0.2rem;
                    color: white;
                    font-family: "Inter", sans-serif;
                    font-weight: 200;
                    font-size: 0.8rem;
                }
                .rating {
                    color: white;
                    font-family: "Inter", sans-serif;
                    font-weight: 200;
                    margin: 0;
                    font-size: 1rem;
                }
                button {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin: 1.2rem 0;
                    height: 2rem;
                    border: none;
                    border-radius: 0.5rem;
                    font-family: "Inter", sans-serif;
                    font-weight: 200;
                    color: white;
                    gap: 0.6rem;
                    transition: all 0.3s;
                    cursor: pointer;
                    background: none;
                }
            }
        }
    }
}

@media (min-width: 0px) {
    .card {
        width: calc(50% - 5rem);
    }
}

@media (min-width: 900px) {
    .card {
        width: calc(33% - 5rem);
    }
}

@media (min-width: 1150px) {
    .card {
        width: calc(25% - 5rem);
    }
}
@media (min-width: 1400px) {
    .card {
        width: calc(20% - 5rem);
    }
}
</style>
