<template>
    <g>
        <template v-for="pfad in pfade" :key="pfad.id">
            <path
                :ref="(el) => pfad.el = el"
                :d="pfadstring(pfad.points)"
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
    pfad.points.value.push(['L', pos.x, pos.y])
}

function drawlinie(pfad, pos) {
    pfad.points.value = [['M', pfad.startpos.x, pfad.startpos.y], ['L', pos.x, pos.y]]
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
    pfad.points.value = [
        ['M', pfad.startpos.x, pfad.startpos.y],
        ['L', pos.x, pos.y],
        ['M', pos.x, pos.y],
        ['L', pos.x - 5*lw*dpos.x/laenge - lw*dpos.y/laenge, pos.y - 5*lw*dpos.y/laenge + lw*dpos.x/laenge],
        ['L', pos.x - 5*lw*dpos.x/laenge + lw*dpos.y/laenge, pos.y - 5*lw*dpos.y/laenge - lw*dpos.x/laenge],
        ['L', pos.x, pos.y]
    ]
}

function drawpfeilsnap(pfad, pos) {
    let dpos = {x: pos.x - pfad.startpos.x, y: pos.y - pfad.startpos.y}
    let endpos = {x: pfad.startpos.x, y: pos.y}
    if (Math.abs(dpos.y) <= Math.abs(dpos.x))
        endpos = {x: pos.x, y: pfad.startpos.y}
    drawpfeil(pfad, endpos)
}

function drawrechteck(pfad, pos) {
    pfad.points.value = [
        ['M', pfad.startpos.x, pfad.startpos.y],
        ['L', pos.x, pfad.startpos.y],
        ['L', pos.x, pos.y],
        ['L', pfad.startpos.x, pos.y],
        ['L', pfad.startpos.x, pfad.startpos.y],
    ]
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
    pfad.points.value = [['M', pfad.startpos.x + rx, pfad.startpos.y]]
    for (let winkel = 0; winkel <= 360; winkel += 15) {
        let endx = pfad.startpos.x + rx*Math.cos(winkel*Math.PI/180.0)
        let endy = pfad.startpos.y + ry*Math.sin(winkel*Math.PI/180.0)
        pfad.points.value.push(['A', rx, ry, 0, 0, 1, endx, endy])
    }
}

function drawkreis(pfad, pos) {
    let r = Math.sqrt((pfad.startpos.x - pos.x)**2 + (pfad.startpos.y - pos.y)**2)
    pfad.points.value = [['M', pfad.startpos.x + r, pfad.startpos.y]]
    for (let winkel = 0; winkel <= 360; winkel += 15) {
        let endx = pfad.startpos.x + r*Math.cos(winkel*Math.PI/180.0)
        let endy = pfad.startpos.y + r*Math.sin(winkel*Math.PI/180.0)
        pfad.points.value.push(['A', r, r, 0, 0, 1, endx, endy])
    }
}

function pfadstring(points) {
    let str = ''
    for (let point of points) {
        if (['M','m','L','l'].includes(point[0]))
            str += `${point[0]} ${point[1]} ${point[2]} `
        else if (['A','a'].includes(point[0]))
            str+= `${point[0]} ${point[1]} ${point[2]} ${point[3]} ${point[4]} ${point[5]} ${point[6]} ${point[7]} `
    }
    return str
}

function removePointsInRect(item, rect) {
    const mtrx = item.el.getCTM()
    for (let idx in item.points) {
        const i = parseInt(idx)
        if (isNaN(i)) continue
        const pos = pointPos(item.points[i])
        const postfm = pos.matrixTransform(mtrx)
        if (isPointInRect(postfm, rect)) {
            removePointAt(item.points, i)
        }
    }
}

function isPointInRect(pos, rect) {
    return (pos.x >= rect.x &&
            pos.x <= rect.x + rect.width &&
            pos.y >= rect.y &&
            pos.y <= rect.y + rect.height)
}

function removePointAt(points, idx) {

    if (idx < points.length-1) {
        let nextPoint = points[idx+1]
        let pos = pointPos(nextPoint)
        if (pos !== null)
            points[idx+1] = ['M', pos.x, pos.y]
    }
    points.splice(idx, 1)

    // Falls es folgende MoveTo-Points gibt, aktuellen löschen
    while(idx < points.length-1 && pointIsMove(points[idx+1])) {
        points.splice(idx, 1)
    }

    // Falls es vorhergehende MoveTo-Points gibt, vorhergehende löschen
    while(idx > 0 && pointIsMove(points[idx-1])) {
        points.splice(--idx, 1)
    }
}

function pointTyp(point) {
    return point[0]
}

function pointIsArc(point) {
    return ['A','a'].includes(pointTyp(point))
}

function pointIsMove(point) {
    return ['M','m'].includes(pointTyp(point))
}

function pointIsLine(point) {
    return ['L','l'].includes(pointTyp(point))
}

function pointPos(point) {
    const typ = pointTyp(point)
    if (['M','m','L','l'].includes(typ))
        return new DOMPoint(point[1], point[2])
    else if (['A','a'].includes(typ))
        return new DOMPoint(point[6], point[7])
    else if (typ == 'Z')
        return null
}

defineExpose({draw, removePointsInRect})
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