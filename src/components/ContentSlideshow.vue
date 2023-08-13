<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"

const slideID = ref(0)

const props = defineProps(["content"])

const transitionName = ref("right")

const data = computed(() => { if (props.content) { return props.content[(slideID.value + props.content.length * 2) % props.content.length] } })

const incrementSlide = (value) => {
	transitionName.value = value === -1 ? "right" : "left"
	slideID.value += value
	if (props.content && slideID.value < 0) {
		slideID.value = props.content?.length + slideID.value
	}
}

const setSlide = (value) => {
	transitionName.value = value < trimmedID.value ? "right" : "left"
	slideID.value = value
}

const trimmedID = computed(() => (slideID.value + (props.content || "").length * 100000) % (props.content || "").length)

const handleKeypress = (event) => {
	if (event.key === "ArrowRight") {
		incrementSlide(1)
	} else if (event.key === "ArrowLeft") {
		incrementSlide(-1)
	}
}

onMounted(() => {
	window.addEventListener("keydown", handleKeypress)
})

onUnmounted(() => {
	window.removeEventListener("keydown", handleKeypress)
})
</script>

<template>
	<div class="content-container">
		<!-- Slidshow controls -->
		<div class="slideshow-controls">
			<button class="right" @click="incrementSlide(-1)">&lt;</button>
			<div class="dots">
				<div class="dot" v-for="(data, index) in content" @click="setSlide(index)"
					:class="{ selected: index === trimmedID }"></div>
			</div>
			<button class="left" @click="incrementSlide(1)">></button>
		</div>
		<!-- Content placeholders -->
		<TransitionGroup :name="transitionName">
			<img v-if="data && (data.endsWith('webp') || data.endsWith('png') || data.endsWith('jpg'))" :src="data"
				:key="slideID">
			<video v-else-if="data && data.endsWith('mp4')" :src="data" :key="slideID + 2"></video>
			<iframe v-else :key="slideID + 3" :src="`https://www.youtube-nocookie.com/embed/${data}?modestbranding=true`"
				title="YouTube video player" frameborder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
				allowfullscreen></iframe>
		</TransitionGroup>
	</div>
</template>

<style scoped>
.slideshow-controls *:focus {
	outline: none;
}

.content-container {
	border-radius: 8px;
	width: 70%;
	aspect-ratio: 1.7777777778;
	border: 1px rgba(255, 255, 255, 0.3) solid;
	overflow: hidden;
	position: relative;
	margin: 1rem 0;
}

.content-container>iframe,
.content-container>img,
.content-container>video {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.content-container .slideshow-controls {
	position: absolute;
	left: 50%;
	bottom: 10%;
	height: 0.25rem;
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
}

.content-container .slideshow-controls>button {
	width: 2rem;
	font-size: 0.75rem;
	background: none;
	border: none;
	cursor: pointer;
}

.content-container .slideshow-controls .dots {
	display: flex;
	gap: 0.5rem;
}

.content-container .slideshow-controls .dot {
	width: 0.3rem;
	aspect-ratio: 1 !important;
	border-radius: 1rem;
	cursor: pointer;
	outline: 1px rgba(255, 255, 255, 0.3) solid;
	transition: all 0.6s;
}

.content-container .slideshow-controls .dot.selected {
	background-color: white;
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
.right-enter-active,
.right-leave-active {
	/* apply transition to moving elements */
	transition: all 0.5s ease-in-out;
	filter: blur(1rem);
}

.right-enter-from {
	opacity: 0;
	transform: translateX(-100%);
}

.right-enter-to {
	filter: none;
}

.right-leave-to {
	opacity: 0;
	transform: translateX(100%);
}

.right-leave-active {
	position: absolute;
}

/* */
.left-move,
.left-enter-active,
.left-leave-active {
	/* apply transition to moving elements */
	transition: all 0.5s ease-in-out;
	filter: blur(1rem);
}

.left-enter-from {
	opacity: 0;
	transform: translateX(100%);
}

.left-enter-to {
	filter: none;
}

.left-leave-to {
	opacity: 0;
	transform: translateX(-100%);
}

.left-leave-active {
	position: absolute;
}

@media (max-width: 600px) {
	.content-container {
		width: 100%;
	}
}</style>