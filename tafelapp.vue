<template>
    <div @fullscreenchange="fullscreenchange">
        <tafel :config="config" ref="tafel_comp" style="min-width: 100vw; height: 100vh; overflow: visible"/>
        <q-card class="q-ma-md" style="position: absolute; bottom: 10px ">
            <q-card-section class="row q-gutter-md items-center q-pa-sm">
                <q-btn dense :icon="icons['save']" label="SVG" glossy @click="speichern" />
                <q-btn dense :icon="icons['save']" label="JSON" glossy @click="exportJson" />
                <q-file v-model="jsonfile" label="Import" @update:modelValue="importJson" />
                <q-btn dense :icon="icons['darkmode']" flat :unelevated="!config.darkmode" :glossy="config.darkmode" @click="toggleDarkmode" />
                <q-btn dense :icon="icons['fullscreen']" :unelevated="!config.fullscreen" :glossy="config.darkmode && config.fullscreen" @click="toggleFullscreen" />
                <q-btn dense :icon="icons['geodreieck']" :unelevated="!config.geodreieckaktiv" :glossy="config.darkmode && config.geodreieckaktiv" @click="config.geodreieckaktiv = ! config.geodreieckaktiv" />
                <q-btn dense :icon="icons['undo']" @click="() => tafel_comp.undo()" />
                <q-btn dense :icon="icons['redo']" @click="() => tafel_comp.redo()" />
                <q-btn-toggle v-model="config.modus" dense push glossy toggle-color="primary"
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
                <template v-if="config.modus == 'radieren'">
                    <div>
                        <q-input dense type="number" v-model="config.rubbersize" label="Radierergröße"  />
                    </div>
                </template>
                <template v-else-if="config.modus == 'editieren'">
                    <q-btn dense :icon="icons['copy']" glossy @click="tafel_comp.copySelected"/>
                    <q-btn dense :icon="icons['delete']" glossy @click="tafel_comp.deleteSelected"/>
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
                    <q-input type="number" dense shadow-text="px" v-model="config.brushWidth" label="Linienstärke" input-style="width: 5.5em">
                        <template v-slot:before>
                            <q-btn dense flat :icon="icons[config.brushWidth] ? icons[config.brushWidth] : icons['3']">
                                <mymenu v-model="config.brushWidth" :icons="icons" :items="linewidthmenu" />
                            </q-btn>
                        </template>
                    </q-input>
                </template>
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
import { ref, computed, provide } from 'vue'
import tafel from './tafel.vue'
import mymenu from './mymenu.vue'

Quasar.Dark.toggle()

const tafel_comp = ref(null)
const config = ref({
    tool: 'stift',
    modus: 'zeichnen',
    brushColor: 'currentColor',
    brushWidth: 3,
    rubbersize: 100,
    darkmode: true,
    fullscreen: false,
    geodreieckaktiv: false
})
const freeColor = ref('yellow')
const jsonfile = ref(null)

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
    'geodreieck': 'svguse:icons.svg#geodreieck-icon|0 0 16 16',
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
})

const linewidthmenu = ref([
    { value: '1', label: '1px'},
    { value: '3', label: '3px'},
    { value: '5', label: '5px'},
    { value: '20', label: '20px'},
])

const toolmenu = ref([
    {value: 'linien', label: 'Linien', config: {anchor: 'bottom right', self: 'bottom left'}, children: [
        {value: 'linie', label: 'Linie'},
        {value: 'liniesnap', label: 'Linie hor/ver'},
        {value: 'pfeil', label: 'Pfeil'},
        {value: 'pfeilsnap', label: 'Pfeil hor/ver'},
    ]},
    {value: 'rechtecke', label: 'Rechtecke', config: {anchor: 'bottom right', self: 'bottom left'}, children: [
        {value: 'rechteck', label: 'Rechteck'},
        {value: 'rechteckf', label: 'Rechteck gef.'},
        {value: 'quadrat',  label: 'Quadrat'},
        {value: 'quadratf', label: 'Quadrat gef.'},
    ]},
    {value: 'ellipsen', label: 'Ellipsen', config: {anchor: 'bottom right', self: 'bottom left'}, children: [
        {value: 'ellipse', label: 'Ellipse'},
        {value: 'ellipsef', label: 'Ellipse gef.'},
        {value: 'kreis', label: 'Kreis'},
        {value: 'kreisf', label: 'Kreis gef.'},
    ]},
    {value: 'stift', label: 'Schreiben'},
])

