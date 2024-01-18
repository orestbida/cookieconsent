# Introduction
CookieConsent is a free, open-source plugin which allows you to manage scripts — and consequently cookies — in full GDPR fashion. It is written in vanilla js and can be integrated in any web platform/framework.

## Is CookieConsent the right tool for you?
Overview of the main cons/drawbacks you should be aware of: <br><br>

<CheckListItem title="CookieConsent requires basic knowledge of javascript" type="i"/>
<CheckListItem title="CookieConsent does not have default categories or translations" type="i"/>
<CheckListItem title="CookieConsent is not a CMP" type="x"/>
<CheckListItem title="CookieConsent does not store Consent Records" type="x"/>
<CheckListItem title='CookieConsent does not implement the IAB Framework - TCF' type="x"/>

:::warning Google Ads related products
Google Ad Sense, Ad Manager and Ad Mob will no longer work with CookieConsent starting from January 2024. [Read more.](https://github.com/orestbida/cookieconsent/issues/562)
:::

## CookieConsent v2 or v3?
Both versions are very similar but there a few key differences:

### v2
<CheckListItem title="Supports older browsers such as IE10" type="v"/>
<CheckListItem title="Is in maintenance mode (only bugfix updates)" type="x"/>

### v3
<CheckListItem title="Simpler/Clearer API and config. parameters" type="v"/>
<CheckListItem title="Wider variety of layouts and button arrangements" type="v"/>
<CheckListItem title="More flexible script management options" type="v"/>
<CheckListItem title="Supports individually togglable Services" type="v"/>
<CheckListItem title="UMD and ESM variants" type="v"/>
<CheckListItem title="Supports modern browsers only" type="i"/>

## More questions?
Check the [FAQ](/additional/faq.html) section or open a [new discussion](https://github.com/orestbida/cookieconsent/discussions/new) on github.

<script setup>
import CheckListItem from "../components/CheckListItem.vue"
</script>