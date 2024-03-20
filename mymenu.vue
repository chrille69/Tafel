<template>
    <q-menu>
        <q-list>
            <template v-for="item in props.items" :key="item.value">
                <template v-if="item.children">
                    <q-item clickable>
                        <q-item-section v-if="item.label">
                            {{ item.label }}
                        </q-item-section>
                        <q-item-section side>
                            <q-icon name="keyboard_arrow_right" />
                        </q-item-section>
                        <mymenu :items="item.children" :icons="props.icons" @update:modelValue="(v) => emit('update:modelValue', v)" :="item.config" />
                    </q-item>
                </template>
                <template v-else>
                    <q-item clickable v-close-popup @click="() => emit('update:modelValue', item.value)">
                        <q-item-section>
                            {{ item.label }}
                        </q-item-section>
                        <q-item-section side>
                            <q-icon :name="props.icons[item.value]" />
                        </q-item-section>
                    </q-item>
                </template>
            </template>
        </q-list>
    </q-menu>
</template>

<script setup>
const props = defineProps(['modelValue','items','icons'])
const emit = defineEmits(['update:modelValue'])
</script>./mymenu.vue