<template>
    <g style="pointer-events: bounding-box;" class="draggable">
        <rect :="boundingBox" fill="none" stroke="red" v-if="true" />
        <g ref="group" >
            <slot></slot>
        </g>
    </g>
</template>

<script setup>
import {ref, watch} from 'vue'

const props = defineProps(['item'])
const group = ref(null)
const boundingBox = ref({x:0, y:0, width: 0, height: 0})

watch(props.item.points, (neu, alt) => { boundingBox.value = group.value.getBBox(); }, {flush: 'post'})
</script>