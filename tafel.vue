<template>
    <div>
        <moveablevue
            ref="moveable_comp"
            :style="moveablestyle"
            :disabled="moveableDisabled"
            :selectableItemIds="itemIds"
            :selectedItemIds="selectedItemIds"
            @update:selectedItemIds="setSelectedItemIds"
            @change="commit"
            @transformItem="transformItem">
        </moveablevue>
        <svg id="tafel" xmlns="http://www.w3.org/2000/svg"
            @mousedown="startWork" @mousemove="furtherWork" @mouseup="endWork" 
            @touchstart="startWork" @touchmove="furtherWork" @touchend="endWork" 
            style="touch-action: none; height: 100%; width: 100%"
            >
            <text v-if="true" x="20" y="20" style="fill: red;">Touchradius: {{ touchradius }}</text>
            <g ref="group_comp" :style="groupstyle">
                <g>
                    <template v-for="vorlage in vorlagen" :key="vorlage.id">
                        <vorlagevue :vorlage="vorlage"/>
                    </template>
                </g>
                <g>
                    <template v-for="bild in bilder" :key="bild.id">
                        <bildvue :bild="bild" />
                    </template>
                </g>
                <g>
                    <template v-for="pfad in pfade" :key="pfad.id" >
                        <pfadvue :pfad="pfad" />
                    </template>
                </g>

                <geodreieck  id="geodreieck" ref="geodreieck_comp" v-show="props.config.geodreieckaktiv">
                    <template v-if="!statusEditieren">
                        <path id="verschiebegriff" style="pointer-events: bounding-box; fill: #0000ff; stroke-width:.26458" d="m80 40-3 3h2v4h-4v-2l-3 3 3 3v-2h4v4h-2l3 3 3-3h-2v-4h4v2l3-3-3-3v2h-4v-4h2z"/>
                        <path id="drehgriff" style="pointer-events: bounding-box; fill: #ff0000; stroke-width:.026458" d="m79.368 11 c-.21279.0071-.3996.02137-.53513.04429-1.6929.26686-3.1357.95898-4.3198 2.0598-1.2426 1.1759-2.0097 2.5607-2.385 4.3203-.05013.22512-.06674.22488-.75887.25004l-.70905.02491 1.3175 1.9768c.71729 1.0924 1.3262 1.9763 1.3512 1.9763.02497 0 .63391-.88387 1.3512-1.9763l1.3175-1.9768-.91756-.02491-.9171-.02492.04982-.22512c.317-1.3261 1.4682-2.844 2.719-3.5863.98397-.58367 2.4351-.91716 3.4857-.8087 1.2926.14182 2.5934.65881 3.2606 1.2926l.35891.34184.67537-.67538.66707-.67583-.33353-.29156c-1.0091-.89228-2.4937-1.6431-3.7279-1.9016-.43775-.09378-1.3116-.14056-1.95-.11948zm7.3045 5.3315c-.02517 0-.63438.88433-1.3517 1.9768l-1.3175 1.9763 1.8347.04983-.04982.22513c-.317 1.3259-1.4675 2.8438-2.7186 3.5858-.98397.58386-2.4351.91762-3.4857.80916-1.2926-.14183-2.5939-.65882-3.2611-1.2926l-.35844-.34184-.67583.67583-.66707.67537.33353.29202c.58386.51714 1.7016 1.2089 2.4021 1.4924 2.7188 1.1008 5.9207.48388 8.0976-1.551 1.2676-1.1841 2.035-2.5688 2.4187-4.3452.04994-.22512.06674-.22488.75887-.25004l.70859-.02492-1.3175-1.9768c-.71729-1.0924-1.3256-1.9763-1.3507-1.9763z"/>
                    </template>
                </geodreieck>
            </g>
            <rect v-if="zeigeRadierer" :="radiergummiBox" style="stroke: red; stroke-width: 2px; fill: none;" />
        </svg>
    </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import geodreieck from './geodreieck.vue'
