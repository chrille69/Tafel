<template>
    <div style="width: 100%; position: relative;">
        <q-card class="go-left"><q-btn size="10px" glossy dense class="full-height" :icon="icons['go-left']" @click="() => goleft()" /></q-card>
        <q-card class="go-right"><q-btn size="10px" glossy dense class="full-height" :icon="icons['go-right']" @click="() => goright()" /></q-card>
        <q-card class="go-top"><q-btn size="10px" glossy dense class="full-width" :icon="icons['go-top']" @click="() => gotop()" /></q-card>
        <q-card class="go-bottom"><q-btn size="10px" class="full-width" dense glossy :icon="icons['go-bottom']" @click="() => gobottom()"/></q-card>
        <moveablevue
            ref="moveable_comp"
            :disabled="moveableDisabled"
            :items="items"
            :geodreieck="geodreieck_comp"
            @change="commit"
            @transformItem="transformItem">
        </moveablevue>
        <svg id="tafel" xmlns="http://www.w3.org/2000/svg"
            @mousedown="(e)=>startWork(e,'mouse')" @mousemove="(e)=>furtherWork(e,'mouse')" @mouseup="(e)=>endWork(e,'mouse')" @mousecancel="(e)=>endWork(e,'mouse')" 
            @touchstart="(e)=>startWork(e,'touch')" @touchmove="(e)=>furtherWork(e,'touch')" @touchend="(e)=>endWork(e,'touch')" @touchcancel="(e)=>endWork(e,'touch')"
            height="100%" width="100%"
            >
            <g id="gezeichnetes" ref="group_comp" :transform="transformfn">
                <g id="vorlagen">
                    <template v-for="vorlage in vorlagen" :key="vorlage.id">
                        <vorlagevue :vorlage="vorlage" />
                    </template>
                </g>
                <g id="bilder">
                    <template v-for="bild in bilder" :key="bild.id">
                        <bildvue :bild="bild" />
                    </template>
                </g>
                <g id="pfade">
                    <template v-for="pfad in pfade" :key="pfad.id" >
                        <pfadvue :pfad="pfad" />
                    </template>
                </g>
                <geodreieck  id="geodreieck" ref="geodreieck_comp" v-show="config.geodreieckaktiv">
                    <template v-if="!statusEditieren">
                        <path id="verschiebegriff" style="pointer-events: bounding-box; fill: #0000ff; stroke-width:.26458" d="m80 40-3 3h2v4h-4v-2l-3 3 3 3v-2h4v4h-2l3 3 3-3h-2v-4h4v2l3-3-3-3v2h-4v-4h2z"/>
                        <path id="drehgriff" style="pointer-events: bounding-box; fill: #ff0000; stroke-width:.026458" d="m79.368 11 c-.21279.0071-.3996.02137-.53513.04429-1.6929.26686-3.1357.95898-4.3198 2.0598-1.2426 1.1759-2.0097 2.5607-2.385 4.3203-.05013.22512-.06674.22488-.75887.25004l-.70905.02491 1.3175 1.9768c.71729 1.0924 1.3262 1.9763 1.3512 1.9763.02497 0 .63391-.88387 1.3512-1.9763l1.3175-1.9768-.91756-.02491-.9171-.02492.04982-.22512c.317-1.3261 1.4682-2.844 2.719-3.5863.98397-.58367 2.4351-.91716 3.4857-.8087 1.2926.14182 2.5934.65881 3.2606 1.2926l.35891.34184.67537-.67538.66707-.67583-.33353-.29156c-1.0091-.89228-2.4937-1.6431-3.7279-1.9016-.43775-.09378-1.3116-.14056-1.95-.11948zm7.3045 5.3315c-.02517 0-.63438.88433-1.3517 1.9768l-1.3175 1.9763 1.8347.04983-.04982.22513c-.317 1.3259-1.4675 2.8438-2.7186 3.5858-.98397.58386-2.4351.91762-3.4857.80916-1.2926-.14183-2.5939-.65882-3.2611-1.2926l-.35844-.34184-.67583.67583-.66707.67537.33353.29202c.58386.51714 1.7016 1.2089 2.4021 1.4924 2.7188 1.1008 5.9207.48388 8.0976-1.551 1.2676-1.1841 2.035-2.5688 2.4187-4.3452.04994-.22512.06674-.22488.75887-.25004l.70859-.02492-1.3175-1.9768c-.71729-1.0924-1.3256-1.9763-1.3507-1.9763z"/>
                    </template>
                </geodreieck>
            </g>
            <rect id="radiergummi" v-if="zeigeRadierer" :="radiergummiBox" style="stroke: red; stroke-width: 2px; fill: none;" />
        </svg>
    </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, inject, onMounted } from 'vue'
