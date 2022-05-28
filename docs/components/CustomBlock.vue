<script>
import {  InfoIcon, WarningIcon, TipIcon } from './icons.js';

export default {
    props: ['title', 'type'],
    data(){
        return {
            colors: {
                info: {
                    title: '#91CAFF',
                    body: '#C4CCD6',
                    background: 'rgba(124, 197, 255, .12)',
                    icon: 'rgba(215, 241, 255, .63)',
                    border: '#27333d'
                },
                warning: {
                    title: '#ffb571',
                    body: '#d4cdc0',
                    background: 'rgba(255, 194, 124, .1)',
                    icon: '#C9B59A',
                    border: '#3b352e'
                },
                tip: {
                    title: '#8feac8',
                    body: '#BED1CB',
                    background: 'rgba(124, 255, 236, .1)',
                    icon: '#84b1a2',
                    border: '#283939'
                }
            },
            WarningIcon,
            InfoIcon,
            TipIcon
        }
    }
}
</script>

<template>
    <div class="c-component">
        <p class="c-component__header">
            <span class="c-component__icon" v-if="type === 'info'" v-html="InfoIcon"></span>
            <span class="c-component__icon" v-if="type === 'warning'" v-html="WarningIcon"></span>
            <span class="c-component__icon" v-if="type === 'tip'" v-html="TipIcon"></span>
            <span class="c-component__title" v-html="title || 'Info'"></span>
        </p>
        <div class="c-component__body">
            <slot></slot>
        </div>
    </div>
</template>

<style>
.c-component{
    background-color: v-bind(colors[type].background);
    display: flex;
    flex-direction: column;
    padding: 0 1.2em;
    margin-top: 1em;
    margin-bottom: 2em;
    border-radius: .4em;
    border: 1px solid v-bind(colors[type].border);
}

.c-component__header,
.c-component__icon,
.c-component__title{
    display: flex;
    align-items: center;
}

.c-component__header{
    margin-bottom: -0.4rem;
    font-weight: 600;
    color: v-bind(colors[type].title);
}

.c-component__icon svg{
    fill: v-bind(colors[type].icon);
}

.c-component__title{
    margin-left: 15px;
    margin-top: -1px;
}

.c-component__body{
    color: v-bind(colors[type].body);
    margin-left: 33px;
}

.c-component__body *{
    color: v-bind(colors[type].body);
}

.c-component__body a{
    color: v-bind(colors[type].title);
}

.c-component__body a:hover{
    border-color: v-bind(colors[type].title);
}
</style>