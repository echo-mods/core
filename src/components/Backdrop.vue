<template>
	<div id="backdrop">
		<div class="header-shadow"></div>
		<div class="blob"></div>
		<div class="blob"></div>
		<div class="blob"></div>
		<div class="blob"></div>
		<div class="blob"></div>
		<div class="blob"></div>
		<div class="overlay"></div>
	</div>
</template>

<style scoped lang="scss">
#backdrop {
	position: fixed;
	inset: 0;
	filter: blur(20vmax) brightness(0.5);
	@keyframes colorAnimate {
		0% {
			background-color: orange;
			rotate: 0deg;
		}
		50% {
			background-color: orangered;
			rotate: 180deg;
			scale: 1.2;
		}
		100% {
			background-color: orange;
			rotate: 360deg;
		}
	}
	@keyframes colorAnimate2 {
		0% {
			background-color: orangered;
			rotate: 0deg;
		}
		50% {
			background-color: orange;
			rotate: 180deg;
			scale: 1.2;
		}
		100% {
			background-color: orangered;
			rotate: 360deg;
		}
	}
	.header-shadow {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 6rem;
		background-color: black;
		z-index: -3;
		
	}
	.blob {
		position: absolute;
		background-color: orange;
		animation: colorAnimate 12s linear forwards infinite;
		border-radius: 100%;
		translate: -50% -50%;
		z-index: -3;
		transition: all 1s ease-in-out;
		&:nth-child(1) {
			left: 30%;
			top: 20%;
			width: 65vmax;
			height: 22vmax;
		}
		&:nth-child(2) {
			background-color: orangered;
			left: 10%;
			top: 50%;
			width: 27vmax;
			height: 72vmax;
			animation: colorAnimate2 12s linear forwards infinite;
		}
		&:nth-child(3) {
			left: 30%;
			top: 80%;
			width: 40vmax;
			height: 22vmax;
		}
		&:nth-child(4) {
			background-color: orangered;
			left: 100%;
			top: 20%;
			width: 65vmax;
			height: 22vmax;
			animation: colorAnimate2 12s linear forwards infinite;
		}
		&:nth-child(5) {
			left: 70%;
			top: 50%;
			width: 27vmax;
			height: 72vmax;
		}
		&:nth-child(6) {
			background-color: orangered;
			left: 70%;
			top: 80%;
			width: 40vmax;
			height: 22vmax;
			animation: colorAnimate2 12s linear forwards infinite;
		}
	}
}
</style>