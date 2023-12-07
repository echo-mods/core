<script setup>
import { watchEffect } from "vue";
import ContentSlideshow from "../components/ContentSlideshow.vue";
import { openExternal } from "../modules/mainProcessInteractions";
import { storeToRefs } from "pinia";
import { useSessionStore } from "../stores/SessionStore.js";
import { Platforms } from "../composables/useDatabase";
import { initStorage } from "../modules/storage";
import { useSupabase } from "../composables/useSupabase";
import showdown from "showdown";

// Other imports
import { Icon } from "@iconify/vue";
import TorrentDownload from "../components/TorrentDownload.vue";
const Storage = initStorage();

const supabase = useSupabase();

const sessionStore = useSessionStore();
const { currentSection, currentMod, installationPaths, downloading } =
    storeToRefs(sessionStore);

const mod_id = currentMod.value.mod_id;

watchEffect(() => {
    Storage.set("current_mod", currentMod.value);
});

const converter = new showdown.Converter();

const handle_postgres_changes = (payload) => {
    if (payload.table === "mods") {
        if (payload.eventType === "UPDATE") {
            const updatedArticle = payload.new;
            const updatedID = updatedArticle.mod_id;
            if (updatedID === mod_id) {
                const builds_preserve = currentMod.value["mod-builds"];
                currentMod.value = updatedArticle;
                currentMod.value["mod-builds"] = builds_preserve;
            }
        } else if (payload.eventType === "DELETE") {
            const deletedArticle = payload.old;
            if (deletedArticle.mod_id === mod_id) {
                currentSection.value = "explore";
            }
        }
    } else if (payload.table === "mod-builds") {
        const build = payload.new ? payload.new : payload.old;
        switch (payload.eventType) {
            case "INSERT":
                if (build.mod_id === mod_id) {
                    currentMod.value["mod-builds"]?.push(build);
                }
                break;
            case "UPDATE":
                currentMod.value["mod-builds"].forEach(
                    (build_checking, index) => {
                        if (build_checking.mod_id === mod_id) {
                            currentMod.value["mod-builds"][index] = build;
                        }
                    }
                );
                break;
            case "DELETE":
                currentMod.value["mod-builds"].forEach(
                    (build_checking, index) => {
                        if (build_checking.mod_id === mod_id) {
                            currentMod.value["mod-builds"].splice(index, 1);
                        }
                    }
                );
                break;
        }
    }
};

const listener = supabase
    .channel("custom-all-channel")
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mods" },
        handle_postgres_changes
    )
    .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mod-builds" },
        handle_postgres_changes
    )
    .subscribe();

const linkHost = (link) => {
    try {
        const url = new URL(link);
        const host = url.host;
        return host;
    } catch {
        return link;
    }
};

const getIconForHost = (host) => {
    let retval = "material-symbols:link";
    if (host.includes("vk.com")) {
        retval = "mdi:vk";
    } else if (host.includes("youtube.com")) {
        retval = "mdi:youtube";
    } else if (host.includes("boosty.to")) {
        retval = "simple-icons:boosty";
    } else if (host.includes("t.me")) {
        retval = "simple-icons:telegram";
    } else if (host.includes("discord.gg")) {
        retval = "simple-icons:discord";
    }
    return retval;
};

const installBuild = (build) => {
	downloading.value = build.build_id
}

watchEffect(() => {
	console.log(currentMod.value)
})
</script>

<template>
    <div id="details">
        <div class="container">
            <ContentSlideshow :content="currentMod.content_urls" />
            <div class="info">
                <p class="description">{{ currentMod.description }}</p>
                <div class="mini-info">
                    <!-- <p class="rating">
                        <Icon
                            icon="streamline:interface-favorite-like-1-reward-social-up-rating-media-like-thumb-hand"
                        />
                        {{ 5 }} / 10
                    </p> -->
                    <p class="platform">
                        <Icon icon="eos-icons:installing" />
                        {{ Platforms[currentMod.platform] }}
                    </p>
                    <p class="requirement">
                        <Icon icon="pajamas:issue-type-requirements" />
                        {{
                            currentMod.standalone
                                ? "Не требует оригинальной игры"
                                : "Требует оригинальную игру"
                        }}
                    </p>
                    <div class="socials">
                        <button
                            v-for="link in currentMod.social_urls"
                            :href="link"
                            target="_blank"
                            @click="openExternal(link)"
                        >
                            <Icon :icon="getIconForHost(linkHost(link))" />
                        </button>
                    </div>
                </div>
            </div>
            <div class="builds">
                <div class="build" v-for="build in currentMod['mod-builds']">
                    <h1>
                        {{ build.version.startsWith("v") ? "" : "v"
                        }}{{ build.version }}
                    </h1>
                    <hr style="opacity: 0.1" />
                    <div v-html="converter.makeHtml(build.changes)" />
                    <hr style="opacity: 0.1" />
                    <button v-if="downloading !== build.build_id" class="install" @click="installBuild(build)">
                        Установить
                    </button>
					<TorrentDownload v-else :magnet="build.download_url" :mod="currentMod" :build="build"/>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#details {
    width: 100%;
    min-height: 100%;
    backdrop-filter: blur(1px);
    padding-bottom: 2rem;
    p {
        color: white;
        font-family: sans-serif;
    }
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .info {
        width: 70%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .description {
        width: calc(100% - 11rem);
    }
    .mini-info {
        width: 50%;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        background-color: rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    button {
        color: white;
        background: none;
        border: none;
        cursor: pointer;
        border-radius: 0.5rem;
        box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.3);
        padding: 0.6rem 0.4rem;
        transition: all 0.3s;
        &:hover {
            box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.5);
            background-color: rgba(255, 255, 255, 0.2);
        }
    }
    .mini-info {
        > p {
            margin: 0.5rem 0;
        }
        .socials {
            display: flex;
            gap: 1rem;
            button {
                padding: 0.5rem;
                font-size: 1.2rem;
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
    }
}

.builds {
    padding: 1rem 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 70%;
    .build {
        border-radius: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.3);
        padding: 1rem;
        width: calc(100% - 2rem);
        display: flex;
        flex-direction: column;
        gap: 1rem;
		position: relative;
		overflow: hidden;
        hr {
            width: 100%;
        }
    }
}
</style>
