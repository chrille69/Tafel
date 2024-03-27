<template>
    <g>
        <template v-for="x in xanzahl" :key="x">
            <template v-for="y in yanzahl" :key="y">
                <mmlines :groesse="groesse" :vertikal="true"></mmlines>
                <loglines :groesse="groesse" ></loglines>
            </template>
        </template>
    </g>
</template>

<script setup>
import { ref } from 'vue'
import mmlines from './mmlines.vue'
import loglines from './loglines.vue'

const xanzahl = ref(3)
const yanzahl = ref(2)
const groesse = ref(1000)
</script>