# Troubleshooting
Issues you might encounter and possible fixes.

[[toc]]

## Missing Web Server
Check your path in the browser window, and make sure it begins with either `http` or `https`. If it is something else, chances are that you haven't set-up a [Web Server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_is_a_web_server).

## Incorrect paths
Verify that all paths — pointing to the files — are correct.

## Some cookies are not deleted
Check the cookie's path and domain and make sure they match your configuration.

Some services — such as GA4 — might re create the deleted cookie and require you to explicitly disable the tracking using their own API.

## Some cookies are not deleted on subdomains
Some services set their cookies in the main domain even if you are on a sub-domain. The plugin is unaware of this and just searches for cookies in the current sub-domain.

You have to manually specify the `domain` field within each cookie declared in the `autoClear` object. See the [categories.autoClear](/reference/configuration-reference.html#category-autoclear) section.