<template>
    <div ref="moveable_comp"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps(['disabled','selectableItemIds','selectedItemIds'])
const emit = defineEmits(['change','update:selectedItemIds','transformItem'])

const moveable_comp = ref(null)

let moveable = null
let selectable = null

watch(() => props.selectedItemIds, (neu, alt) => {
    moveable.target = neu.map((id) => '#'+id)
})

watch(() => props.selectableItemIds, (neu, alt) => {
    selectable.selectableTargets = neu.map((id) => '#'+id)
})

onMounted(() => {
    moveable = new Moveable(moveable_comp.value, {
        cspNonce: "Tafel",
        draggable: true,
        rotatable: true,
        scalable: true,
        keepRatio: true,
    })
    .on("clickGroup", (e) => {
        selectable.clickTarget(e.inputEvent, e.inputTarget)
    })
    .on("renderEnd", (e) => {
        if(e.isDrag) emit('change')
    })
    .on("renderGroupEnd", (e) => { if(e.isDrag) emit('change') })
    .on("render", (e) => {
        emit('transformItem', e.target.id, e.transform, e.transformObject)
    })
    .on("renderGroup", (ev) => {
        ev.events.forEach(e => {
            emit('transformItem', e.target.id, e.transform, e.transformObject)
        });
    })


    selectable = new Selecto({
        selectByClick: true,
        selectFromInside: false,
        selectableTargets: ['#geodreieck']
    })
    .on("dragStart",(e) => {
        const target = e.inputEvent.target

        if ( ! ( target.id == 'tafel' || target.ownerSVGElement?.id == 'tafel' ) ) {
           e.stop()
            return
        }

        if (props.disabled) {
            e.stop()
            return
        }

        if (moveable.isMoveableElement(target) ) {
            e.stop();
            return
        }
    })
    .on('drag', (e) => {
        if (props.disabled) {
            e.stop()
            return
        }
    })
    .on("select", e => {
        if (e.isDragStartEnd) {
            return
        }
        emit('update:selectedItemIds', e.selected.map((el) => el.id))
    })
    .on("selectEnd", (e) => {
        if (e.isDragStartEnd) {
            e.inputEvent.preventDefault();
            moveable.waitToChangeTarget().then(() => {
                moveable.dragStart(e.inputEvent);
            });
        }
        emit('update:selectedItemIds', e.selected.map((el) => el.id))
    })
})

function updateRect() {
    moveable.updateRect()
}

defineExpose({updateRect})
</script>