<template>
    <div ref="moveable_comp"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps(['items','container','disabled','geodreieck'])
const emit = defineEmits(['change'])

const moveable_comp = ref(null)

let moveable = null
let selecto = null
let targets = []
function setTargets(nextTargets) {
    targets = nextTargets;
    if(moveable) moveable.target = targets;
}

onMounted(() => {
    moveable = new Moveable(moveable_comp.value, {
        target: props.targets,
        draggable: true,
        rotatable: true,
        scalable: true,
        keepRatio: true,
    })
    .on("clickGroup", (e) => {
        selecto.clickTarget(e.inputEvent, e.inputTarget)
    })
    .on("renderEnd", (e) => { emit('change') })
    .on("renderGroupEnd", (e) => { emit('change') })
    .on("render", (e) => {
        if (e.target == props.geodreieck.$el) {
            props.geodreieck.setTransform(e.transformObject)
            return
        }
        let item = props.items.find((it) => it.el === e.target)
        item.transform = e.transform
    })
    .on("renderGroup", (ev) => {
        ev.events.forEach(e => {
            if (e.target == props.geodreieck.$el) {
                props.geodreieck.setTransform(e.transformObject)
                return
            }
            let item = props.items.find((it) => it.el === e.target)
            item.transform = e.transform
        });
    })


    selecto = new Selecto({
        container: props.container,
        selectByClick: true,
        selectFromInside: false,
        selectableTargets: [() => props.items.map(item => item.el), '#geodreieck']
    })
    .on("dragStart",(e) => {
        const target = e.inputEvent.target

        if (props.disabled) {
            e.stop()
            return
        }

        if (moveable.isMoveableElement(target) || targets.some(t => t === target || t.contains(target))) {
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
        setTargets(e.selected)
    })
    .on("selectEnd", (e) => {
        if (e.isDragStartEnd) {
            e.inputEvent.preventDefault();
            moveable.waitToChangeTarget().then(() => {
                moveable.dragStart(e.inputEvent);
            });
        }
        setTargets(e.selected)
    })
})

function empty() {
    setTargets([])
}

defineExpose({empty})
</script>