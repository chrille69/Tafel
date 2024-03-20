<template>
    <svg :viewBox="viewboxattr"
        @mousedown="startWork" @mousemove="furtherWork" @mouseup="endWork" @mouseleave="endWork"
        @touchstart="startWork" @touchmove="furtherWork" @touchend="endWork" @touchcancel="endWork" @touchleave="endWork">
        <template v-for="item,idx in itemlist" :key="item.id">
            <g style="pointer-events: bounding-box;">
                <rect :="item.boundingBox" fill="none" stroke="red" v-if="item.selected" />
                <path :ref="(el) => item.el = el" :d="item.points.toString()" :="item.svgattr" :data-idx="idx"/>
            </g>
        </template>
        <rect v-show="zeigeRadierer" ref="radiergummi" :="radiergummiBox" width="50" height="100" style="stroke: red; stroke-width: 2px; fill: none;" />
    </svg>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['config'])

const itemlist = ref([])
const viewbox = ref({x:0, y:0, width: 1000, height: 700})
const radiergummi = ref(null)
const zeigeRadierer = ref(false)

const viewboxattr = computed(() => `${viewbox.value.x} ${viewbox.value.y} ${viewbox.value.width} ${viewbox.value.height}`)
const radiergummiBox = ref({x: 0, y: 0, width: 50, height: 100})

let newItem = null
let selectedElement = null
let isPainting = false
let isDragging = false
let startpos = null
let id = 0
let drawitem = null


function startWork(e) {
    startpos = getPosition(e)
    if (props.config.modus == 'edit') {
        startDrag(e)
        return
    }

    if (props.config.modus == 'radieren') {
        zeigeRadierer.value = true
        radiere(e)
        return
    }

    let filledItem = ['rechteckf','ellipsef','kreisf','quadratf'].indexOf(props.config.modus) >= 0
    let ispfeil = ['pfeil','pfeilsnap'].indexOf(props.config.modus) >= 0
    drawitem = drawarray[props.config.modus]
    const color = props.config.useCurrentColor ? 'currentColor' : props.config.brushColor
    newItem = {
        boundingBox: ref({x: 0, y: 0, width: 0, height: 0}),
        selected: false,
        points: ref(new PathPointList(new PathPointM(startpos.x, startpos.y))),
        svgattr: {
            stroke: filledItem ? 'none' : color,
            'stroke-width': props.config.brushWidth,
            fill: filledItem || ispfeil ? color : 'none',
            class: "rundeSache draggable"
        },
        el: null,
        id: ++id,
    }
    if (props.config.modus == 'stift') 
        newItem.points.value.push(new PathPointL(startpos.x, startpos.y))
    itemlist.value.push(newItem)
    startDraw(e)
}

function furtherWork(e) {
    if (props.config.modus == 'edit') {
        drag(e)
        return
    }
    if (props.config.modus == 'radieren') {
        radiere(e)
        return
    }
    draw(e)
}

function endWork(e) {
    if (props.config.modus == 'edit') {
        endDrag(e)
        return
    }
    if (props.config.modus == 'radieren') {
        zeigeRadierer.value = false
        return
    }
    endDraw(e)
}

function startDraw(e) {
    isPainting = true;
    e.preventDefault();
}

function draw(e) {
    if (!isPainting) return
    e.preventDefault();
    let pos = getPosition(e)
    drawitem(pos)
    newItem.boundingBox.value = newItem.el.getBBox()
}

function endDraw(e) {
    isPainting = false;
}

function startDrag(e) {
    isDragging = true
    if (e.target.classList.contains('draggable')) {
        selectedElement = e.target
        let item = itemlist.value[selectedElement.dataset['idx']]
        startpos.x -= item.component.translatepos.x
        startpos.y -= item.component.translatepos.y
    }
}

function drag(e) {
    if (!isDragging) return
    e.preventDefault()
    let pos = getPosition(e)
    if (selectedElement !== null) {
        let item = itemlist.value[selectedElement.dataset['idx']]
        item.component.translate({x: pos.x - startpos.x, y: pos.y - startpos.y})
    }
    else {
        viewbox.value.x += startpos.x - pos.x
        viewbox.value.y += startpos.y - pos.y
    }
}

function endDrag(e) {
    selectedElement = null
    isDragging = false
}

function radiere(e) {
    if (! zeigeRadierer.value) return
    e.preventDefault()
    let pos = getPosition(e)
    radiergummiBox.value.x = pos.x - 25
    radiergummiBox.value.y = pos.y - 50
    let removelist = []
    for (let item of itemlist.value) {
        if (checkIntersection(radiergummiBox.value, item.boundingBox)) {
            let rect = radiergummiBox.value
            item.points.removePointsInRect(rect)
            item.boundingBox = item.el.getBBox()
            if (item.points.length < 2)
                removelist.push(item.el.dataset['idx'])
        }
    }
    for (let idx of removelist)
        itemlist.value.splice(idx,1)
}


function checkIntersection(a, b) {
    if (!a || !b) return false
    return (a.x <= b.x+b.width &&
          b.x <= a.x+a.width &&
          a.y <= b.y+b.height &&
          b.y <= a.y+a.height)
}

