<script>
import {
    JsIcon,
    RightArrow,
    FeatherIcon,
    SecurityIcon,
    LowVisionIcon,
    StarIcon,
    TogglesIcon
} from "./icons.js";

export default{
    data(){
        return {
            JsIcon,
            RightArrow,
            FeatherIcon,
            SecurityIcon,
            LowVisionIcon,
            StarIcon,
            TogglesIcon
        }
    }
}

</script>

<template>
    <section class="c-header">
        <h1 class="c-header__title">CookieConsent</h1>
        <h2 class="c-header__description">A lightweight and GDPR compliant consent management Tool</h2>
        <div class="c-header__actions">
            <a href="/essential/getting-started" class="c-action c-action--primary">
                <span>Get Started</span>
                <span class="right-arrow" v-html="RightArrow"></span>
            </a>
            <a href="/essential/introduction.html" class="c-action c-action--secondary">Introduction</a>
        </div>
    </section>

    <section class="max-width c-blocks">
        <div class="c-block">
            <h3 class="c-block__title">
                <span class="c-block__title-icon" v-html="FeatherIcon"></span>
                <span class="c-block__title-text">Lightweight</span>
            </h3>

            <p class="c-block__desc">Small footprint with a minimal impact on your website's performance</p>
        </div>
        <div class="c-block">
            <h3 class="c-block__title">
                <span class="c-block__title-icon" v-html="TogglesIcon"></span>
                <span class="c-block__title-text">Versatile</span>
            </h3>
            <p class="c-block__desc">A wide range of options and API to handle many different types of configurations.</p>
        </div>
        <div class="c-block">
            <h3 class="c-block__title">
                <span class="c-block__title-icon" v-html="LowVisionIcon"></span>
                <span class="c-block__title-text">Accessible</span>
            </h3>
            <p class="c-block__desc">Follows a11y best practices and enables full control via keyboard and screen readers.</p>
        </div>
    </section>

    <section class="max-width c-blocks">
        <div class="c-block">
            <h3 class="c-block__title">
                <span class="c-block__title-icon" v-html="SecurityIcon"></span>
                <span class="c-block__title-text">GDPR Compliant</span>
            </h3>
            <p class="c-block__desc">Blocks the execution of scripts until explicit consent is given and provides clear opt out options.</p>
        </div>
        <div class="c-block">
            <h3 class="c-block__title">
                <span class="c-block__title-icon" v-html="StarIcon"></span>
                <span class="c-block__title-text">Open Source</span>
            </h3>
            <p class="c-block__desc">Free and open source, maintained by the community and released under the MIT license.</p>
        </div>
        <div class="c-block">
            <h3 class="c-block__title">
                <span class="c-block__title-icon" v-html="JsIcon"></span>
                <span class="c-block__title-text">Vanilla JS</span>
            </h3>
            <p class="c-block__desc">Can be installed in any web platform or framework that supports Javascript.</p>
        </div>
    </section>

    <section class="c-footer__container">
        <div class="max-width">
            <footer class="c-footer">
                <p>Released under the <a href="https://opensource.org/licenses/MIT" target="_blank" rel="noopener noreferrer">MIT License.</a></p>
                <p>Copyright © 2020-{{ new Date().getFullYear() }} <a href="https://orestbida.com/" target="_blank">Orest Bida</a></p>
            </footer>
        </div>
    </section>

</template>

<style>

    .home-content{
        margin: 0!important;
        max-width: none!important;
        padding: 0!important;
    }
    .c-header * {
        margin: 0;
        padding: 0;
        border: none;
    }
    .c-header{
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 96px 32px;
    }

    .max-width{
        display: flex;
        flex-direction: row;
        max-width: 960px;
        margin: 0 auto;
        padding: 0 1.5rem;
    }

    .c-header__title{
        background: -webkit-linear-gradient(315deg,#f1b867 25%,#f18767);
        background-clip: text;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 4.5em;
        font-weight: 600;
    }

    .c-header__description{
        margin-top: 1rem;
        color: #c4bcb1;
        font-size: 1.4em;
        text-align: center;
    }

    .c-header__actions{
        margin-top: 3rem;
        display: flex;
        flex-direction: row;
    }

    .c-action{
        justify-content: center;
        background-color: var(--c-brand);
        border-radius: 5px;
        padding: 0.7em 1.4em .55em 1.4em;
        color: #000;
        font-weight: 600;
        border: 2px solid var(--c-brand);
        display: flex;
        flex-direction: row;
        align-items: center;
        transition: background-color .2s ease, border-color .2s ease;
    }

    .c-action:hover{
        background-color: #bb9257;
        border-color: #bb9257;
    }

    .c-action span{
        display: flex;
    }

    .c-action--primary{
        margin-right: 15px;
    }

    .right-arrow{
        margin-left: .5em;
        transition: transform .2s ease;
    }

    .c-action:hover .right-arrow{
        transform: translateX(4px);
    }

    .c-action--secondary{
        background-color: #2a2d31;
        color: #e3d6c0;
        border-color: #2a2d31;
    }

    .c-action--secondary:hover{
        background-color: #35393c;
        border-color: #35393c;
    }

    .c-blocks{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: stretch;
        margin-top: 10px;
    }

    .c-block:not(:first-child){
        margin-left: 10px;
    }

    .c-block{
        padding: 1.5rem 1.5rem;
        height: auto;
        background-color: #16181B;
        border-radius: 6px;
        flex: 1;
        transition: background-color .2s ease;
    }

    .c-block__title,
    .c-block__desc{
        margin: 0;
    }

    .c-block__title{
        font-size: 1.25em;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-bottom: 1rem;
        color: #BBC7CF;
        transition: color .2s ease;
    }

    .c-block__title span{
        display: flex;
    }

    .c-block__title-icon{
        margin-right: .75rem;
        margin-bottom: 1em;
    }

    .c-block__title-text{
        margin-top: 1px;
    }

    .c-block__desc{
        color: #8C99A1;
        transition: color .2s ease;
    }

    .c-block:hover{
        background: #202226;
    }

    .c-footer__container{
        border-top: 1px solid var(--c-divider);
        display: flex;
        margin-top: 100px;
        padding: 1.5rem;
        font-size: .88em;
    }

    .c-footer *{
        margin: 0;
        padding: 0;
    }

    .c-footer p{
        color: #7E878D;
    }

    .c-footer a{
        color: inherit;
        transition: color .25s ease;
    }

    .c-footer a:hover{
        color: #e0be87;
    }

    .c-footer{
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    @media screen and (max-width: 860px){

        .c-header__title{
            font-size: 3.5em;
        }

        .c-blocks{
            flex-direction: column;
        }

        .c-block{
            width: 100%;
        }

        .c-block:not(:first-child){
            margin-left: 0;
            margin-top: 10px;
        }
    }

    @media screen and (max-width: 500px){

        .c-header__title{
            font-size: 2.5em;
        }

        .c-header__actions{
            flex-direction: column;
        }

        .c-action--primary{
            margin-right: 0;
            margin-bottom: 10px;
        }
    }
</style>