import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSessionStore = defineStore('session', () => {
    const currentSection = ref("explore")

    return { currentSection }
})