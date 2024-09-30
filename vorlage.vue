<template>
    <g
        :ref="(el) =>  vorlage.el = el"
        :style="vorlage.style"
        :id="vorlage.id" >
        <component 
            :is="comp[vorlage.typ]"
            :groesse="vorlage.groesse"
            :xdekaden="vorlage.typ == 'mmlogpapier' ? vorlage.xdekaden : null"
            :ydekaden="vorlage.typ == 'mmlogpapier' ? vorlage.ydekaden : null"
        />
    </g>
</template>

<script setup>
import { ref, markRaw } from 'vue'

defineProps(['vorlage'])

import linienpapier from './linienpapier.vue'
import karopapier from './karopapier.vue'
import mmlogpapier from './mmlogpapier.vue'

const comp = ref({
    'linienpapier': markRaw(linienpapier),
    'karopapier': markRaw(karopapier),
    'mmlogpapier': markRaw(mmlogpapier)
})
</script>