<template>
    <div @fullscreenchange="fullscreenchange">
        <tafel :config="config" ref="tafel_comp" style="min-width: 100vw; height: 100vh;" @wheel="mausrad" @hatgemalt="() => ungespeichert = true"/>
        <q-card class="go-left"><q-btn size="10px" glossy dense class="full-height" :icon="icons['go-left']" @click="() => tafel_comp.goleft()" /></q-card>
        <q-card class="go-right"><q-btn size="10px" glossy dense class="full-height" :icon="icons['go-right']" @click="() => tafel_comp.goright()" /></q-card>
        <q-card class="go-top"><q-btn size="10px" glossy dense class="full-width" :icon="icons['go-top']" @click="() => tafel_comp.gotop()" /></q-card>
        <div class="control q-ma-md column items-center">
            <q-card class="go-bottom q-ma-md" ><q-btn  size="10px" class="full-width" dense glossy :icon="icons['go-bottom']" @click="() => tafel_comp.gobottom()"/></q-card>
            <q-card class="full-width">
                <div class="row full-width q-gutter-sm q-pa-xs">
                    <q-btn-toggle v-model="config.modus" dense push glossy toggle-color="primary" class="q-ml-none"
                        :options="[
                            {value: 'editieren', slot: 'editieren'},
                            {value: 'radieren', slot: 'radieren'},
                            {value: 'zeichnen', slot: 'zeichnen'},
                        ]"
                    >
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
                    <q-btn dense no-caps class="lt-md" flat icon="menu">
                        <mymenu v-model="dummyAction" :icons="icons" :items="tool1menu" />
                    </q-btn>
                    <q-btn dense class="gt-sm" :icon="icons['undo']" @click="() => tafel_comp.undo()" />
                    <q-btn dense class="gt-sm" :icon="icons['redo']" @click="() => tafel_comp.redo()" />
                    <q-btn dense class="gt-sm" :icon="icons['zoom-out']" @click="() => tafel_comp.zoomout()" />
                    <q-btn dense class="gt-sm" :icon="icons['zoom-reset']" @click="() => tafel_comp.zoomreset()" />
                    <q-btn dense class="gt-sm" :icon="icons['zoom-in']" @click="() => tafel_comp.zoomin()" />
                    <q-space />
                    <template v-if="config.modus == 'radieren'">
                        <q-btn dense no-caps flat label="Größe">
                            <mymenu v-model="config.rubbersize" :icons="icons" :items="radiergummisizemenu" />
                        </q-btn>
                        <q-input class="gt-sm" dense type="number" v-model="config.rubbersize" label="Radierergröße"  />
                    </template>
                    <template v-else-if="config.modus == 'editieren'">
                        <q-btn dense :icon="icons['copy']" glossy @click="tafel_comp.copySelected"/>
                        <q-btn dense :icon="icons['delete']" glossy @click="tafel_comp.deleteSelected"/>
                        <q-checkbox label="Hilfslinien fixieren" v-model="config.hilfslinienFixiert" />
                    </template>
                    <template v-else>
                        <q-btn-toggle dense v-model="config.brushColor" push glossy toggle-color="primary"
                            :options="[
                                {value: 'currentColor', slot: 'standard'},
                                {value: '#ff0000', slot: 'rot'},
                                {value: '#00ff00', slot: 'gruen'},
                                {value: '#4169e1', slot: 'blau'},
                                {value: freeColor, slot: 'free'},
                            ]"
                        >
                            <template v-slot:standard>
                                <q-icon :name="icons['defaultcolor']" />
                            </template>
                            <template v-slot:rot>
                                <q-icon color="red" :name="icons['defaultcolor']" />
                            </template>
                            <template v-slot:gruen>
                                <q-icon color="green" :name="icons['defaultcolor']" />
                            </template>
                            <template v-slot:blau>
                                <q-icon color="blue" :name="icons['defaultcolor']" />
                            </template>
                            <template v-slot:free>
                                <q-btn dense flat
                                    :icon="icons['freecolor']"
                                    :style="styleColorButton"
                                >
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-color v-model="freeColor" format-model="hex" no-header no-footer v-close-popup default-view="palette" @update:modelValue="config.brushColor = freeColor"/>
                                    </q-popup-proxy>
                                </q-btn>
                            </template>
                        </q-btn-toggle>
                        <q-btn dense flat :icon="icons[config.brushWidth] ? icons[config.brushWidth] : icons['3']">
                            <mymenu v-model="config.brushWidth" :icons="icons" :items="linewidthmenu" />
                        </q-btn>
                        <q-input class="gt-sm" type="number" dense shadow-text="px" v-model="config.brushWidth" label="Linienstärke" input-style="width: 5.5em">
                        </q-input>
                    </template>
                    <q-space />
                    <q-btn dense class="lt-md q-ml-none" flat icon="menu">
                        <mymenu v-model="dummyAction" :icons="icons" :items="tool2menu" />
                    </q-btn>
                    <q-btn class="gt-sm" dense :icon="icons['geodreieck']" :unelevated="!config.geodreieckaktiv" :glossy="config.darkmode && config.geodreieckaktiv" @click="config.geodreieckaktiv = ! config.geodreieckaktiv" />
                    <q-btn class="gt-sm" dense :icon="icons['logpapier']">
                        <mymenu v-model="dummyAction" :icons="icons" :items="vorlagenmenu"></mymenu>
                    </q-btn>
                    <q-btn class="gt-sm" dense :icon="icons['darkmode']" glossy @click="toggleDarkmode" />
                    <q-btn class="gt-sm" dense :icon="config.fullscreen ? 'fullscreen_exit' : 'fullscreen'" :unelevated="!config.fullscreen" :glossy="config.darkmode && config.fullscreen" @click="toggleFullscreen" />
                    <q-btn dense label="Datei">
                        <q-menu v-model="filemenu">
                            <q-list>
                                <q-item>
                                    <q-btn v-close-popup dense :icon="icons['save']" label="SVG" glossy @click="exportSVG" />
                                </q-item>
                                <q-item>
                                    <q-btn v-close-popup dense :icon="icons['save']" label="JSON" glossy @click="exportJson" />
                                </q-item>
                                <q-item>
                                    <q-file dense clearable v-model="jsonfile" label="Öffne JSON" @update:modelValue="importJson" />
                                </q-item>
                                <q-item>
                                    <q-file dense clearable v-model="imgfile" label="Bild importieren" @update:modelValue="importImg" />
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </div>
                <div class="q-pa-xs full-width row">
                    <q-btn dense size="10px" :icon="icons['radiergummi-kalibrieren']" @click="radiergummiKalibrieren" />
                    <q-space />
                    <div class="lt-sm uhrzeit">
                        {{ datetimesm }}
                    </div>
                    <div class="gt-xs uhrzeit">
                        {{ datetimelg }}
                    </div>
                </div>
            </q-card>
        </div>
        <q-dialog v-model="mmlogDlg">
            <q-card>
                <q-card-section class="q-gutter-md">
                    <q-input type="number" v-model.number="groesse" label="Größe"></q-input>
                    <q-input type="number" v-model.number="xdekaden" label="Dekaden" hint="x-Achse (0: mm-Papier)"></q-input>
                    <q-input type="number" v-model.number="ydekaden" label="Dekaden" hint="y-Achse (0: mm-Papier)"></q-input>
                </q-card-section>
                <q-separator />
                <q-card-actions align="right">
                    <q-btn v-close-popup flat color="primary" label="Abbrechen" />
                    <q-btn v-close-popup flat color="primary" label="OK" @click="() => tafel_comp.neueVorlage('mmlogpapier', groesse, xdekaden, ydekaden)" />
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
    darkmode: true,
    fullscreen: false,
    geodreieckaktiv: false,
    hilfslinienFixiert: false
})
const freeColor = ref('yellow')
const filemenu = ref(false)
const jsonfile = ref(null)
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
    '1': 'svguse:icons.svg#pensize-1px|0 0 16 16',
    '3': 'svguse:icons.svg#pensize-3px|0 0 16 16',
    '5': 'svguse:icons.svg#pensize-5px|0 0 16 16',
    '20': 'svguse:icons.svg#pensize-20px|0 0 16 16',
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

