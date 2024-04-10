<template>
    <image
        :ref="(el) => bild.el = el"
        :=bild.attr
        :style="'transform:'+bild.transform"
        :id="bild.id"
    />
</template>

<script setup>
defineProps(['bild'])
</script>