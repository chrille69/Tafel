<template>
    <g>
        <template v-for="x,n in anzahl+1" :key="n">
            <template v-if="vertikal == true">
                <path :d="'m ' + n*abstand + ' 0 l 0 ' + anzahl*abstand" style="stroke: orange;" :style="strokewidth(n)" vector-effect="non-scaling-stroke" />
            </template>
            <template v-else>
                <path :d="'m 0 ' + n*abstand + ' l ' + anzahl*abstand + ' 0'" style="stroke: orange;" :style="strokewidth(n)" vector-effect="non-scaling-stroke" />
            </template>
        </template>
    </g>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    groesse: {
        type: Number,
        default: 1000
    },
    vertikal: Boolean
})

const anzahl = ref(100)
const abstand = computed(() => props.groesse/anzahl.value)

function strokewidth(n) {
    if (n%10 == 0) return 'stroke-width: .8px'
    if (n%5 == 0) return 'stroke-width: .4px'
    return 'stroke-width: .2px'
}
</script>