const tool1menu = ref([
    { noclose: true, value: 'undo', label: 'Undo', click: () => tafel_comp.value.undo() },
    { noclose: true, value: 'redo', label: 'Redo', click: () => tafel_comp.value.redo()},
    { noclose: true, value: 'zoom-out', label: 'Zoom out', click: () => tafel_comp.value.zoomout()},
    { noclose: true, value: 'zoom-reset', label: 'Zoom reset', click: () => tafel_comp.value.zoomreset()},
    { noclose: true, value: 'zoom-in', label: 'Zoom in', click: () => tafel_comp.value.zoomin()},
])

const vorlagenmenu = ref([
    { value: 'logpapier', label: 'LOG-Papier', click: () => mmlogDlg.value = true },
    { value: 'karopapier', label: 'Karopaier', click: () => tafel_comp.value.neueVorlage('karopapier')},
    { value: 'linienpapier', label: 'Linienpapier', click: () => tafel_comp.value.neueVorlage('linienpapier')},
])

const tool2menu = ref([
    { value: 'geodreieck', label: 'Geodreieck', click: () => config.value.geodreieckaktiv = ! config.value.geodreieckaktiv},
    { value: 'logpapier', label: 'Vorlagen', config: {anchor: 'bottom right', self: 'bottom left'}, children: vorlagenmenu.value },
    { value: 'darkmode', label: 'Darkmode', click: toggleDarkmode},
    { value: 'fullscreen', label: 'Fullscreen', click: toggleFullscreen},
])

