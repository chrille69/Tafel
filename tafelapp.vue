<template>
    <div @fullscreenchange="fullscreenchange" class="app">
        <tafel 
            ref="tafel_comp"
            :config="config"
            @wheel="mausrad"
            @hatgemalt="() => ungespeichert = true" />
        <q-card square flat bordered class="control full-width">
            <div class="row full-width q-gutter-sm q-pa-xs">
                <q-btn-toggle
                    :size="buttonsize" 
                    v-model="config.modus"
                    dense push glossy
                    toggle-color="primary"
                    class="q-ml-none"
                    :options="[
                        {value: 'editieren', slot: 'editieren'},
                        {value: 'radieren', slot: 'radieren'},
                        {value: 'zeichnen', slot: 'zeichnen'},
                    ]">
                    <template v-slot:editieren>
                        <q-icon :name="icons['editieren']" />
                    </template>
                    <template v-slot:radieren>
                        <q-icon :name="icons['radieren']" />
                    </template>
                    <template v-slot:zeichnen>
                        <q-icon :name="icons[config.tool]" />
                        <q-btn dense flat icon="arrow_drop_up" size="sm">
                            <mymenu v-model="config.tool" :icons="icons" :items="toolmenu" />
                        </q-btn>
                    </template>
                </q-btn-toggle>
                <q-btn-toggle
                    v-model="config.tool"
                    class="gt-md"
                    dense push glossy
                    :toggle-color="config.modus == 'zeichnen' ? primary : 'grey-6'"
                    @click="config.modus = 'zeichnen'"
                    :options="toolmenu.map(t => { return {value: t.value, slot: t.value} }).reverse()">
                    <template v-for="tool in toolmenu" #[tool.value]>
                        <q-icon :name="icons[tool.value]" />
                    </template>
                </q-btn-toggle>
                <q-space />
                <template v-if="config.modus == 'radieren'">
                    <q-btn :size="buttonsize" dense no-caps flat label="Größe">
                        <mymenu v-model="config.rubbersize" :icons="icons" :items="radiergummisizemenu" />
                    </q-btn>
                    <q-input
                        v-model="config.rubbersize"
                        class="gt-sm"
                        dense
                        type="number"
                        label="Radierergröße" />
                    <div class="gt-sm" style="width: 150px;" v-if="! config.ignoreradius">
                        <div style="font-size: 10.5px; color: hsla(0, 0%, 100%, .7);">Touchfaktor</div>
                        <q-slider v-model="config.rubberfaktor.min" :step="0.1" :min="1.5" :max="10" dense label/>
                        <!--q-range v-model="config.rubberfaktor" dense
                            :min="1.5" :max="10.0" :step="0.05" label /-->
                    </div>
                    <q-checkbox v-model="config.ignoreradius" dense label="Ignoriere Touchradius"></q-checkbox>
                </template>
                <template v-else-if="config.modus == 'editieren'">
                    <q-btn :size="buttonsize" dense :icon="icons['copy']" glossy @click="tafel_comp.copySelected" />
                    <q-btn :size="buttonsize" dense :icon="icons['delete']" glossy @click="tafel_comp.deleteSelected" />
                    <q-checkbox class="gt-sm" label="Hilfslinien fixieren" v-model="config.hilfslinienFixiert">
                        <q-tooltip>Verhindert, dass Karopapier, mm-Papier usw. verschoben werden</q-tooltip>
                    </q-checkbox>
                    <q-checkbox class="lt-md" :size="buttonsize" label="HL fix" v-model="config.hilfslinienFixiert">
                        <q-tooltip>Verhindert, dass Karopapier, mm-Papier usw. verschoben werden</q-tooltip>
                    </q-checkbox>
                </template>
                <template v-else>
                    <q-btn-toggle 
                        :size="buttonsize" 
                        v-model="config.brushColor"
                        dense push glossy
                        toggle-color="primary"
                        :options="[
                            {value: 'currentColor', slot: 'standard'},
                            {value: '#ff0000', slot: 'rot'},
                            {value: '#00ff00', slot: 'gruen'},
                            {value: '#4169e1', slot: 'blau'},
                            {value: freeColor, slot: 'free'},
                        ]">
                        <template #standard>
                            <q-icon :name="icons['defaultcolor']" />
                        </template>
                        <template #rot>
                            <q-icon color="red" :name="icons['defaultcolor']" />
                        </template>
                        <template #gruen>
                            <q-icon color="green" :name="icons['defaultcolor']" />
                        </template>
                        <template #blau>
                            <q-icon color="blue" :name="icons['defaultcolor']" />
                        </template>
                        <template #free>
                            <q-btn :size="buttonsize" dense flat
                                :icon="icons['freecolor']"
                                :style="styleColorButton">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-color
                                        v-model="freeColor"
                                        format-model="hex"
                                        no-header
                                        no-footer
                                        v-close-popup
                                        default-view="palette"
                                        @update:modelValue="config.brushColor = freeColor" />
                                </q-popup-proxy>
                            </q-btn>
                        </template>
                    </q-btn-toggle>
                    <q-btn
                        :size="buttonsize" 
                        dense
                        flat
                        :icon="icons[config.brushWidth] ? icons[config.brushWidth] : icons['10']">
                        <mymenu v-model="config.brushWidth" :icons="icons" :items="linewidthmenu" />
                    </q-btn>
                    <q-input
                        v-model="config.brushWidth"
                        class="gt-sm"
                        type="number"
                        dense
                        shadow-text="px"
                        label="Linienstärke"
                        input-style="width: 5.5em" />
                </template>
                <q-space />
                <q-btn :size="buttonsize" dense no-caps class="lt-md" flat icon="menu">
                    <mymenu v-model="dummyAction" :icons="icons" :items="tool1menu" />
                </q-btn>
                <q-btn dense class="gt-sm" :icon="icons['undo']" @click="() => tafel_comp.undo()" />
                <q-btn dense class="gt-sm" :icon="icons['redo']" @click="() => tafel_comp.redo()" />
                <q-btn dense class="gt-sm" :icon="icons['zoom-out']" @click="() => tafel_comp.zoomout()" />
                <q-btn dense class="gt-sm" :icon="icons['zoom-reset']" @click="() => tafel_comp.zoomreset()" />
                <q-btn dense class="gt-sm" :icon="icons['zoom-in']" @click="() => tafel_comp.zoomin()" />
                <q-btn
                    class="gt-sm"
                    dense
                    :icon="icons['geodreieck']"
                    :unelevated="!config.geodreieckaktiv"
                    :glossy="config.darkmode && config.geodreieckaktiv"
                    @click="config.geodreieckaktiv = ! config.geodreieckaktiv">
                    <q-tooltip>Blendet ein Geodreieck ein</q-tooltip>
                </q-btn>
                <q-btn class="gt-sm" dense :icon="icons['logpapier']">
                    <mymenu v-model="dummyAction" :icons="icons" :items="vorlagenmenu"></mymenu>
                </q-btn>
                <q-btn class="gt-sm" dense :icon="icons['darkmode']" glossy @click="toggleDarkmode" />
                <q-btn
                    class="gt-sm"
                    dense
                    :icon="config.fullscreen ? 'fullscreen_exit' : 'fullscreen'"
                    :unelevated="!config.fullscreen"
                    :glossy="config.darkmode && config.fullscreen"
                    @click="toggleFullscreen" />
                <q-btn :size="buttonsize" dense label="Datei">
                    <q-menu v-model="filemenu">
                        <q-list>
                            <q-item>
                                <q-btn
                                    v-close-popup
                                    dense
                                    :icon="icons['save']"
                                    label="SVG-Export"
                                    glossy
                                    @click="() => exportBild('SVG')" />
                            </q-item>
                            <q-item>
                                <q-btn
                                    v-close-popup
                                    dense
                                    :icon="icons['save']"
                                    label="PNG-Export"
                                    glossy
                                    @click="() => exportBild('PNG')" />
                            </q-item>
                            <q-item>
                                <q-file
                                    dense
                                    clearable
                                    v-model="imgfile"
                                    label="Bild importieren"
                                    @update:modelValue="importImg" />
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </div>
            <div class="q-pa-xs full-width row">
                <q-btn 
                    dense
                    size="10px"
                    :icon="icons['radiergummi-kalibrieren']"
                    @click="radiergummiKalibrieren">
                    <q-tooltip>Radiergummi neu kalibrieren</q-tooltip>
                </q-btn>
                <q-btn 
                    dense
                    size="10px"
                    icon="done_all"
                    @click="inSvgUmwandeln">
                    <q-tooltip>Tafelbild fixieren um Rechenzeit zu sparen</q-tooltip>
                </q-btn>
                <div class="q-pa-xs">TR-Mittel: {{ config.touchradiusmittel.toFixed(3) }}</div>
                <div class="q-pa-xs">TR-Aktuell: {{ config.touchradiusaktuell.toFixed(3) }}</div>
                <q-space />
                <div class="lt-sm uhrzeit">
                    {{ datetimesm }}
                </div>
                <div class="gt-xs uhrzeit">
                    {{ datetimelg }}
                </div>
            </div>
        </q-card>
        <q-dialog v-model="mmlogDlg">
            <q-card>
                <q-card-section class="q-gutter-md">
                    <q-input
                        type="number"
                        v-model.number="groesse"
                        label="Größe" />
                    <q-input
                        type="number"
                        v-model.number="xdekaden"
                        label="Dekaden"
                        hint="x-Achse (0: mm-Papier)" />
                    <q-input
                        type="number"
                        v-model.number="ydekaden"
                        label="Dekaden"
                        hint="y-Achse (0: mm-Papier)" />
                </q-card-section>
                <q-separator />
                <q-card-actions align="right">
                    <q-btn v-close-popup flat color="primary" label="Abbrechen" />
                    <q-btn
                        v-close-popup
                        flat
                        color="primary"
                        label="OK"
                        @click="() => tafel_comp.neueVorlage('mmlogpapier', groesse, xdekaden, ydekaden)" />
                </q-card-actions>
            </q-card>
        </q-dialog>
    </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import tafel from './tafel.vue'
