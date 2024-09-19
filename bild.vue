<template>
    <image
        :ref="(el) => bild.el = el"
        :=bild.attr
        :style="bild.style"
        :id="bild.id"
    />
</template>

<script setup>
defineProps(['bild'])
</script>