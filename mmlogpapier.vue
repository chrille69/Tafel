<template>
    <g>
        <template v-for="cx,x in xanzahl" :key="x">
            <template v-for="cy,y in yanzahl" :key="y">
                <template v-if="xdekaden == 0">
                    <mmlines :groesse="dekadengroesse" vertikal :style="styleTranslate(x*dekadengroesse, y*dekadengroesse)"></mmlines>
                </template>
                <template v-else>
                    <loglines :groesse="dekadengroesse" vertikal :style="styleTranslate(x*dekadengroesse, y*dekadengroesse)"></loglines>
                </template>
                <template v-if="ydekaden == 0">
                    <mmlines :groesse="dekadengroesse" :style="styleTranslate(x*dekadengroesse, y*dekadengroesse)"></mmlines>
                </template>
                <template v-else>
                    <loglines :groesse="dekadengroesse" :style="styleTranslate(x*dekadengroesse, y*dekadengroesse)"></loglines>
                </template>
            </template>
        </template>
    </g>
</template>

<script setup>
import { computed } from 'vue'
import mmlines from './mmlines.vue'
import loglines from './loglines.vue'

const props = defineProps({
    xdekaden: {
        type: Number,
        default: 0
    },
    ydekaden: {
        type: Number,
        default: 0
    },
    groesse: {
        type: Number,
        default: 1000
    },
})

const xanzahl = computed(() => props.xdekaden > 0 ? props.xdekaden : (props.ydekaden > 0 ? props.ydekaden : 1) )
const yanzahl = computed(() => props.ydekaden > 0 ? props.ydekaden : (props.xdekaden > 0 ? props.xdekaden : 1) )
const dekadengroesse = computed(() => props.groesse / Math.max(xanzahl.value, yanzahl.value) )

function styleTranslate(x, y) {
    return `transform: translate(${x}px,${y}px)`
}

</script>