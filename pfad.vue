<template>
    <path
        :ref="(el) => init(pfad, el)"
        :d="pfadstring(pfad.points)"
        :style="pfad.style"
        :="pfad.attr"
        :id="pfad.id"
    />
</template>

<script setup>
defineProps(['pfad'])

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

function init(pfad, el) {
    pfad.el = el
    pfad.draw = drawarray[pfad.tool].bind(pfad)
    pfad.removePoints = removePointsInRect.bind(pfad)
}

function drawstift(pos) {
    this.points.push(['L', pos.x, pos.y])
}

function drawlinie(pos) {
    this.points = [['M', this.startpos.x, this.startpos.y], ['L', pos.x, pos.y]]
}

function drawliniesnap(pos) {
    let dpos = {x: pos.x - this.startpos.x, y: pos.y - this.startpos.y}
    let endpos = {x: this.startpos.x, y: pos.y}
    if (Math.abs(dpos.y) <= Math.abs(dpos.x))
        endpos = {x: pos.x, y: this.startpos.y}
    drawlinie.call(this, endpos)
}

function drawpfeil(pos) {
    let dpos = {x: pos.x - this.startpos.x, y: pos.y - this.startpos.y}
    let lw = this.style['stroke-width'] * 5 / 3
    let laenge = Math.sqrt(dpos.x**2 + dpos.y**2)
    this.points = [
        ['M', this.startpos.x, this.startpos.y],
        ['L', pos.x, pos.y],
        ['M', pos.x, pos.y],
        ['L', pos.x - 5*lw*dpos.x/laenge - lw*dpos.y/laenge, pos.y - 5*lw*dpos.y/laenge + lw*dpos.x/laenge],
        ['L', pos.x - 5*lw*dpos.x/laenge + lw*dpos.y/laenge, pos.y - 5*lw*dpos.y/laenge - lw*dpos.x/laenge],
        ['L', pos.x, pos.y]
    ]
}

function drawpfeilsnap(pos) {
    let dpos = {x: pos.x - this.startpos.x, y: pos.y - this.startpos.y}
    let endpos = {x: this.startpos.x, y: pos.y}
    if (Math.abs(dpos.y) <= Math.abs(dpos.x))
        endpos = {x: pos.x, y: this.startpos.y}
    drawpfeil.call(this, endpos)
}

function drawrechteck(pos) {
    this.points = [
        ['M', this.startpos.x, this.startpos.y],
        ['L', pos.x, this.startpos.y],
        ['L', pos.x, pos.y],
        ['L', this.startpos.x, pos.y],
        ['L', this.startpos.x, this.startpos.y],
    ]
}

function drawquadrat(pos) {
    let dpos = {x: pos.x - this.startpos.x, y: pos.y - this.startpos.y}
    let d = Math.max(Math.abs(dpos.x), Math.abs(dpos.y))
    let dx = dpos.x > 0 ? d : -d
    let dy = dpos.y > 0 ? d : -d
    let endpos = {x: this.startpos.x + dx, y: this.startpos.y + dy}
    drawrechteck.call(this, endpos)
}

function drawellipse(pos) {
    let rx = Math.abs(this.startpos.x - pos.x)
    let ry = Math.abs(this.startpos.y - pos.y)
    this.points = [['M', this.startpos.x + rx, this.startpos.y]]
    for (let winkel = 0; winkel <= 360; winkel += 15) {
        let endx = this.startpos.x + rx*Math.cos(winkel*Math.PI/180.0)
        let endy = this.startpos.y + ry*Math.sin(winkel*Math.PI/180.0)
        this.points.push(['A', rx, ry, 0, 0, 1, endx, endy])
    }
}

function drawkreis(pos) {
    let r = Math.sqrt((this.startpos.x - pos.x)**2 + (this.startpos.y - pos.y)**2)
    this.points = [['M', this.startpos.x + r, this.startpos.y]]
    for (let winkel = 0; winkel <= 360; winkel += 15) {
        let endx = this.startpos.x + r*Math.cos(winkel*Math.PI/180.0)
        let endy = this.startpos.y + r*Math.sin(winkel*Math.PI/180.0)
        this.points.push(['A', r, r, 0, 0, 1, endx, endy])
    }
}

function pfadstring(points) {
    let str = ''
    for (let point of points) {
        if (pointIsArc(point))
            str+= `${point[0]} ${point[1]} ${point[2]} ${point[3]} ${point[4]} ${point[5]} ${point[6]} ${point[7]} `
        else
            str += `${point[0]} ${point[1]} ${point[2]} `
    }
    return str
}

function removePointsInRect(rect) {
    const mtrx = this.el.getCTM()
    for (let idx in this.points) {
        const i = parseInt(idx)
        if (isNaN(i)) continue
        const pos = pointPos(this.points[i])
        const postfm = pos?.matrixTransform(mtrx)
        if (isPointInRect(postfm, rect)) {
            removePointAt(this.points, i)
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
        const nextPoint = points[idx+1]
        const pos = pointPos(nextPoint)
        if (pos !== null)
            points[idx+1] = ['M', pos?.x, pos?.y]
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
    if (pointIsMove(point) || pointIsLine(point))
        return new DOMPoint(point[1], point[2])
    else if (pointIsArc(point))
        return new DOMPoint(point[6], point[7])
    else if (pointTyp(point) == 'Z')
        return null
}
</script>