import geodreieck from './geodreieck.vue'
import pfadvue from './pfad.vue'
import bildvue from './bild.vue'
import vorlagevue from './vorlage.vue'
import moveablevue from './moveable.vue'

const emit = defineEmits(['hatgemalt'])
const icons = inject('icons')
const config = inject('config')

const group_comp = ref(null)
const geodreieck_comp = ref(null)
const moveable_comp = ref(null)
const pfade = ref([])
const bilder = ref([])
const vorlagen = ref([])
const transform = ref({x: 0, y: 0, scale: 1})
const zeigeRadierer = ref(false)
const isPanning = ref(false)
const radiergummiPos = ref({x: 0, y: 0})
const mitte = ref(new DOMPoint())

const statusEditieren = computed(() => {moveable_comp.value?.deselectAll(); return config.value.modus == 'editieren' })
const statusZeichnen = computed(()  => {moveable_comp.value?.deselectAll(); return config.value.modus == 'zeichnen' })
const statusRadieren = computed(()  => {moveable_comp.value?.deselectAll(); return config.value.modus == 'radieren' })
const moveableDisabled = computed(() => !statusEditieren.value || isPanning.value || zeigeRadierer.value)

const items = computed(() => [...pfade.value,...bilder.value,...(config.value.hilfslinienFixiert ? [] : vorlagen.value)])

const transformfn = computed(() => {
    const mx = mitte.value.x
    const my = mitte.value.y
    const tx = transform.value.x
    const ty = transform.value.y
    const s = transform.value.scale
    return `translate(${mx}, ${my}) scale(${transform.value.scale}) translate(${-mx+tx}, ${-my+ty})`
})
const radiergummiBox = computed(() => {
    const size = parseInt(config.value.rubbersize)
    const rect = {
        x: radiergummiPos.value.x,
        y: radiergummiPos.value.y,
        width: size/2,
        height: size
    }
    return rect
})

watch(() => config.value.geodreieckaktiv, () => {
    const mtrx = group_comp.value.getCTM()
    const point = mitte.value.matrixTransform(mtrx.inverse())
    geodreieck_comp.value.setPosition(point)
})

onMounted(() => {
    mitte.value = mittelpunkt()
})

let startpos = new DOMPoint(0,0)
let neuerPfad = null
let dreheGD = false
let schiebeGD = false
let isPainting = false
let touchcount = 0

