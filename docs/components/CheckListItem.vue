<script>
import { XIcon, VIcon, IIcon } from './icons.js';

export default {
    props: ['title', 'type'],
    data(){
        return {
            colors: {
                i: {
                    text: '#E4D29B',
                    icon: '#E4C66B',
                },
                x: {
                    text: '#E19F9F',
                    icon: '#E16969',
                },
                v: {
                    text: '#96E0B1',
                    icon: '#4ade80',
                }
            },
            XIcon,
            VIcon,
            IIcon
        }
    }
}
</script>

<template>
    <div class="c-checklist">
        <div class="c-checklist__icon" v-if="type === 'x'" v-html="XIcon"></div>
        <div class="c-checklist__icon" v-if="type === 'v'" v-html="VIcon"></div>
        <div class="c-checklist__icon" v-if="type === 'i'" v-html="IIcon"></div>
        <div class="c-checklist__text" v-html="title"></div>
    </div>
</template>

<style>
.c-checklist{
    display: flex;
    flex-direction: row;
    margin-top: .7rem;
    border-radius: .4em;
}

.c-checklist__icon,
.c-checklist__text{
    display: flex;
    align-items: center;
    margin-right: .7em;
}

.c-checklist__text{
    margin-top: 1px;
    color: v-bind(colors[type].text);
}

.c-checklist__icon svg{
    fill: v-bind(colors[type].icon);
}
</style>