const linewidthmenu = ref([
    { value: '1', label: '1px'},
    { value: '3', label: '3px'},
    { value: '5', label: '5px'},
    { value: '20', label: '20px'},
])

const radiergummisizemenu = ref([
    { value: '100', label: '100px'},
    { value: '300', label: '300px'},
    { value: '500', label: '500px'},
])

const toolmenu = ref([
    {value: 'ellipse', label: 'Ellipse'},
    {value: 'ellipsef', label: 'Ellipse gef.'},
    {value: 'kreis', label: 'Kreis'},
    {value: 'kreisf', label: 'Kreis gef.'},
    {value: 'rechteck', label: 'Rechteck'},
    {value: 'rechteckf', label: 'Rechteck gef.'},
    {value: 'quadrat',  label: 'Quadrat'},
    {value: 'quadratf', label: 'Quadrat gef.'},
    {value: 'linie', label: 'Linie'},
    {value: 'liniesnap', label: 'Linie hor/ver'},
    {value: 'pfeil', label: 'Pfeil'},
    {value: 'pfeilsnap', label: 'Pfeil hor/ver'},
    {value: 'stift', label: 'Freihand'},
])

const styleColorButton = computed(() => {
    return {
        'backgroundColor': config.value.brushColor,
    }
})

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

function exportSVG() {
    const svgelement = document.getElementById('tafel').cloneNode(true)
    if (config.value.darkmode) {
        svgelement.setAttribute("style", "background-color: #1d1d1d; color: #fff;")
    }
    svgelement.getElementById('geodreieck').remove()

    let a = document.createElement("a");
    a.style = "display: none";
    document.body.appendChild(a);
    let data = new Blob([svgelement.outerHTML])
    let url = URL.createObjectURL(data);
    a.href = url
    a.download = 'tafelbild.svg';
    a.click();
    a.remove();
    ungespeichert.value = false
}

function exportJson() {
    let a = document.createElement("a");
    a.style = "display: none";
    document.body.appendChild(a);
    let data = new Blob([tafel_comp.value.exportJson()])
    let url = URL.createObjectURL(data);
    a.href = url
    a.download = 'tafelbild.json';
    a.click();
    a.remove();
    ungespeichert.value = false
}

function importJson(file) {
    if (!file) return

    let fr = new FileReader()
    fr.onload = function(e) {
        tafel_comp.value.importJson(fr.result)
    }
    fr.readAsText(file)
    filemenu.value = false
    jsonfile.value = null
}

function importImg(file) {
    if (!file) return
    tafel_comp.value.neuesBild(file)
    filemenu.value = false
    imgfile.value = null
    ungespeichert.value = false
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

</script>

<style>
:root {
    --gobuttonwidth: 200px;
    --gobuttongap: 10px;
    --controlheight: 100px;
}
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
    width: var(--gobuttonwidth);
}
.control {
    position: absolute;
    bottom: 0px;
    left: 0%;
    right: 0%;
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