function neueId() {
    return "item"+"10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

onresize = () => {
    mitte.value = mittelpunkt()
    //await nextTick()
    moveable_comp.value.updateRect()
}

//////////////////////////////////////////////////////
//
// Pointer-Event-Handler
//
/////////////////////////////////////////////////////

function startWork(e, typ) {
    if (e.buttons && e.button > 1) return

    //console.log(e)
    e.preventDefault()
    const radius = typ == 'touch' ? eventradius(e) : 0
    if (e.touches?.length > 1 || e.button == 1 ) {
        moveable_comp.value?.deselectAll()
        isPanning.value = true
        zeigeRadierer.value = false
        if(isPainting) {
            isPainting = false
            pfade.value.pop()
        }
        startpos = getPosition(e,'tafel')
        startpos.x -= transform.value.x * transform.value.scale
        startpos.y -= transform.value.y * transform.value.scale
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

    if (statusRadieren.value || radierbedingung(radius) ) {
        zeigeRadierer.value = true
        radiere(e)
        return
    }
    
    if (!statusZeichnen.value)
        return

    if (config.value.geodreieckaktiv) {
        startpos=geosnap(startpos)
    }

    startDraw(e)
}

function furtherWork(e, typ) {
    if (e.buttons && e.button > 1) return

    e.preventDefault()
    const radius = typ == 'touch' ? eventradius(e) : 0 // Zum Anzeigen des aktuellen und Messen des durchschnittlichen Radius
    if(isPanning.value) {
        let pos = getPosition(e,'tafel')
        transform.value.x = (pos.x-startpos.x) / transform.value.scale
        transform.value.y = (pos.y-startpos.y) / transform.value.scale
        return
    }
    if (zeigeRadierer.value || radierbedingung(radius)) {
        isPainting = false
        zeigeRadierer.value = true
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

function endWork(e, typ) {
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
    if (config.value.tool == 'stift')
        point2dot()

    commit();
}

function point2dot() {
    neuerPfad = pfade.value.at(-1)
    if (neuerPfad.points.length > 1)
        return
    neuerPfad.points.push(['l',0,0])
    return
}

function startDraw(e) {
    isPainting = true;
    let filledItem = ['rechteckf','ellipsef','kreisf','quadratf'].indexOf(config.value.tool) >= 0
    let ispfeil = ['pfeil','pfeilsnap'].indexOf(config.value.tool) >= 0
    const color = config.value.brushColor
    neuerPfad = {
        tool: config.value.tool,
        startpos: startpos,
        points: ref([['M', startpos.x, startpos.y]]),
        style: {
            'stroke': filledItem ? 'none' : color,
            'stroke-width': config.value.brushWidth,
            'fill': filledItem || ispfeil ? color : 'none',
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            'vector-effect': 'non-scaling-stroke',
            'transform-origin': 'center',
            'transform-box': 'fill-box',
            'pointer-events': 'bounding-box',
        },
        el: null,
        id: neueId(),
    }
    pfade.value.push(neuerPfad)
}

function draw(e) {
    if (!isPainting) return

    let pos = getPosition(e)
    if (config.value.geodreieckaktiv) {
        pos=geosnap(pos)
    }
    neuerPfad.draw(pos)
}

function radiere(e) {
    if (! zeigeRadierer.value) return

    const size = parseInt(config.value.rubbersize)
    let pos = getPosition(e, 'tafel')
    radiergummiPos.value.x = pos.x - size/4
    radiergummiPos.value.y = pos.y - size/2
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

function mittelpunkt() {
    const svgrect = document.getElementById('tafel').getBoundingClientRect()
    return new DOMPoint(svgrect.width/2, svgrect.height/2)
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
    if (! e.touches) {
        config.value.touchradiusaktuell = 0
        return
    }
    //console.log(e)


    const radius = Math.sqrt(e.touches[0].radiusX**2 + e.touches[0].radiusY**2)
    config.value.touchradiusaktuell = radius
    radiusmittel(radius)
    return radius
}

function radiusmittel(radius) {
    if (radius > 0 && touchcount < 50) {
        touchcount ++
        config.value.touchradiusmittel = (config.value.touchradiusmittel*(touchcount-1)+radius)/touchcount
    }
}

function radierbedingung(radius) {
    return radius > config.value.rubberfaktor.min*config.value.touchradiusmittel &&
           radius < config.value.rubberfaktor.max*config.value.touchradiusmittel &&
           ! config.value.ignoreradius
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
    moveable_comp.value?.deselectAll()
}

function redo() {
    pfadhistory.redo()
    bildhistory.redo()
    vorlagenhistory.redo()
    moveable_comp.value?.deselectAll()
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
        groesse: groesse,
        xdekaden: xdekaden,
        ydekaden: ydekaden,
        style: {
            transform: `translate(${ol.x}px, ${ol.y}px)`,
            transformOrigin: 'center',
            transformBox: 'fill-box',
            pointerEvents: 'bounding-box',
        },
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
            href: null,
        },
        style: {
            transform: `translate(${ol.x}px, ${ol.y}px)`,
            transformOrigin: 'center',
            transformBox: 'fill-box',
            pointerEvents: 'bounding-box',
        },
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
    const selected = moveable_comp.value.selectedItems()
    if (selected.length == 0)
        return
    pfade.value = pfade.value.filter((item) => ! selected.includes(item) )
    bilder.value = bilder.value.filter((item) => ! selected.includes(item) )
    vorlagen.value = vorlagen.value.filter((item) => ! selected.includes(item) )
    commit()
}

function copySelected() {
    const selected = moveable_comp.value.selectedItems()
    if (selected.length == 0)
        return
    for (let list of [pfade.value, bilder.value, vorlagen.value]) {
        let copyitems = list.filter((item) => selected.includes(item) )
        for (let item of copyitems.reverse()) {
            let newitem = {...item}
            if (item.points)
                newitem.points = [...item.points]
            newitem.attr = {...item.attr}
            newitem.style = {...item.style}
            newitem.id = neueId()
            list.unshift(newitem)
        }
    }
    commit()
    Quasar.Notify.create({
        message: 'Die Elemente wurde kopiert. Markierung jetzt verschieben.',
        color: 'positive',
        position: 'top'
    })
}

async function gobottom() { transform.value.y -= 200/transform.value.scale; await nextTick(); moveable_comp.value.updateRect()}
async function gotop()    { transform.value.y += 200/transform.value.scale; await nextTick(); moveable_comp.value.updateRect()}
async function goleft()   { transform.value.x += 200/transform.value.scale; await nextTick(); moveable_comp.value.updateRect()}
async function goright()  { transform.value.x -= 200/transform.value.scale; await nextTick(); moveable_comp.value.updateRect()}
async function zoomout() { transform.value.scale *= .9; await nextTick(); moveable_comp.value.updateRect()}
async function zoomin() { transform.value.scale *= 1.1; await nextTick(); moveable_comp.value.updateRect()}
async function zoomreset() { transform.value.scale = 1; await nextTick(); moveable_comp.value.updateRect()}

function radiergummiKalibrieren() {
    config.value.touchradiusmittel = 0
    touchcount = 0
}

function inSvgUmwandeln() {
    let g = document.getElementById('pfade').cloneNode(true)
    g.removeAttribute('id')
    group_comp.value.prepend(g)
    pfade.value = []
}

defineExpose({
    neuesBild,
    neueVorlage,
    deleteSelected,
    copySelected,
    gobottom,
    gotop,
    goleft,
    goright,
    undo,
    redo,
    zoomin,
    zoomout,
    zoomreset,
    radiergummiKalibrieren,
    inSvgUmwandeln
})

</script>

<style>
.go-left {
    position: absolute;
    top: calc(50% - 0.5 * var(--gobuttonwidth));
    left: var(--gobuttongap);
    height: var(--gobuttonwidth);
}
.go-right {
    position: absolute;
    top: calc(50% - 0.5 * var(--gobuttonwidth));
    right: var(--gobuttongap);
    height: var(--gobuttonwidth);
}
.go-top {
    position: absolute;
    left: calc(50% - 0.5 * var(--gobuttonwidth));
    top: var(--gobuttongap);
    width: var(--gobuttonwidth);
}
.go-bottom {
    position: absolute;
    left: calc(50% - 0.5 * var(--gobuttonwidth));
    bottom: var(--gobuttongap);
    width: var(--gobuttonwidth);
}
</style>
