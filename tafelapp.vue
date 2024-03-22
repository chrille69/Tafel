<template>
    <div ref="anwendung" @fullscreenchange="fullscreenchange">
        <tafel :config="config" style="min-width: 100vw; height: 100vh; overflow: visible"/>
        <q-card class="q-ma-md" style="position: absolute; bottom: 10px ">
            <q-card-section class="row q-gutter-md items-center">
                <q-btn color="primary" label="Werkzeuge" :icon="icons[config.modus]">
                    <mymenu v-model="config.modus" :icons="icons" :items="fullmenu" />
                </q-btn>
                <q-toggle dense v-model="config.darkmode" size="xl" :checked-icon="icons['darkmode']" :unchecked-icon="icons['darkmode']" @update:modelValue="setdarkmode"/>
                <q-toggle dense v-model="config.fullscreen" size="xl" :checked-icon="icons['fullscreen']" :unchecked-icon="icons['fullscreen']" @update:modelValue="setfullscreen"/>
                <q-toggle dense v-model="config.geodreieckaktiv" size="xl" :checked-icon="icons['geodreieck']" :unchecked-icon="icons['geodreieck']" />
                <template v-if="config.modus == 'radieren'">
                    <div>
                        <q-input type="number" v-model="config.rubbersize" label="Radierergröße"  />
                    </div>
                </template>
                <template v-else>
                    <q-input type="number" v-model="config.brushWidth" label="Linienstärke"  />
                    <q-btn
                        icon="colorize"
                        :style="styleColorButton"
                        @click="config.useCurrentColor = false" >
                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                            <q-color v-model="config.brushColor" default-view="palette"/>
                        </q-popup-proxy>
                    </q-btn>
                    <q-checkbox v-model="config.useCurrentColor" label="Standardfarbe" />
                </template>
            </q-card-section>
        </q-card>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import tafel from './tafel.vue'
import mymenu from './mymenu.vue'

Quasar.Dark.toggle()

const anwendung = ref(null)
const config = ref({
    modus: 'stift',
    useCurrentColor: true,
    brushColor: '#ffffff',
    brushWidth: 3,
    rubbersize: 10,
    darkmode: true,
    fullscreen: false,
    geodreieckaktiv: false
})


const icons = ref({
    'edit': 'svguse:icons.svg#edit|0 0 16 16',
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
})

const fullmenu = ref([
    { value: 'radieren', label: 'Radieren'},
    { value: 'edit', label: 'Bearbeiten'},
    { value: 'zeichnen', label: 'Zeichnen',
        config: {
            anchor: "bottom end",
            self: "bottom start"
        },
        children: [
            { value: 'linien', label: 'Linien', children: [
                { value: 'linie', label: 'Linie'},
                { value: 'liniesnap', label: 'Linie Snap'},
                { value: 'pfeil', label: 'Pfeil'},
                { value: 'pfeilsnap', label: 'Pfeil Snap'},
            ]},
            { value: 'rechtecke', label: 'Rechtecke', children: [
                { value: 'rechteck' },
                { value: 'rechteckf', label: 'Rechteck gef.' },
                { value: 'quadrat',  label: 'Quadrat' },
                { value: 'quadratf', label: 'Quadrat gef.' },
            ]},
            { value: 'ellipsen', label: 'Ellipsen', children: [
                { value: 'ellipse', label: 'Ellipse' },
                { value: 'ellipsef', label: 'Ellipse gef.' },
                { value: 'kreis', label: 'Kreis' },
                { value: 'kreisf', label: 'Kreis gef.' },
            ]},
            { value: 'stift', label: 'Schreiben'},
        ]
    },
])

function contrastYiq(color) {
    const r = (color >>> 16) & 0xff
    const g = (color >>> 8) & 0xff
    const b = color & 0xff
    return (r * 299 + g * 587 + b * 114) / 1000
}

const styleColorButton = computed(() => {
    const brushcolorint = parseInt('0x'+config.value.brushColor.substr(1), 16)
    const color = config.value.useCurrentColor ? 0xffffff : brushcolorint
    const yiq = contrastYiq(color)

    const style = {
        'backgroundColor': config.value.useCurrentColor ? 'white' : config.value.brushColor,
        'color': config.value.useCurrentColor ? 'black' : (yiq >= 128 ? '#000000' : '#ffffff')
    }
    return style
})

function setdarkmode(isdarkmode) {
    Quasar.Dark.set(isdarkmode)
}

function setfullscreen(isfullscreen) {
    if (isfullscreen) {
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

</script>
