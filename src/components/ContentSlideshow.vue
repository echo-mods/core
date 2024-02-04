<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watchEffect } from "vue"

const root = ref()
const enabled = ref()
const controls = ref()
const controlsDefaultWidth = ref(0)

const btn_left = ref()
const btn_right = ref()

const props = defineProps<{
	content: string[],
	startingIndex?: number,
}>()

const slideID = ref(props.startingIndex || 0)

const cooldown = ref(false)

const transitionName = ref("right")

const data = computed(() => { if (props.content) { return props.content[(slideID.value + props.content.length * 2) % props.content.length] } })

const incrementSlide = (value: number) => {
	if (cooldown.value) { return }
	cooldown.value = true
	const directionString: string = value === -1 ? "right" : "left"
	transitionName.value = directionString
	switch (directionString) {
		case "right":
			btn_right.value.classList.add("active")
			break;
		case "left":
			btn_left.value.classList.add("active")
			break;
	}
	slideID.value += value
	if (props.content && slideID.value < 0) {
		slideID.value = props.content?.length + slideID.value
	}
	setTimeout(() => {
		btn_left.value.classList.remove("active")
		btn_right.value.classList.remove("active")
	}, 300);
	setTimeout(() => {
		cooldown.value = false
	}, 450);
}

const setSlide = (value: number) => {
	transitionName.value = value < trimmedID.value ? "right" : "left"
	slideID.value = value
}

const trimmedID = computed(() => (slideID.value + (props.content || "").length * 100000) % (props.content || "").length)

const handleKeypress = (event: any) => {
	if (!enabled.value) { return }
	if (event.key === "ArrowRight") {
		incrementSlide(1)
	} else if (event.key === "ArrowLeft") {
		incrementSlide(-1)
	}
}

const updateHoverState = () => {
	if (root.value) {
		enabled.value = root.value.matches(":hover")
	}
}


watchEffect(() => {
	if (!root.value) { return }
	if (controls.value && controlsDefaultWidth.value === 0) {
		controlsDefaultWidth.value = controls.value.offsetWidth
		enabled.value = false
	}
	root.value.addEventListener("mouseover", updateHoverState)
	root.value.addEventListener("mouseout", updateHoverState)
})

const controlsCurrentWidth = computed(() => {
	const normalCalculation = enabled.value ? controlsDefaultWidth.value : controlsDefaultWidth.value * 0.5
	return controlsDefaultWidth.value === 0 ? "auto" : `${normalCalculation}px`
})

onMounted(() => {
	window.addEventListener("keydown", handleKeypress)
})

onUnmounted(() => {
	window.removeEventListener("keydown", handleKeypress)
})
</script>

<template>
		<div class="content-container" ref="root">
			<!-- Slidshow controls -->
			<div class="slideshow-controls" ref="controls" :style="{ width: controlsCurrentWidth }"
				v-if="content.length > 1">
				<Transition name="controls-button">
					<button ref="btn_right" v-if="enabled !== false" class="right" @click="incrementSlide(-1)">
						<Icon name="line-md:arrow-left" />
					</button>
				</Transition>
				<div class="dots">
					<div class="dot" v-for="(data, index) in content" @click="setSlide(index)"
						:class="{ selected: index === trimmedID }"></div>
				</div>
				<Transition name="controls-button">
					<button ref="btn_left" v-if="enabled !== false" class="left" @click="incrementSlide(1)">
						<Icon name="line-md:arrow-left" />
					</button>
				</Transition>
			</div>
			<!-- Content placeholders -->
			<TransitionGroup :name="transitionName">
				<img loading="lazy" v-if="data && (data.endsWith('webp') || data.endsWith('png') || data.endsWith('jpg'))"
					:src="data" :key="slideID">
				<video v-else-if="data && data.endsWith('mp4')" :src="data" :key="slideID + 2"></video>
				<iframe v-else :key="slideID + 3"
					:src="`https://www.youtube-nocookie.com/embed/${data}?modestbranding=true`" title="YouTube video player"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowfullscreen></iframe>
			</TransitionGroup>
		</div>
</template>

