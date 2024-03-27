<template>
    <g>
        <template v-for="x,n in anzahl+1" :key="n">
            <path :d="'m 0 ' + n*abstand + ' l ' + anzahl*abstand + ' 0'" style="stroke: steelblue" vector-effect="non-scaling-stroke" />
            <path :d="'m ' + n*abstand + ' 0 l 0 ' + anzahl*abstand" style="stroke: steelblue" vector-effect="non-scaling-stroke" />
        </template>
    </g>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    groesse: {
        type: Number,
        default: 1000
    },
    anzahl: {
        type: Number,
        default: 50
    },
})

const abstand = computed(() => props.groesse/props.anzahl)
</script>