import mymenu from './mymenu.vue'

const tafel_comp = ref(null)
const config = ref({
    tool: 'stift',
    modus: 'zeichnen',
    brushColor: 'currentColor',
    brushWidth: 3,
    rubbersize: 100,
    rubberfaktor: {min: 2.5, max: 5},
    darkmode: true,
    fullscreen: false,
    geodreieckaktiv: false,
    hilfslinienFixiert: false,
    touchradiusaktuell: 0,
    touchradiusmittel: 0,
    ignoreradius: false
})
const freeColor = ref('yellow')
const filemenu = ref(false)
const imgfile = ref(null)
const ungespeichert = ref(false)
const mmlogDlg = ref(false)
const groesse = ref(1000)
const xdekaden = ref(0)
const ydekaden = ref(0)
const dummyAction = ref('')

const icons = ref({
    'editieren': 'svguse:icons.svg#edit|0 0 16 16',
    'stift': 'svguse:icons.svg#stift|0 0 16 16',
    'linie': 'svguse:icons.svg#linie|0 0 16 16',
    'liniesnap': 'svguse:icons.svg#liniesnap|0 0 16 16',
    'pfeil': 'svguse:icons.svg#pfeil|0 0 16 16',
    'pfeilsnap': 'svguse:icons.svg#pfeilsnap|0 0 16 16',
    'rechteck':  'svguse:icons.svg#rechteck|0 0 16 16',
    'rechteckf':  'svguse:icons.svg#rechteckf|0 0 16 16',
    'quadrat':  'svguse:icons.svg#quadrat|0 0 16 16',
    'quadratf': 'svguse:icons.svg#quadratf|0 0 16 16',
    'ellipse': 'svguse:icons.svg#ellipse|0 0 16 16',
    'ellipsef': 'svguse:icons.svg#ellipsef|0 0 16 16',
    'kreis': 'svguse:icons.svg#kreis|0 0 16 16',
    'kreisf': 'svguse:icons.svg#kreisf|0 0 16 16',
    'radieren': 'svguse:icons.svg#radiergummi',
    'darkmode': 'svguse:icons.svg#dark|0 0 16 16',
    'fullscreen': 'svguse:icons.svg#fullscreen|0 0 16 16',
    'geodreieck': 'svguse:icons.svg#geodreieck|0 0 16 16',
    'defaultcolor': 'svguse:icons.svg#defaultcolor|0 0 16 16',
    'freecolor': 'svguse:icons.svg#freecolor|0 0 16 16',
    '1' : 'svguse:icons.svg#pensize-1px',
    '3' : 'svguse:icons.svg#pensize-3px',
    '5' : 'svguse:icons.svg#pensize-5px',
    '10': 'svguse:icons.svg#pensize-10px',
    '20': 'svguse:icons.svg#pensize-20px',
    'copy': 'svguse:icons.svg#copy|0 0 16 16',
    'delete': 'svguse:icons.svg#delete|0 0 16 16',
    'fromclipboard': 'svguse:icons.svg#fromclipboard|0 0 16 16',
    'undo': 'svguse:icons.svg#undo|0 0 16 16',
    'redo': 'svguse:icons.svg#redo|0 0 16 16',
    'save': 'svguse:icons.svg#save|0 0 16 16',
    'go-bottom': 'svguse:icons.svg#go-bottom|0 0 16 16',
    'go-top': 'svguse:icons.svg#go-top|0 0 16 16',
    'go-left': 'svguse:icons.svg#go-left|0 0 16 16',
    'go-right': 'svguse:icons.svg#go-right|0 0 16 16',
    'linienpapier': 'svguse:icons.svg#linienpapier|0 0 16 16',
    'logpapier': 'svguse:icons.svg#logpapier|0 0 16 16',
    'karopapier': 'svguse:icons.svg#karopapier|0 0 16 16',
    'zoom-in': 'svguse:icons.svg#zoom-in|0 0 16 16',
    'zoom-out': 'svguse:icons.svg#zoom-out|0 0 16 16',
    'zoom-reset': 'svguse:icons.svg#zoom-reset|0 0 16 16',
    'radiergummi-kalibrieren': 'svguse:icons.svg#radiergummi-kalibrieren|0 0 22.494 21.081',
})

