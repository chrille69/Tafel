<template>
    <g>
        <template v-for="bild in bilder" :key="bild.id">
            <image :ref="(el) => bild.el = el" :=bild.attr :style="'transform:'+bild.transform" />
        </template>
    </g>
</template>

<script setup>

const props = defineProps(['bilder'])

</script>