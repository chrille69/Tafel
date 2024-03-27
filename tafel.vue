<template>
    <svg ref="svgroot" id="tafel" xmlns="http://www.w3.org/2000/svg" style="touch-action: none"
        @mousedown="startWork" @mousemove="furtherWork" @mouseup="endWork" 
        @touchstart="startWork" @touchmove="furtherWork" @touchend="endWork" 
        >
        <text v-if="false" x="20" y="20" style="fill: red;">Touchradius:{{ touchradius }}</text>
        <g id='container' :style="svgtransform">
            <mmlogpapier></mmlogpapier>
            <bildervue :bilder="bilder" ref="bilder_comp"/>
            <pfadevue :pfade="pfade" ref="pfade_comp"/>
        </g>
        <rect v-if="zeigeRadierer" ref="radiergummi" :="radiergummiBox" style="stroke: red; stroke-width: 2px; fill: none;" />
        <geodreieck  ref="geodreieck_el"  v-if="props.config.geodreieckaktiv">
            <path id="verschiebegriff" style="pointer-events: bounding-box; fill: #0000ff; stroke-width:.26458" d="m80 40-3 3h2v4h-4v-2l-3 3 3 3v-2h4v4h-2l3 3 3-3h-2v-4h4v2l3-3-3-3v2h-4v-4h2z"/>
            <path id="drehgriff" style="pointer-events: bounding-box; fill: #ff0000; stroke-width:.026458" d="m79.368 11 c-.21279.0071-.3996.02137-.53513.04429-1.6929.26686-3.1357.95898-4.3198 2.0598-1.2426 1.1759-2.0097 2.5607-2.385 4.3203-.05013.22512-.06674.22488-.75887.25004l-.70905.02491 1.3175 1.9768c.71729 1.0924 1.3262 1.9763 1.3512 1.9763.02497 0 .63391-.88387 1.3512-1.9763l1.3175-1.9768-.91756-.02491-.9171-.02492.04982-.22512c.317-1.3261 1.4682-2.844 2.719-3.5863.98397-.58367 2.4351-.91716 3.4857-.8087 1.2926.14182 2.5934.65881 3.2606 1.2926l.35891.34184.67537-.67538.66707-.67583-.33353-.29156c-1.0091-.89228-2.4937-1.6431-3.7279-1.9016-.43775-.09378-1.3116-.14056-1.95-.11948zm7.3045 5.3315c-.02517 0-.63438.88433-1.3517 1.9768l-1.3175 1.9763 1.8347.04983-.04982.22513c-.317 1.3259-1.4675 2.8438-2.7186 3.5858-.98397.58386-2.4351.91762-3.4857.80916-1.2926-.14183-2.5939-.65882-3.2611-1.2926l-.35844-.34184-.67583.67583-.66707.67537.33353.29202c.58386.51714 1.7016 1.2089 2.4021 1.4924 2.7188 1.1008 5.9207.48388 8.0976-1.551 1.2676-1.1841 2.035-2.5688 2.4187-4.3452.04994-.22512.06674-.22488.75887-.25004l.70859-.02492-1.3175-1.9768c-.71729-1.0924-1.3256-1.9763-1.3507-1.9763z"/>
        </geodreieck>
    </svg>
</template>

<script setup>
import { ref, computed } from 'vue'
import geodreieck from './geodreieck.vue'
import pfadevue from './pfade.vue'
import bildervue from './bilder.vue'
import linienpapier from './linienpapier.vue'
import karopapier from './karopapier.vue'
import mmlogpapier from './mmlogpapier.vue'

const props = defineProps(['config'])
const emit = defineEmits(['hatgemalt'])

const pfade_comp = ref(null)
const pfade = ref([])
const bilder_comp = ref(null)
const bilder = ref([])
let startpos = new DOMPoint(0,0)
let itemid = 0
let neuerPfad = null
const items = computed(() => [...pfade.value,...bilder.value])
const svgtranslate = ref({x:0, y:0})
const svgtransform = computed(() => `transform: translate(${svgtranslate.value.x}px, ${svgtranslate.value.y}px)`)
const svgroot = ref(null)
const statusEditieren = computed(() => {setTargets([]); return props.config.modus == 'editieren' })
const statusZeichnen = computed(()  => {setTargets([]); return props.config.modus == 'zeichnen' })
const statusRadieren = computed(()  => {setTargets([]); return props.config.modus == 'radieren' })


const radiergummi = ref(null)
const zeigeRadierer = ref(false)
const radiergummiPos = ref({x: 0, y: 0})
const radiergummiBox = computed(() => { return {
        x: radiergummiPos.value.x,
        y: radiergummiPos.value.y,
        width: props.config.rubbersize/2,
        height: props.config.rubbersize
    }
})
let radierradius = 5
const touchradius = ref(0)