const vorlagenmenu = ref([
    { value: 'logpapier', label: 'LOG-Papier', click: () => mmlogDlg.value = true },
    { value: 'karopapier', label: 'Karopaier', click: () => tafel_comp.value.neueVorlage('karopapier')},
    { value: 'linienpapier', label: 'Linienpapier', click: () => tafel_comp.value.neueVorlage('linienpapier')},
])

const tool1menu = ref([
    { noclose: true, value: 'undo', label: 'Undo', click: () => tafel_comp.value.undo() },
    { noclose: true, value: 'redo', label: 'Redo', click: () => tafel_comp.value.redo()},
    { noclose: true, value: 'zoom-out', label: 'Zoom out', click: () => tafel_comp.value.zoomout()},
    { noclose: true, value: 'zoom-reset', label: 'Zoom reset', click: () => tafel_comp.value.zoomreset()},
    { noclose: true, value: 'zoom-in', label: 'Zoom in', click: () => tafel_comp.value.zoomin()},
    { value: 'geodreieck', label: 'Geodreieck', click: () => config.value.geodreieckaktiv = ! config.value.geodreieckaktiv},
    { value: 'logpapier', label: 'Vorlagen', config: {anchor: 'bottom right', self: 'bottom left'}, children: vorlagenmenu.value },
    { value: 'darkmode', label: 'Darkmode', click: toggleDarkmode},
    { value: 'fullscreen', label: 'Fullscreen', click: toggleFullscreen},
])

