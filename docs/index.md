---
layout: home

title: CookieConsent
titleTemplate: Consent management Tool

hero:
  name: CookieConsent
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

#app .VPFooter p {
  font-size: .85em;
}
*/

#app .VPFeature{
  border-color: var(--vp-button-alt-border)
}

.VPButton.medium.brand{
  color: #000!important;
  border-color: var(--vp-c-green);
  background: var(--vp-c-green);
  font-weight: 600;
}

#app .VPButton.medium.brand:hover{
  background: #f18767;
  border-color: #f18767
}
</style>