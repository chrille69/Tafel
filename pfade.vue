<template>
    <g>
        <template v-for="pfad in pfade" :key="pfad.id">
            <path
                :ref="(el) => pfad.el = el"
                :d="pfad.points.toString()"
                :style="'transform:'+pfad.transform"
                :="pfad.attr"
                class="rundeSache selectable origin"
            />
        </template>
    </g>
</template>

<script setup>
const props = defineProps(['pfade'])

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

function draw(pfad, pos) {
    if (pfad.tool in drawarray)
        drawarray[pfad.tool](pfad, pos)
    else
        drawstift(pfad, pos)
}

function drawstift(pfad, pos) {
    pfad.points.value.push(new PathPointL(pos.x, pos.y))
}

function drawlinie(pfad, pos) {
    pfad.points.value = new PathPointList(new PathPointM(pfad.startpos.x, pfad.startpos.y), new PathPointL(pos.x, pos.y))
}

function drawliniesnap(pfad, pos) {
    let dpos = {x: pos.x - pfad.startpos.x, y: pos.y - pfad.startpos.y}
    let endpos = {x: pfad.startpos.x, y: pos.y}
    if (Math.abs(dpos.y) <= Math.abs(dpos.x))
        endpos = {x: pos.x, y: pfad.startpos.y}
    drawlinie(pfad, endpos)
}

function drawpfeil(pfad, pos) {
    let dpos = {x: pos.x - pfad.startpos.x, y: pos.y - pfad.startpos.y}
    let lw = 5
    let laenge = Math.sqrt(dpos.x**2 + dpos.y**2)
    pfad.points.value = new PathPointList(
        new PathPointM(pfad.startpos.x, pfad.startpos.y),
        new PathPointL(pos.x, pos.y),
        new PathPointM(pos.x, pos.y),
        new PathPointL(pos.x - 5*lw*dpos.x/laenge - lw*dpos.y/laenge, pos.y - 5*lw*dpos.y/laenge + lw*dpos.x/laenge),
        new PathPointL(pos.x - 5*lw*dpos.x/laenge + lw*dpos.y/laenge, pos.y - 5*lw*dpos.y/laenge - lw*dpos.x/laenge),
        new PathPointL(pos.x, pos.y),
    )
    pfad.points.value.isClosed = true
}

function drawpfeilsnap(pfad, pos) {
    let dpos = {x: pos.x - pfad.startpos.x, y: pos.y - pfad.startpos.y}
    let endpos = {x: pfad.startpos.x, y: pos.y}
    if (Math.abs(dpos.y) <= Math.abs(dpos.x))
        endpos = {x: pos.x, y: pfad.startpos.y}
    drawpfeil(pfad, endpos)
}

function drawrechteck(pfad, pos) {
    pfad.points.value = new PathPointList(
        new PathPointM(pfad.startpos.x, pfad.startpos.y),
        new PathPointL(pos.x, pfad.startpos.y),
        new PathPointL(pos.x, pos.y),
        new PathPointL(pfad.startpos.x, pos.y)
    )
    pfad.points.value.isClosed = true
}

function drawquadrat(pfad, pos) {
    let dpos = {x: pos.x - pfad.startpos.x, y: pos.y - pfad.startpos.y}
    let d = Math.max(Math.abs(dpos.x), Math.abs(dpos.y))
    let dx = dpos.x > 0 ? d : -d
    let dy = dpos.y > 0 ? d : -d
    let endpos = {x: pfad.startpos.x + dx, y: pfad.startpos.y + dy}
    drawrechteck(pfad, endpos)
}

function drawellipse(pfad, pos) {
    let rx = Math.abs(pfad.startpos.x - pos.x)
    let ry = Math.abs(pfad.startpos.y - pos.y)
    pfad.points.value = new PathPointList(new PathPointM(pfad.startpos.x + rx, pfad.startpos.y))
    for (let winkel = 0; winkel <= 360; winkel += 15) {
        let endx = pfad.startpos.x + rx*Math.cos(winkel*Math.PI/180.0)
        let endy = pfad.startpos.y + ry*Math.sin(winkel*Math.PI/180.0)
        pfad.points.value.push(new PathPointA(rx, ry, 0, 0, 1, endx, endy))
    }
}

function drawkreis(pfad, pos) {
    let r = Math.sqrt((pfad.startpos.x - pos.x)**2 + (pfad.startpos.y - pos.y)**2)
    pfad.points.value = new PathPointList(new PathPointM(pfad.startpos.x+r, pfad.startpos.y))

    for (let winkel = 0; winkel <= 360; winkel += 15) {
        let endx = pfad.startpos.x + r*Math.cos(winkel*Math.PI/180.0)
        let endy = pfad.startpos.y + r*Math.sin(winkel*Math.PI/180.0)
        pfad.points.value.push(new PathPointA(r, r, 0, 0, 1, endx, endy))
    }
}

defineExpose({draw})
</script>

<style>
.rundeSache {
    stroke-linecap: round;
    stroke-linejoin: round;
}
.origin {
    pointer-events: bounding-box;
    transform-origin: center;
    transform-box: fill-box;
}
</style>