const linewidthmenu = ref([
    { value: '1', label: '1px'},
    { value: '3', label: '3px'},
    { value: '5', label: '5px'},
    { value: '10', label: '10px'},
    { value: '20', label: '20px'},
])

const radiergummisizemenu = ref([
    { value: '100', label: '100px'},
    { value: '300', label: '300px'},
    { value: '500', label: '500px'},
])

const toolmenu = ref([
    {value: 'ellipse',   label: 'Ellipse'},
    {value: 'ellipsef',  label: 'Ellipse gef.'},
    {value: 'kreis',     label: 'Kreis'},
    {value: 'kreisf',    label: 'Kreis gef.'},
    {value: 'rechteck',  label: 'Rechteck'},
    {value: 'rechteckf', label: 'Rechteck gef.'},
    {value: 'quadrat',   label: 'Quadrat'},
    {value: 'quadratf',  label: 'Quadrat gef.'},
    {value: 'linie',     label: 'Linie'},
    {value: 'liniesnap', label: 'Linie hor/ver'},
    {value: 'pfeil',     label: 'Pfeil'},
    {value: 'pfeilsnap', label: 'Pfeil hor/ver'},
    {value: 'stift',     label: 'Freihand'},
])

const styleColorButton = computed(() => {
    return {
        'backgroundColor': config.value.brushColor,
    }
})

const buttonsize = computed(() => Quasar.Screen.lt.sm ? 'xs' : 'md')

const datetimelongformat = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
}
const datetimesmallformat = {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: 'numeric',
    minute: 'numeric',
}
const datetimelg = ref(Intl.DateTimeFormat(navigator.language, datetimelongformat).format())
const datetimesm = ref(Intl.DateTimeFormat(navigator.language, datetimesmallformat).format())
const timerID = setInterval(updateTime, 1000);

