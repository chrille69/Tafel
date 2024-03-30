<template>
    <div ref="moveable_comp"></div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps(['items','disabled','geodreieck','selectedItems'])
const emit = defineEmits(['change','updateTargets','transformGeodreieck'])

const moveable_comp = ref(null)

let moveable = null
let selecto = null

watch(() => props.selectedItems, (neu,alt) => {
    moveable.target = neu
})

onMounted(() => {
    moveable = new Moveable(moveable_comp.value, {
        draggable: true,
        rotatable: true,
        scalable: true,
        keepRatio: true,
    })
    .on("clickGroup", (e) => {
        selecto.clickTarget(e.inputEvent, e.inputTarget)
    })
    .on("renderEnd", (e) => { if(e.isDrag) emit('change') })
    .on("renderGroupEnd", (e) => { if(e.isDrag) emit('change') })
    .on("render", (e) => {
        if (e.target == props.geodreieck.$el) {
            emit('transformGeodreieck', e.transformObject)
            return
        }
        let item = props.items.find((it) => it.el === e.target)
        item.transform = e.transform
    })
    .on("renderGroup", (ev) => {
        ev.events.forEach(e => {
            if (e.target == props.geodreieck.$el) {
                emit('transformGeodreieck', e.transformObject)
                return
            }
            let item = props.items.find((it) => it.el === e.target)
            item.transform = e.transform
        });
    })


    selecto = new Selecto({
        selectByClick: true,
        selectFromInside: false,
        selectableTargets: ['.selectable']
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

        if (moveable.isMoveableElement(target) || props.selectedItems.some(t => t === target || t.contains(target))) {
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
        emit('updateTargets', e.selected)
    })
    .on("selectEnd", (e) => {
        if (e.isDragStartEnd) {
            e.inputEvent.preventDefault();
            moveable.waitToChangeTarget().then(() => {
                moveable.dragStart(e.inputEvent);
            });
        }
        emit('updateTargets', e.selected)
    })
})

function updateRect() {
    moveable.updateRect()
}

defineExpose({updateRect})
</script>