function getPosition(evt) {
    let CTM = evt.target.getScreenCTM()
    if (evt.target.ownerSVGElement)
        CTM = evt.target.ownerSVGElement.getScreenCTM()

    let x = null
    let y = null
    if (evt.touches) {
        x = evt.touches[0].clientX
        y = evt.touches[0].clientY
    }
    else {
        x = evt.clientX
        y = evt.clientY
    }
    return {
        x: (x - CTM.e) / CTM.a,
        y: (y - CTM.f) / CTM.d
    }
}




function drawstift(pos) {
    newItem.points.value.push(new PathPointL(pos.x, pos.y))
}

function drawlinie(pos) {
    newItem.points.value = new PathPointList(new PathPointM(startpos.x, startpos.y), new PathPointL(pos.x, pos.y))
}

function drawliniesnap(pos) {
    let dpos = {x: pos.x - startpos.x, y: pos.y - startpos.y}
    let endpos = {x: startpos.x, y: pos.y}
    if (Math.abs(dpos.y) <= Math.abs(dpos.x))
        endpos = {x: pos.x, y: startpos.y}
    drawlinie(endpos)
}

function drawpfeil(pos) {
    let dpos = {x: pos.x - startpos.x, y: pos.y - startpos.y}
    let lw = 5
    let laenge = Math.sqrt(dpos.x**2 + dpos.y**2)
    newItem.points.value = new PathPointList(
        new PathPointM(startpos.x, startpos.y),
        new PathPointL(pos.x, pos.y),
        new PathPointM(pos.x, pos.y),
        new PathPointL(pos.x - 5*lw*dpos.x/laenge - lw*dpos.y/laenge, pos.y - 5*lw*dpos.y/laenge + lw*dpos.x/laenge),
        new PathPointL(pos.x - 5*lw*dpos.x/laenge + lw*dpos.y/laenge, pos.y - 5*lw*dpos.y/laenge - lw*dpos.x/laenge),
        new PathPointL(pos.x, pos.y),
    )
    newItem.points.value.isClosed = true
}

function drawpfeilsnap(pos) {
    let dpos = {x: pos.x - startpos.x, y: pos.y - startpos.y}
    let endpos = {x: startpos.x, y: pos.y}
    if (Math.abs(dpos.y) <= Math.abs(dpos.x))
        endpos = {x: pos.x, y: startpos.y}
    drawpfeil(endpos)
}

function drawrechteck(pos) {
    newItem.points.value = new PathPointList(
        new PathPointM(startpos.x, startpos.y),
        new PathPointL(pos.x, startpos.y),
        new PathPointL(pos.x, pos.y),
        new PathPointL(startpos.x, pos.y)
    )
    newItem.points.value.isClosed = true
}

function drawquadrat(pos) {
    let dpos = {x: pos.x - startpos.x, y: pos.y - startpos.y}
    let d = Math.max(Math.abs(dpos.x), Math.abs(dpos.y))
    let dx = dpos.x > 0 ? d : -d
    let dy = dpos.y > 0 ? d : -d
    let endpos = {x: startpos.x + dx, y: startpos.y + dy}
    drawrechteck(endpos)
}

function drawellipse(pos) {
    let rx = Math.abs(startpos.x - pos.x)
    let ry = Math.abs(startpos.y - pos.y)
    newItem.points.value = new PathPointList(new PathPointM(startpos.x + rx, startpos.y))
    for (let winkel = 0; winkel <= 360; winkel += 15) {
        let endx = startpos.x + rx*Math.cos(winkel*Math.PI/180.0)
        let endy = startpos.y + ry*Math.sin(winkel*Math.PI/180.0)
        newItem.points.value.push(new PathPointA(rx, ry, 0, 0, 1, endx, endy))
    }
    //newItem.points.value.isClosed = true
}

function drawkreis(pos) {
    let r = Math.sqrt((startpos.x - pos.x)**2 + (startpos.y - pos.y)**2)
    newItem.points.value = new PathPointList(new PathPointM(startpos.x+r, startpos.y))

    for (let winkel = 0; winkel <= 360; winkel += 15) {
        let endx = startpos.x + r*Math.cos(winkel*Math.PI/180.0)
        let endy = startpos.y + r*Math.sin(winkel*Math.PI/180.0)
        newItem.points.value.push(new PathPointA(r, r, 0, 0, 1, endx, endy))
    }
    //newItem.points.value.isClosed = true
}

const drawarray = {
    'stift': drawstift,
    'linie': drawlinie,
    'liniesnap': drawliniesnap,
    'pfeil': drawpfeil,
    'pfeilsnap': drawpfeilsnap,
    'rechteck': drawrechteck,
    'rechteckf': drawrechteck,
    'ellipse': drawellipse,
    'ellipsef': drawellipse,
    'kreis': drawkreis,
    'kreisf': drawkreis,
    'quadrat': drawquadrat,
    'quadratf': drawquadrat,
}

</script>

<style>
.rundeSache {
    stroke-linecap: round;
    stroke-linejoin: round;
}
</style>