<script setup>
import { computed } from "@vue/reactivity";
import { ref, onMounted } from "vue";
import { useSessionStore } from "../stores/SessionStore.js";

const supabase = useSupabase();

// Other imports
import { Icon } from "@iconify/vue";
import { useSupabase } from "../composables/useSupabase";

const sessionStore = useSessionStore();
const cards = ref();

// Color interpolation system
const _interpolateColor = (color1, color2, factor) => {
    if (arguments.length < 3) {
        factor = 0.5;
    }
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
};

const colorFromRating = computed((rating) => {
    const calculatedColor = _interpolateColor(
        [255, 0, 0],
        [0, 255, 0],
        rating / 10
    );
    return `rgb(${calculatedColor[0]},${calculatedColor[1]},${calculatedColor[2]})`;
});

const openModDetails = (mod) => {
    sessionStore.currentSection = "details";
    sessionStore.currentMod = mod;
};

const loadSection = async () => {
    cards.value = (await supabase.from("mods").select("*, mod-builds(*)")).data
};
onMounted(loadSection);

const handle_postgres_changes = (
    payload
) => {
    const mod = payload.eventType !== "DELETE" ? (payload.new) : (payload.old);
    switch (payload.eventType) {
        case "INSERT":
			cards.value.push(mod)
            break;
        case "UPDATE":
            cards.value.forEach(
                (mod_checking, index) => {
                    if (mod_checking.mod_id === mod.mod_id) {
						cards.value[index] = mod
                    }
                }
            );
            break;
        case "DELETE":
            cards.value.forEach(
                (mod_checking, index) => {
                    if (mod_checking.mod_id === mod.mod_id) {
						cards.value.splice(index, 1)
                    }
                }
            );
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
        <div class="card" v-for="mod in cards" :style="{ 'background-image': `url(${mod.thumbnail_url})` }">
            <div class="overlay" />
			<div class="text-info">
                <h2 class="name">{{ mod.name }}</h2>
                <h3 class="rating">
                    <Icon
                        icon="streamline:interface-favorite-like-1-reward-social-up-rating-media-like-thumb-hand"
                    />
                    {{ 0.5 }}
                </h3>
                <button @click="openModDetails(mod)">
                    <Icon icon="line-md:cloud-down" />
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
#explore {
	display: flex;
	flex-wrap: wrap;
	gap: 2rem;
	padding: 1.5rem;
	justify-content: space-around;
	.card {
		height: 10rem;
		border-radius: 1rem;
		backdrop-filter: blur(0.1rem);
		display: flex;
		padding: 0 1.5rem;
		align-items: center;
		border: 1px rgba(255, 255, 255, 0.3) solid;
		gap: 1rem;
		width: min-content;
		backdrop-filter: blur(1px);
		height: fit-content;
		background-size: cover;
		position: relative;
		overflow: hidden;
		.overlay {
			position: absolute;
			inset: 0;
			backdrop-filter: brightness(0.5) blur(0.1rem);
			z-index: -1;
		}
		.text-info {
			display: flex;
			flex-direction: column;
			max-height: 90%;
			align-self: flex-start;
			width: fit-content;
		}
		.name {
			color: white;
			font-family: "Inter", sans-serif;
			font-weight: 500;
			margin: 0.5em 0;
		}
		.rating {
			color: white;
			font-family: "Inter", sans-serif;
			font-weight: 200;
			margin: 0;
			font-size: 1rem;
		}
		button {
			margin: 1.2rem 0;
			height: 2rem;
			box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.3);
			border: none;
			background-color: rgba(255, 255, 255, 0.1);
			border-radius: 0.5rem;
			font-family: "Inter", sans-serif;
			font-weight: 200;
			color: white;
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 0.6rem;
			transition: all 0.3s;
			cursor: pointer;
			&:hover {
				box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.5);
				background-color: rgba(255, 255, 255, 0.2);
			}
		}
	}
}

</style>
