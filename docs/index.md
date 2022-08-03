---
layout: home

title: CookieConsent
titleTemplate: Consent management Tool

hero:
  name: CookieConsent v3
  text: ''
  tagline: A lightweight, GDPR and CCPA compliant Consent Management Tool written in vanilla JS.
  actions:
    - theme: brand
      text: Get Started ->
      link: /essential/getting-started
    - theme: alt
      text: Introduction
      link: /essential/introduction
    - theme: alt
      text: View on GitHub
      link: https://github.com/orestbida/cookieconsent

features:
  - title: Lightweight
    details: Small footprint with a minimal impact on your website's performance
  - title: Versatile
    details: A wide range of options and API to handle many different types of configurations.
  - title: Accessible
    details: Follows a11y best practices and enables full control via keyboard and screen readers.
  - title: GDPR & CCPA Compliant
    details: Blocks scripts until explicit consent is given and provides clear opt out options.
---

<style>
#app h1 .clip{
  background: -webkit-linear-gradient(315deg,var(--vp-c-green) 25%,var(--vp-c-green-dark));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
/*
#app .VPFeature .details {
  font-size: .92em;
}
*/
#app .VPFooter p {
  font-size: .85em;
}

.VPButton.medium.brand{
  font-weight: 600;
  color: #fff!important;
  border-color: #000000;
  background: #000000;
}

.VPButton.medium.brand:hover{
  border-color:  #444444;
  background: #444444;
}

.dark .VPButton.medium.brand{
  background: var(--vp-c-green);
  border-color: var(--vp-c-green);
  color: #000!important;
}

.dark #app .VPButton.medium.brand:hover{
  background: #f18767;
  border-color: #f18767
}
</style>