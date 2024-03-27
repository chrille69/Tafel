<template>
    <g>
        <template v-for="n in range()" :key="n">
            <template v-if="vertikal == true">
                <path :d="'m ' + pos(n) + ' 0 l 0 ' + groesse" style="stroke: orange;" :style="strokewidth(n)" vector-effect="non-scaling-stroke" />
            </template>
            <template v-else>
                <path :d="'m 0 ' + pos(n) + ' l ' + groesse + ' 0'" style="stroke: orange;" :style="strokewidth(n)" vector-effect="non-scaling-stroke"/>
            </template>
        </template>
    </g>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    groesse: {
        type: Number,
        default: 1000
    },
    vertikal: Boolean
})

const anzahl = ref(90)

function range() {
    const value = []
    for(let i=0; i<=anzahl.value; i += 2)
        value.push(i)
    return value
}

function pos(n) {
    const groesse = parseInt(props.groesse)
    let pos = groesse - Math.log10(1+parseInt(n)/10)*groesse
    if (props.vertikal)
        pos = Math.log10(1+parseInt(n)/10)*groesse
    return pos
}

function strokewidth(n) {
    if (n%10 == 0) return 'stroke-width: .8px'
    return 'stroke-width: .2px'
}
</script>