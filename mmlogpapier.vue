<template>
    <g>
        <template v-for="cx,x in xanzahl" :key="x">
            <template v-for="cy,y in yanzahl" :key="y">
                <template v-if="xdekaden == 0">
                    <mmlines :groesse="groesse" vertikal :style="styleTranslate(x*groesse, y*groesse)"></mmlines>
                </template>
                <template v-else>
                    <loglines :groesse="groesse" vertikal :style="styleTranslate(x*groesse, y*groesse)"></loglines>
                </template>
                <template v-if="ydekaden == 0">
                    <mmlines :groesse="groesse" :style="styleTranslate(x*groesse, y*groesse)"></mmlines>
                </template>
                <template v-else>
                    <loglines :groesse="groesse" :style="styleTranslate(x*groesse, y*groesse)"></loglines>
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

const xanzahl = computed(() => props.xdekaden == 0 ? 1 : props.xdekaden)
const yanzahl = computed(() => props.ydekaden == 0 ? 1 : props.ydekaden)

function styleTranslate(x, y) {
    return `transform: translate(${x}px,${y}px)`
}

</script>