import pfadvue from './pfad.vue'
import bildvue from './bild.vue'
import vorlagevue from './vorlage.vue'
import moveablevue from './moveable.vue'

const props = defineProps(['config'])
const emit = defineEmits(['hatgemalt'])

const group_comp = ref(null)
const geodreieck_comp = ref(null)
const moveable_comp = ref(null)
const pfade = ref([])
const bilder = ref([])
const vorlagen = ref([])
const selectedItemIds = ref([])
const transform = ref({x: 0, y: 0, scale: 1})
const transformOrigin = ref({x: window.innerWidth/2, y: window.innerHeight/2})
const touchradius = ref(0)
const zeigeRadierer = ref(false)
const isPanning = ref(false)
const radiergummiPos = ref({x: 0, y: 0})

const statusEditieren = computed(() => {emptyTargets(); return props.config.modus == 'editieren' })
const statusZeichnen = computed(()  => {emptyTargets(); return props.config.modus == 'zeichnen' })
const statusRadieren = computed(()  => {emptyTargets(); return props.config.modus == 'radieren' })
const moveableDisabled = computed(() => !statusEditieren.value || isPanning.value || zeigeRadierer.value)
const items = computed(() => [...pfade.value,...bilder.value,...(props.config.hilfslinienFixiert ? [] : vorlagen.value)])
const itemIds = computed(() => {
    const list = items.value.map(item => item.id)
    list.push('geodreieck')
    setSelectedItemIds(selectedItemIds.value.filter(id => list.includes(id)))
    return list
})
const itemsdict = computed(() => Object.fromEntries(items.value.map(item => [item.id, item])))
const groupstyle = computed(() => {
    return {
        transform: `scale(${transform.value.scale}) translate(${transform.value.x}px, ${transform.value.y}px)`,
        transformOrigin: `${transformOrigin.value.x}px ${transformOrigin.value.y}px`
    }
})
const moveablestyle = computed(() => {
    const x = transformOrigin.value.x*(transform.value.scale-1)
    const y = transformOrigin.value.y*(transform.value.scale-1)
    return {
        transform: `translate(${x}px, ${y}px)`
    }
})
const radiergummiBox = computed(() => { return {
        x: radiergummiPos.value.x,
        y: radiergummiPos.value.y,
        width: props.config.rubbersize/2,
        height: props.config.rubbersize
    }
})


let startpos = new DOMPoint(0,0)
let itemid = 0
let neuerPfad = null
let dreheGD = false
let schiebeGD = false
let isPainting = false
let touchcount = 0

function neueId() {
    return `item${++itemid}`
}

function transformItem(id, transform, transformObject) {
    if (id == 'geodreieck')
        geodreieck_comp.value.setTransform(transformObject)
    else
        itemsdict.value[id].transform = transform
}

function setSelectedItemIds(targets) {
    selectedItemIds.value = targets
}
function emptyTargets() {
    setSelectedItemIds([])
}

onresize = () => {
    transformOrigin.value.x = window.innerWidth/2
    transformOrigin.value.y = window.innerHeight/2
    //await nextTick()
    moveable_comp.value.updateRect()
}

//////////////////////////////////////////////////////
//
// Pointer-Event-Handler
//
/////////////////////////////////////////////////////