function updateTime() {
    datetimelg.value = Intl.DateTimeFormat(navigator.language, datetimelongformat).format()
    datetimesm.value = Intl.DateTimeFormat(navigator.language, datetimesmallformat).format()
}

function toggleDarkmode() {
    config.value.darkmode = ! config.value.darkmode
    Quasar.Dark.set(config.value.darkmode)
}

function toggleFullscreen() {
    config.value.fullscreen = ! config.value.fullscreen
    if (config.value.fullscreen) {
        document.documentElement.requestFullscreen()
    }
    else {
        document.exitFullscreen()
    }
}

function fullscreenchange(evt) {
    if (document.fullscreenElement) {
        config.value.fullscreen = false
    } else {
        config.value.fullscreen = true
    }
}

async function exportBild(typ) {
    const tafel = document.getElementById('tafel')
    const gezeichnetes = tafel.getElementById("gezeichnetes")
    const rect = gezeichnetes.getBoundingClientRect()
    const svgelement = tafel.cloneNode(true)
    const x = rect.x-50
    const y = rect.y-50
    const width = rect.width+100
    const height = rect.height+100
    svgelement.setAttribute("viewBox", `${x} ${y} ${width} ${height}`)
    svgelement.setAttribute("width", `${width}px`)
    svgelement.setAttribute("height", `${height}px`)
    svgelement.removeAttribute("style")
    if (config.value.darkmode) {
        const hintergrund = document.createElement('rect')
        hintergrund.setAttribute("x", x)
        hintergrund.setAttribute("y", y)
        hintergrund.setAttribute("width", width)
        hintergrund.setAttribute("height", height)
        hintergrund.setAttribute("fill", "#1d1d1d")
        svgelement.insertBefore(hintergrund, svgelement.firstChild)
        svgelement.setAttribute("color", "#fff")
    }
    svgelement.getElementById('geodreieck')?.remove()
    svgelement.getElementById('radiergummi')?.remove()

    let url = null
    let name = 'tafelbild'
    if (typ == 'PNG') {
        url = await base64SvgToBase64Png('data:image/svg+xml;base64,'+btoa(svgelement.outerHTML), width, height).catch(console.log)
        name += '.png'
    }
    else {
        let data = new Blob([svgelement.outerHTML])
        url = URL.createObjectURL(data);
        name += '.svg'
    }

    let a = document.createElement("a");
    a.style = "display: none";
    document.body.appendChild(a);
    a.href = url
    a.download = name;
    a.click();
    a.remove();
    ungespeichert.value = false
}

function base64SvgToBase64Png (originalBase64, width, height) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image()

        img.onerror = reject
        img.onload = function () {
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            try {
                let data = canvas.toDataURL('image/png');
                resolve(data);
            } catch (error) {
                reject(error);
            }
        };

        // Durch die folgende Zuweisung wird das Bild geladen,
        // so dass onload asynchron aufgerufen wird
        img.src = originalBase64;
    });
}

function importImg(file) {
    if (!file) return
    tafel_comp.value.neuesBild(file)
    filemenu.value = false
    imgfile.value = null
    ungespeichert.value = false
}

function inSvgUmwandeln() {
    tafel_comp.value.inSvgUmwandeln()
}

function einfuegen(e) {
    e.preventDefault();
    e.stopPropagation();
    let file = e.clipboardData.items[0].getAsFile()
    importImg(file)
}

function radiergummiKalibrieren() {
    tafel_comp.value.radiergummiKalibrieren()
}

function mausrad(e) {
    if (e.deltaY > 0)
        tafel_comp.value.gobottom()
    else
        tafel_comp.value.gotop()

}

window.addEventListener('paste',einfuegen)
window.onbeforeunload = function(event) {
    if (! ungespeichert.value) return

    event.preventDefault()
    const infostr = 'Es gibt ungespeicherte Änderungen. Wollen Sie die Seite verlassen?'
    event.returnValue = infostr
    return infostr
}

provide('config', config)
provide('icons', icons)

</script>

<style>
:root {
    --gobuttonwidth: 200px;
    --gobuttongap: 10px;
}
.app {
    display: grid;
    height: 100dvh;
    grid-template-rows: 1fr auto;
}
.control {
    pointer-events: none;
}
.control > * {
    pointer-events: auto;
}
.uhrzeit {
    font-family: 'Courier New', Courier, monospace;
    font-size: large;
    font-weight: bold;
}
</style>