<style scoped lang="scss">
.content-container {
	border-radius: 8px;
	width: 70%;
	aspect-ratio: 16 / 9;
	border: 1px rgba(255, 255, 255, 0.3) solid;
	overflow: hidden;
	position: relative;

	&.fallback {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.close-btn {
		right: 1rem;
		left: unset !important;
	}
	.fullscreen-btn, .close-btn {
		position: absolute;
		background-color: rgba(0, 0, 0, 0.1);
		backdrop-filter: blur(1rem);
		border-radius: 0.1rem;
		font-size: 2rem;
		padding: 0.1rem;
		left: 1rem;
		top: 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 0.5rem;
		outline: 1px solid rgba(255, 255, 255, 0.3);
		transition: all 0.3s;

		&:hover {

			background-color: rgba(0, 0, 0, 0.3);
		}

		>svg {
			margin: 0;
		}
	}

	>iframe,
	>img,
	>video {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	.slideshow-controls {
		translate: 0 150%;
		position: absolute;
		left: 50%;
		bottom: 10%;
		height: 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.25rem;
		transform: translate(-50%, -50%);
		z-index: 2;
		backdrop-filter: blur(1rem);
		padding: 1rem 0.5rem;
		border: 2px rgba(255, 255, 255, 0.3) solid;
		border-radius: 8px;
		opacity: 0;
		transition: all 0.3s ease-in-out;
		overflow: hidden;

		.filler {
			position: absolute;
			left: 0;
			top: 0;
			height: 100%;
			width: 50%;
			background-color: white;
			opacity: 0.1;
		}

		>button {
			width: 2rem;
			font-size: 0.75rem;
			transition: all 0.15s;
			margin-bottom: 0.1rem;

			&:focus {
				outline: none;
			}
		}

		>button.active {
			transition: all 0.15s;
			scale: 1.2;
			translate: 30% 0;

			&.right {
				translate: -30% 0;
			}
		}

		>button.left>svg {
			-webkit-transform: scaleX(-1);
			transform: scaleX(-1);
		}

		.dots {
			display: flex;
			gap: 0.5rem;
		}

		.dot {
			opacity: 0;
			width: 0;
			aspect-ratio: 1 !important;
			border-radius: 1rem;
			cursor: pointer;
			outline: 1px rgba(255, 255, 255, 0.3) solid;
			transition: all 0.15s;
		}

		.dot.selected {
			background-color: white;
		}
	}

	&:hover {
		.slideshow-controls {
			opacity: 1;
			translate: 0 0;
		}

		.dot {
			opacity: 1;
			width: 0.3rem;
		}
	}
}

.progress-bar {
	position: absolute;
	left: 0;
	bottom: 0;
	height: 8px;
	border-radius: 8px;
	width: 100%;
	background: none;
	transition: all 0.1s;
}

.progress-bar.waiting {
	transition: all 5s ease-in-out;
	left: -100%;
}

.progress-bar.playing {
	background: rgba(255, 255, 255, 0.05);
	box-shadow: 0 0 1rem rgba(255, 255, 255, 0.6);
	backdrop-filter: blur(1rem);
}

.progress-bar:not(.playing) {
	transition: all 0.5s;
}

/* Content transitions */

.right-move,
/* apply transition to moving elements */
.right-enter-active,
.right-leave-active {
	transition: all 0.5s ease-in-out;
	filter: blur(1rem);
}

.right-enter-from {
	opacity: 0.85;
	transform: translateX(-100%);
}

.right-enter-to {
	filter: none;
}

.right-leave-to {
	opacity: 0.85;
	transform: translateX(100%);
}

.right-leave-active {
	position: absolute;
}

/* */

.left-move,
/* apply transition to moving elements */
.left-enter-active,
.left-leave-active {
	transition: all 0.5s ease-in-out;
	filter: blur(1rem);
}

.left-enter-from {
	opacity: 0.85;
	transform: translateX(100%);
}

.left-enter-to {
	filter: none;
}

.left-leave-to {
	opacity: 0.85;
	transform: translateX(-100%);
}

.left-leave-active {
	position: absolute;
}

.controls-button-enter-active,
.controls-button-leave-active {
	transition: all 0.3s;
}

.controls-button-enter-from,
.controls-button-leave-to {
	opacity: 0;
}

@media (max-width: 600px) {
	.content-container {
		width: 100%;
	}
}
</style>