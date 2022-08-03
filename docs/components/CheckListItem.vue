<script>
import { XIcon, VIcon, IIcon } from './icons.js';

export default {
    props: ['title', 'type'],
    data(){
        return {
            colors: {
                i: {
                    light: {
                        text: '#ce9f28',
                        icon: '#ce9f28'
                    },
                    dark: {
                        text: '#E6C888',
                        icon: '#FCD86D'
                    }
                },
                x: {
                    light: {
                        text: '#d76666',
                        icon: '#d76666'
                    },
                    dark: {
                        text: '#F57F7F',
                        icon: '#FA7070'
                    }
                },
                v: {
                    light: {
                        text: '#1eb14d',
                        icon: '#1eb14d'
                    },
                    dark: {
                        text: '#96E0B1',
                        icon: '#4ade80'
                    }
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
    color: v-bind(colors[type].light.text);
}

.c-checklist__icon svg{
    fill: v-bind(colors[type].light.icon);
}

.dark .c-checklist__text{
    color: v-bind(colors[type].dark.text);
}

.dark .c-checklist__icon svg{
    fill: v-bind(colors[type].dark.icon);
}
</style>