const geodreieck_el = ref(null)
let dreheGD = false
let schiebeGD = false

let isPainting = false
let isPanning = false

function startWork(e) {
    e.preventDefault()
    if (e.touches?.length > 1) {
        isPanning = true
        if(isPainting) {
            isPainting = false
            pfade.value.pop()
        }
        startpos = getPosition(e,'tafel')
        startpos.x -= svgtranslate.value.x
        startpos.y -= svgtranslate.value.y
        return
    }

    startpos = getPosition(e)

    if(e.target.id == 'drehgriff') {
        dreheGD = true
        geodreieck_el.value.startRotate(startpos)
        return
    }
    if(e.target.id == 'verschiebegriff') {
        schiebeGD = true
        geodreieck_el.value.startTranslate(startpos)
        return
    }

    if (statusRadieren.value || eventradius(e) > radierradius ) {
        zeigeRadierer.value = true
        radiere(e)
        return
    }
    
    if (!statusZeichnen.value)
        return

    if (props.config.geodreieckaktiv) {
        startpos=geosnap(startpos)
    }

    startDraw(e)
}

function furtherWork(e) {
    e.preventDefault()
    if(isPanning) {
        let pos = getPosition(e,'tafel')
        svgtranslate.value.x = pos.x-startpos.x
        svgtranslate.value.y = pos.y-startpos.y
        return
    }
    if (zeigeRadierer.value) {
        radiere(e)
        return
    }
    if (dreheGD) {
        geodreieck_el.value.rotate(getPosition(e))
        return
    }
    if (schiebeGD) {
        geodreieck_el.value.translate(getPosition(e))
        return
    }
    if (!statusZeichnen.value)
        return
    draw(e)
}

function endWork(e) {
    e.preventDefault()
    if(isPanning) {
        isPanning = false
        return
    }
    if (zeigeRadierer.value) {
        zeigeRadierer.value = false
        commit()
        return
    }
    if (dreheGD) {
        dreheGD = false
        return
    }
    if (schiebeGD) {
        schiebeGD = false
        return
    }
    if (!statusZeichnen.value)
        return

    isPainting = false;
    commit();
}

function startDraw(e) {
    isPainting = true;
    let filledItem = ['rechteckf','ellipsef','kreisf','quadratf'].indexOf(props.config.tool) >= 0
    let ispfeil = ['pfeil','pfeilsnap'].indexOf(props.config.tool) >= 0
    const color = props.config.brushColor
    neuerPfad = {
        tool: props.config.tool,
        startpos: startpos,
        points: ref([['M', startpos.x, startpos.y]]),
        attr: {
            stroke: filledItem ? 'none' : color,
            'stroke-width': props.config.brushWidth,
            fill: filledItem || ispfeil ? color : 'none',
            'vector-effect': "non-scaling-stroke"
        },
        transform: '',
        el: null,
        id: ++itemid,
    }
    if (props.config.tool == 'stift') 
        neuerPfad.points.value.push(['L', startpos.x, startpos.y])
    pfade.value.push(neuerPfad)
}

function draw(e) {
    if (!isPainting) return

    let pos = getPosition(e)
    if (props.config.geodreieckaktiv) {
        pos=geosnap(pos)
    }
    pfade_comp.value.draw(neuerPfad, pos)
}

function radiere(e) {
    if (! zeigeRadierer.value) return

    let pos = getPosition(e, 'tafel')
    radiergummiPos.value.x = pos.x - props.config.rubbersize/4
    radiergummiPos.value.y = pos.y - props.config.rubbersize/2
    let removelist = []
    for (let item of pfade.value) {
        if (checkIntersection(radiergummiBox.value, item.el.getBoundingClientRect())) {
            pfade_comp.value.removePointsInRect(item, radiergummiBox.value)
            if (item.points.length < 2)
                removelist.push(item)
        }
    }
    pfade.value = pfade.value.filter(pfad => !removelist.includes(pfad))
}

function checkIntersection(a, b) {
    if (!a || !b) return false
    return (a.x <= b.x+b.width &&
          b.x <= a.x+a.width &&
          a.y <= b.y+b.height &&
          b.y <= a.y+a.height)
}

function getPosition(evt, id='container') {
    let CTM = document.getElementById(id).getScreenCTM()
    let p = new DOMPoint()
    if (evt.touches) {
        p.x = evt.touches[0].clientX
        p.y = evt.touches[0].clientY
    }
    else {
        p.x = evt.clientX
        p.y = evt.clientY
    }

    return p.matrixTransform(CTM.inverse())
}

function geosnap(pos) {
    let p = new DOMPoint(pos.x, pos.y)
    let geomtrx = geodreieck_el.value.getCTM()
    let conmtrx = document.getElementById('container').getScreenCTM()
    let geop = p.matrixTransform(conmtrx).matrixTransform(geomtrx.inverse())
    if (geop.y < 90 && geop.y > 70) geop.y = 80
    p = geop.matrixTransform(geomtrx).matrixTransform(conmtrx.inverse())
    return p
}

