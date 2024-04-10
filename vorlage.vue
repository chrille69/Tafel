<template>
    <component
        :ref="(el) => vorlage.el = el"
        :style="stylefn.call(vorlage)"
        :is="comp[vorlage.typ]"
        :groesse="vorlage.groesse"
        :xdekaden="vorlage.typ == 'mmlogpapier' ? vorlage.xdekaden : null"
        :ydekaden="vorlage.typ == 'mmlogpapier' ? vorlage.ydekaden : null"
        :id="vorlage.id"
    />
</template>

<script setup>
import { ref, markRaw } from 'vue'

import linienpapier from './linienpapier.vue'
import karopapier from './karopapier.vue'
import mmlogpapier from './mmlogpapier.vue'

const comp = ref({
    'linienpapier': markRaw(linienpapier),
    'karopapier': markRaw(karopapier),
    'mmlogpapier': markRaw(mmlogpapier)
})

function stylefn() {
    return {
        transform: this.transform,
        pointerEvents: 'bounding-box',
        transformOrigin: 'center',
        transformBox: 'fill-box',
    }
}

</script>