const styleColorButton = computed(() => {
    return {
        'backgroundColor': config.value.brushColor,
    }
})

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
    console.log(evt)
    if (document.fullscreenElement) {
        config.value.fullscreen = false
    } else {
        config.value.fullscreen = true
    }
}

function einfuegen(e) {
    e.preventDefault();
    e.stopPropagation();
    let file = e.clipboardData.items[0].getAsFile()
    tafel_comp.value.neuesBild(file)
}

function speichern() {
    const svgelement = document.getElementById('tafel').cloneNode(true)
    if (config.value.darkmode) {
        svgelement.setAttribute("style", "background-color: #1d1d1d; color: #fff;")
    }
    let a = document.createElement("a");
    a.style = "display: none";
    document.body.appendChild(a);
    let data = new Blob([svgelement.outerHTML])
    let url = URL.createObjectURL(data);
    console.log(url)
    a.href = url
    a.download = 'tafelbild.svg';
    a.click();
    a.remove();
}

function exportJson() {
    let a = document.createElement("a");
    a.style = "display: none";
    document.body.appendChild(a);
    let data = new Blob([tafel_comp.value.exportJson()])
    let url = URL.createObjectURL(data);
    console.log(url)
    a.href = url
    a.download = 'tafelbild.json';
    a.click();
    a.remove();
}

function importJson(file) {
    let fr = new FileReader()
    fr.onload = function(e) {
        tafel_comp.value.importJson(fr.result)
    }
    fr.readAsText(file)
}

window.addEventListener('paste',einfuegen)

provide('config', config)