function eventradius(e) {
    let radius = 0
    if (! e.touches) return radius

    radius = e.touches[0].radiusX**2 + e.touches[0].radiusY**2
    touchradius.value = radius
    return radius
}

function neuesBild(file) {
    const neuesBild = {
        attr: {
            width: 500,
            height: 500,
            href: null
        },
        transform: '',
        el: null,
        id: ++itemid
    }
    let fr = new FileReader()
    fr.onload = function(e) {
        let img = new Image()
        img.onload = function(e) {
            neuesBild.attr.width = img.width
            neuesBild.attr.height = img.height
            neuesBild.attr.href = fr.result
            bilder.value.push(neuesBild)
            commit()
        }
        img.src = fr.result
    }
    fr.readAsDataURL(file)
}

function deleteSelected() {
    pfade.value = pfade.value.filter((item) => targets.indexOf(item.el) < 0 )
    bilder.value = bilder.value.filter((item) => targets.indexOf(item.el) < 0 )
    commit()
    setTargets([])
}

function copySelected() {
    let copyitems = pfade.value.filter((item) => targets.indexOf(item.el) >= 0 )
    for (let item of copyitems) {
        let newitem = {...item}
        newitem.el = ref(null)
        newitem.id = ++itemid
        pfade.value.unshift(newitem)
    }
    copyitems = bilder.value.filter((item) => targets.indexOf(item.el) >= 0 )
    for (let item of copyitems) {
        let newitem = {...item}
        newitem.el = ref(null)
        newitem.id = ++itemid
        bilder.value.unshift(newitem)
    }
    commit()
}


////////////////////////////////////////////////////////////////////////
//
// Undo/Redo von VueUse - sehr komfortabel
//
////////////////////////////////////////////////////////////////////////

const pfadhistory = VueUse.useManualRefHistory(pfade, { clone: true })
const bildhistory = VueUse.useManualRefHistory(bilder, { clone: true })

function undo() {
    pfadhistory.undo()
    bildhistory.undo()
    setTargets([])
}

function redo() {
    pfadhistory.redo()
    bildhistory.redo()
    setTargets([])
}

function commit() {
    pfadhistory.commit()
    bildhistory.commit()
    emit('hatgemalt')
}

//////////////////////////////////////////////////////////////
//
// Drag'n'Drop-Kram
//
//////////////////////////////////////////////////////////////

let targets = []
function setTargets(nextTargets) {
    targets = nextTargets;
    moveable.target = targets;
}

const moveable = new Moveable(document.body, {
    container: svgroot.value,
    target: targets,
    draggable: true,
    rotatable: true,
    scalable: true,
    keepRatio: true,
})
.on("clickGroup", (e) => {
    selecto.clickTarget(e.inputEvent, e.inputTarget)
})
.on("renderEnd", (e) => { commit() })
.on("renderGroupEnd", (e) => { commit() })
.on("render", (e) => {
    let item = items.value.find((it) => it.el === e.target)
    item.transform = e.transform
})
.on("renderGroup", (ev) => {
    ev.events.forEach(e => {
        let item = items.value.find((it) => it.el === e.target)
        item.transform = e.transform
    });
})

const selecto = new Selecto({
    container: svgroot.value,
    selectByClick: true,
    selectFromInside: false,
    selectableTargets: [() => items.value.map(item => item.el)]
})
.on("dragStart",(e) => {
    const target = e.inputEvent.target
    if ( ! (target === svgroot.value || svgroot.value.contains(target) ) ) {
        e.stop()
        return
    }
    if (props.config.geodreieckaktiv || !statusEditieren.value || isPanning || zeigeRadierer.value) {
        e.stop()
        return
    }

    if (moveable.isMoveableElement(target) || targets.some(t => t === target || t.contains(target))) {
        e.stop();
        return
    }
})
.on('drag', (e) => {
    if (props.config.geodreieckaktiv || !statusEditieren.value || isPanning || zeigeRadierer.value) {
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

///////////////////////////////////////////////////////////

function exportJson() {
    return JSON.stringify({bilder: bilder.value, pfade:pfade.value})
}

function importJson(jsonstr) {
    const obj = JSON.parse(jsonstr)
    pfade.value = obj.pfade
    bilder.value = obj.bilder
}

function gobottom() {
    svgtranslate.value.y -= 200
}
function gotop() {
    svgtranslate.value.y += 200
}
function goleft() {
    svgtranslate.value.x += 200
}
function goright() {
    svgtranslate.value.x -= 200
}
defineExpose({deleteSelected, copySelected, neuesBild, undo, redo, exportJson, importJson, gobottom, gotop, goleft, goright})

</script>
