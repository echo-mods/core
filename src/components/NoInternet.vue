<template>
    <div id="nointernet">
        <img src="../images/networkError.webp">
        <h1>Нет подключения к интернету</h1>
    </div>
</template>

<style scoped>
#nointernet {
    width: 100%;
    height: 50vh;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}

#nointernet h1 {
    text-align: center;
}

#nointernet img {
    width: 5rem;
}
</style>