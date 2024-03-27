<template>
    <g>
        <template v-for="vorlage in vorlagen" :key="vorlage.id">
            <g :ref="(el) => vorlage.el = el" :style="'transform:'+vorlage.transform" class="origin">
                <component
                    :is="comp[vorlage.typ]"
                    :groesse="vorlage.groesse"
                    :xdekaden="vorlage.xdekaden"
                    :ydekaden="vorlage.ydekaden"
                />
            </g>
        </template>
    </g>
</template>

<script setup>
import { ref, markRaw } from 'vue'

import linienpapier from './linienpapier.vue'
import karopapier from './karopapier.vue'
import mmlogpapier from './mmlogpapier.vue'

const props = defineProps(['vorlagen'])
const comp = ref({
    'linienpapier': markRaw(linienpapier),
    'karopapier': markRaw(karopapier),
    'mmlogpapier': markRaw(mmlogpapier)
})
</script>