async function startWork(e) {
    if (e.buttons && e.button > 1) return
    //console.log(e)
    e.preventDefault()
    if (e.touches?.length > 1 || e.button == 1) {
        emptyTargets()
        isPanning.value = true
        if(isPainting) {
            isPainting = false
            pfade.value.pop()
        }
        startpos = getPosition(e,'tafel')
        startpos.x -= transform.value.x
        startpos.y -= transform.value.y
        return
    }

    startpos = getPosition(e)

    if(e.target.id == 'drehgriff') {
        dreheGD = true
        geodreieck_comp.value.startRotate(getPosition(e))
        return
    }
    if(e.target.id == 'verschiebegriff') {
        schiebeGD = true
        geodreieck_comp.value.startTranslate(getPosition(e))
        return
    }

    if (statusRadieren.value || eventradius(e) > 2*touchradius.value ) {
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

async function furtherWork(e) {
    e.preventDefault()
    eventradius(e) // Zum Messen des durchschnittlichen Radius
    if(isPanning.value) {
        let pos = getPosition(e,'tafel')
        transform.value.x = pos.x-startpos.x
        transform.value.y = pos.y-startpos.y
        return
    }
    if (zeigeRadierer.value) {
        radiere(e)
        return
    }
    if (dreheGD) {
        geodreieck_comp.value.rotate(getPosition(e))
        return
    }
    if (schiebeGD) {
        geodreieck_comp.value.translate(getPosition(e))
        return
    }
    if (!statusZeichnen.value || !isPainting)
        return

    draw(e)
}

async function endWork(e) {
    e.preventDefault()
    if(isPanning.value) {
        isPanning.value = false
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
        selected: false,
        points: ref([['M', startpos.x, startpos.y]]),
        attr: {
            stroke: filledItem ? 'none' : color,
            'stroke-width': props.config.brushWidth,
            fill: filledItem || ispfeil ? color : 'none',
            'vector-effect': "non-scaling-stroke"
        },
        transform: '',
        id: neueId(),
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
    neuerPfad.draw(pos)
}

function radiere(e) {
    if (! zeigeRadierer.value) return

    let pos = getPosition(e, 'tafel')
    radiergummiPos.value.x = pos.x - props.config.rubbersize/4
    radiergummiPos.value.y = pos.y - props.config.rubbersize/2
    let removelist = []
    for (let item of pfade.value) {
        if (checkIntersection(radiergummiBox.value, item.el.getBoundingClientRect())) {
            item.removePoints(radiergummiBox.value)
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

function obenlinks() {
    const point = new DOMPoint(0,0)
    let mtrx = document.getElementById('tafel').getScreenCTM()
    const svgpoint = point.matrixTransform(mtrx.inverse())
    mtrx = group_comp.value.getScreenCTM()
    return svgpoint.matrixTransform(mtrx.inverse())
}

function getPosition(evt, tafel=false) {
    let CTM = group_comp.value.getScreenCTM()
    if (tafel)
        CTM = document.getElementById('tafel').getScreenCTM()
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
    let geomtrx = geodreieck_comp.value.$el.getCTM()
    let groupmtrx = group_comp.value.getScreenCTM()
    let geop = p.matrixTransform(groupmtrx).matrixTransform(geomtrx.inverse())
    if (geop.y < 90 && geop.y > 70 && Math.abs(geop.x-80) < 80) geop.y = 80
    p = geop.matrixTransform(geomtrx).matrixTransform(groupmtrx.inverse())
    return p
}

function eventradius(e) {
    let radius = 0
    if (! e.touches) return radius

    radius = e.touches[0].radiusX**2 + e.touches[0].radiusY**2
    if (touchcount < 50) {
        touchcount ++
        touchradius.value = (touchradius.value*(touchcount-1)+radius)/touchcount
    }
    return radius
}

////////////////////////////////////////////////////////////////////////
//
// Undo/Redo von VueUse - sehr komfortabel
//
////////////////////////////////////////////////////////////////////////

const pfadhistory = VueUse.useManualRefHistory(pfade, { clone: true })
const bildhistory = VueUse.useManualRefHistory(bilder, { clone: true })
const vorlagenhistory = VueUse.useManualRefHistory(vorlagen, { clone: true })

function undo() {
    pfadhistory.undo()
    bildhistory.undo()
    vorlagenhistory.undo()
    emptyTargets()
}

function redo() {
    pfadhistory.redo()
    bildhistory.redo()
    vorlagenhistory.redo()
    emptyTargets()
}

function commit() {
    pfadhistory.commit()
    bildhistory.commit()
    vorlagenhistory.commit()
    emit('hatgemalt')
}

///////////////////////////////////////////////////////////
//
// Funktionen, die von außen erreichbar sein sollen
//
///////////////////////////////////////////////////////////

function neueVorlage(typ, groesse=2500, xdekaden=0, ydekaden=0) {
    let ol = obenlinks()
    const vorlage = {
        typ: typ,
        selected: false,
        groesse: groesse,
        xdekaden: xdekaden,
        ydekaden: ydekaden,
        transform: `translate(${ol.x}px, ${ol.y}px)`,
        el: null,
        id: neueId()
    }
    vorlagen.value.push(vorlage)
    commit()
}

function neuesBild(file) {
    let ol = obenlinks()
    const neuesBild = {
        attr: {
            width: 500,
            height: 500,
            href: null
        },
        selected: false,
        transform: `translate(${ol.x}px, ${ol.y}px)`,
        el: null,
        id: neueId()
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
    pfade.value = pfade.value.filter((item) => ! selectedItemIds.value.includes(item.id) )
    bilder.value = bilder.value.filter((item) => ! selectedItemIds.value.includes(item.id) )
    vorlagen.value = vorlagen.value.filter((item) => ! selectedItemIds.value.includes(item.id) )
    commit()
}

function copySelected() {
    let copyitems = pfade.value.filter((item) => selectedItemIds.value.includes(item.id) )
    for (let item of copyitems) {
        let newitem = {...item}
        newitem.points = [...item.points]
        newitem.id = neueId()
        pfade.value.unshift(newitem)
    }
    copyitems = bilder.value.filter((item) => selectedItemIds.value.includes(item.id) )
    for (let item of copyitems) {
        let newitem = {...item}
        newitem.id = neueId()
        bilder.value.unshift(newitem)
    }
    copyitems = vorlagen.value.filter((item) => selectedItemIds.value.includes(item.id) )
    for (let item of copyitems) {
        let newitem = {...item}
        newitem.id = neueId()
        vorlagen.value.unshift(newitem)
    }
    commit()
    Quasar.Notify.create({
        message: 'Die Elemente wurde kopiert. Markierung jetzt verschieben.',
        color: 'positive',
        position: 'top'
    })
}

function exportJson() {
    return JSON.stringify({
        bilder: bilder.value,
        pfade:pfade.value,
        vorlagen: vorlagen.value
    })
}

function importJson(jsonstr) {
    const obj = JSON.parse(jsonstr)
    pfade.value = obj.pfade
    bilder.value = obj.bilder
    vorlagen.value = obj.vorlagen
}

async function gobottom() { transform.value.y -= 200;   await nextTick(); moveable_comp.value.updateRect()}
async function gotop()    { transform.value.y += 200;   await nextTick(); moveable_comp.value.updateRect()}
async function goleft()   { transform.value.x += 200;   await nextTick(); moveable_comp.value.updateRect()}
async function goright()  { transform.value.x -= 200;   await nextTick(); moveable_comp.value.updateRect()}
async function zoomout() { transform.value.scale *= .9; await nextTick(); moveable_comp.value.updateRect()}
async function zoomin() { transform.value.scale *= 1.1; await nextTick(); moveable_comp.value.updateRect()}
async function zoomreset() { transform.value.scale = 1; await nextTick(); moveable_comp.value.updateRect()}

function radiergummiKalibrieren() {
    touchradius.value = 0
    touchcount = 0
}

defineExpose({
    neuesBild,
    neueVorlage,
    deleteSelected,
    copySelected,
    exportJson,
    importJson,
    undo,
    redo,
    gobottom,
    gotop,
    goleft,
    goright,
    zoomin,
    zoomout,
    zoomreset,
    radiergummiKalibrieren
})

</script>