const testjson = `{"bilder":[{"attr":{"width":170,"height":157,"href":"data:image/png;base64,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"},"transform":"translate(451px, 417px)","el":{},"id":2}],"pfade":[{"tool":"stift","startpos":{"x":364,"y":409,"z":0,"w":1},"points":[["M",364,409],["L",364,409]],"attr":{"stroke":"currentColor","stroke-width":3,"fill":"none","vector-effect":"non-scaling-stroke"},"transform":"","el":{},"id":1}]}`
const testjson2 = `{
    "bilder": [],
    "pfade": [
        {
            "tool": "stift",
            "startpos": {
                "x": 217,
                "y": 301,
                "z": 0,
                "w": 1
            },
            "points": [
                [
                    "M",
                    217,
                    301
                ],
                [
                    "L",
                    217,
                    301
                ],
                [
                    "L",
                    221,
                    300
                ],
                [
                    "L",
                    231,
                    300
                ],
                [
                    "L",
                    242,
                    300
                ],
                [
                    "L",
                    257,
                    300
                ],
                [
                    "L",
                    273,
                    302
                ],
                [
                    "L",
                    291,
                    308
                ],
                [
                    "L",
                    308,
                    315
                ],
                [
                    "L",
                    319,
                    319
                ],
                [
                    "L",
                    328,
                    325
                ],
                [
                    "L",
                    330,
                    328
                ],
                [
                    "L",
                    333,
                    332
                ],
                [
                    "L",
                    333,
                    336
                ],
                [
                    "L",
                    333,
                    342
                ],
                [
                    "L",
                    332,
                    349
                ],
                [
                    "L",
                    324,
                    357
                ],
                [
                    "L",
                    313,
                    364
                ],
                [
                    "L",
                    300,
                    372
                ],
                [
                    "L",
                    282,
                    382
                ],
                [
                    "L",
                    268,
                    390
                ],
                [
                    "L",
                    257,
                    397
                ],
                [
                    "L",
                    248,
                    402
                ],
                [
                    "L",
                    245,
                    406
                ],
                [
                    "L",
                    242,
                    408
                ],
                [
                    "L",
                    242,
                    412
                ],
                [
                    "L",
                    242,
                    415
                ],
                [
                    "L",
                    242,
                    419
                ],
                [
                    "L",
                    245,
                    425
                ],
                [
                    "L",
                    251,
                    434
                ],
                [
                    "L",
                    256,
                    440
                ],
                [
                    "L",
                    264,
                    450
                ],
                [
                    "L",
                    271,
                    458
                ],
                [
                    "L",
                    277,
                    464
                ],
                [
                    "L",
                    283,
                    470
                ],
                [
                    "L",
                    283,
                    474
                ],
                [
                    "L",
                    285,
                    478
                ],
                [
                    "L",
                    285,
                    480
                ],
                [
                    "L",
                    285,
                    482
                ],
                [
                    "L",
                    285,
                    483
                ],
                [
                    "L",
                    283,
                    485
                ],
                [
                    "L",
                    281,
                    486
                ],
                [
                    "L",
                    275,
                    487
                ],
                [
                    "L",
                    267,
                    487
                ],
                [
                    "L",
                    256,
                    487
                ],
                [
                    "L",
                    245,
                    487
                ],
                [
                    "L",
                    234,
                    485
                ],
                [
                    "L",
                    222,
                    480
                ],
                [
                    "L",
                    214,
                    478
                ],
                [
                    "L",
                    208,
                    477
                ],
                [
                    "L",
                    204,
                    475
                ],
                [
                    "L",
                    200,
                    473
                ],
                [
                    "L",
                    199,
                    471
                ],
                [
                    "L",
                    197,
                    470
                ],
                [
                    "L",
                    197,
                    468
                ]
            ],
            "attr": {
                "stroke": "currentColor",
                "stroke-width": 3,
                "fill": "none",
                "vector-effect": "non-scaling-stroke"
            },
            "transform": "",
            "el": {},
            "id": 1
        },
        {
            "tool": "stift",
            "startpos": {
                "x": 442,
                "y": 334,
                "z": 0,
                "w": 1
            },
            "points": [
                [
                    "M",
                    442,
                    334
                ],
                [
                    "L",
                    442,
                    334
                ],
                [
                    "L",
                    436,
                    341
                ],
                [
                    "L",
                    432,
                    348
                ],
                [
                    "L",
                    427,
                    359
                ],
                [
                    "L",
                    421,
                    371
                ],
                [
                    "L",
                    417,
                    382
                ],
                [
                    "L",
                    413,
                    393
                ],
                [
                    "L",
                    410,
                    402
                ],
                [
                    "L",
                    409,
                    408
                ],
                [
                    "L",
                    409,
                    411
                ],
                [
                    "L",
                    409,
                    414
                ],
                [
                    "L",
                    410,
                    415
                ],
                [
                    "L",
                    413,
                    418
                ],
                [
                    "L",
                    419,
                    419
                ],
                [
                    "L",
                    429,
                    419
                ],
                [
                    "L",
                    445,
                    419
                ],
                [
                    "L",
                    465,
                    419
                ],
                [
                    "L",
                    492,
                    419
                ],
                [
                    "L",
                    526,
                    414
                ],
                [
                    "L",
                    555,
                    410
                ],
                [
                    "L",
                    579,
                    405
                ],
                [
                    "L",
                    595,
                    400
                ],
                [
                    "L",
                    604,
                    396
                ],
                [
                    "L",
                    608,
                    394
                ]
            ],
            "attr": {
                "stroke": "currentColor",
                "stroke-width": 3,
                "fill": "none",
                "vector-effect": "non-scaling-stroke"
            },
            "transform": "",
            "el": {},
            "id": 2
        },
        {
            "tool": "stift",
            "startpos": {
                "x": 524,
                "y": 364,
                "z": 0,
                "w": 1
            },
            "points": [
                [
                    "M",
                    524,
                    364
                ],
                [
                    "L",
                    524,
                    364
                ],
                [
                    "L",
                    523,
                    377
                ],
                [
                    "L",
                    522,
                    392
                ],
                [
                    "L",
                    522,
                    412
                ],
                [
                    "L",
                    522,
                    434
                ],
                [
                    "L",
                    522,
                    458
                ],
                [
                    "L",
                    522,
                    483
                ],
                [
                    "L",
                    522,
                    505
                ],
                [
                    "L",
                    522,
                    521
                ],
                [
                    "L",
                    522,
                    538
                ],
                [
                    "L",
                    519,
                    553
                ],
                [
                    "L",
                    517,
                    565
                ],
                [
                    "L",
                    513,
                    577
                ],
                [
                    "L",
                    511,
                    588
                ],
                [
                    "L",
                    507,
                    597
                ]
            ],
            "attr": {
                "stroke": "currentColor",
                "stroke-width": 3,
                "fill": "none",
                "vector-effect": "non-scaling-stroke"
            },
            "transform": "",
            "el": {},
            "id": 3
        }
    ]
}`
</script>
