<template>
    <div ref="moveable_comp"></div>
</template>

<script setup>
import { onMounted, ref, watch, computed, inject } from 'vue'

const props = defineProps(['disabled','items','geodreieck'])
const emit = defineEmits(['change'])

const config = inject('config')

const moveable_comp = ref(null)
const selectedIds = ref([])

let moveable = null
let selectable = null

const itemsdict = computed(() => Object.fromEntries(props.items.map(item => [item.id, item])))
const selectableTargets = computed(() => {
    const list = props.items.map(item => item.id)
    if (config.value.geodreieckaktiv)
        list.push('geodreieck')
    return list
})

watch(() => selectableTargets.value, (neu, alt) => {
    selectedIds.value = neu.filter(id => selectedIds.value.includes(id))
    selectable.selectableTargets = neu.map(id => '#'+id)
})

watch(() => selectedIds.value, (neu, alt) => {
    moveable.target = neu.map(id => '#'+id)
})

onMounted(() => {
    moveable = new Moveable(moveable_comp.value, {
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
        transformItem(e.target.id, e.transform, e.transformObject)
    })
    .on("renderGroup", (ev) => {
        ev.events.forEach(e => {
            transformItem(e.target.id, e.transform, e.transformObject)
        });
    })


    selectable = new Selecto({
        selectByClick: true,
        selectFromInside: false,
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
        selectedIds.value = e.selected.map(el => el.id)
    })
    .on("selectEnd", (e) => {
        if (e.isDragStartEnd) {
            e.inputEvent.preventDefault();
            moveable.waitToChangeTarget().then(() => {
                moveable.dragStart(e.inputEvent);
            });
        }
        selectedIds.value = e.selected.map(el => el.id)
    })
})

function transformItem(id, transform, transformObject) {
    if (id == 'geodreieck')
        props.geodreieck.setTransform(transformObject)
    else {
        itemsdict.value[id].style.transform = transform
    }
}

function updateRect() {
    moveable.updateRect()
}

function deselectAll() {
    selectedIds.value = []
}

function selectedItems() {
    return selectedIds.value.map(id => itemsdict.value[id])
}

defineExpose({updateRect,deselectAll,selectedItems})
</script>