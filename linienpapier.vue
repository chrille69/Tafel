<template>
    <g>
        <template v-for="n in anzahl" :key="n">
            <path :d="'m 0 ' + n*abstand + ' l ' + anzahl*abstand + ' 0'" style="stroke: steelblue" />
        </template>
    </g>
</template>

<script setup>
import { ref } from 'vue'

const anzahl = ref(100)
const abstand = ref(75)
</script>