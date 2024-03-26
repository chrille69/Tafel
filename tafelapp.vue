<template>
    <div @fullscreenchange="fullscreenchange">
        <tafel :config="config" ref="tafel_comp" style="min-width: 100vw; height: 100vh; overflow: visible"/>
        <q-card class="q-ma-md" style="position: absolute; bottom: 10px ">
            <q-card-section class="row q-gutter-md items-center q-pa-sm">
                <q-btn dense :icon="icons['save']" glossy @click="speichern" />
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
    rubbersize: 10,
    darkmode: true,
    fullscreen: false,
    geodreieckaktiv: false
})
const freeColor = ref('yellow')

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

window.addEventListener('paste',einfuegen)

provide('config', config)
</script>
