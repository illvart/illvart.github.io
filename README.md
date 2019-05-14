## [illvart.github.io](https://github.com/illvart/illvart.github.io)

> No JavaScript, just CSS!

[![Netlify Status](https://api.netlify.com/api/v1/badges/0392af17-3c20-4278-8139-7dbabd347d5c/deploy-status)](https://app.netlify.com/sites/illvart/deploys/?target=_blank)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![UI: Material Design](https://img.shields.io/badge/UI-Material%20Design-%23FF4081.svg)](https://material.io/?target=_blank)
[![Icons: Material Design Icons](https://img.shields.io/badge/Icons-Material%20Design%20Icons-%232196F3.svg)](https://github.com/templarian/MaterialDesign/?target=_blank)
[![PWA: yes](https://img.shields.io/badge/PWA-yes-%235A0FC8.svg)](https://developers.google.com/web/progressive-web-apps/?target=_blank)
[![Plugin: Workbox](https://img.shields.io/badge/Plugin-Workbox-%23F57C00.svg)](https://github.com/GoogleChrome/workbox/?target=_blank)
[![Front‑End_Checklist followed](https://img.shields.io/badge/Front‑End_Checklist-followed-brightgreen.svg)](https://github.com/thedaviddias/Front-End-Checklist/?target=_blank)

This is my first open source project. Basically, this doesn't use ~~JavaScript~~, only CSS! But support **Progressive Web Apps (PWA)** with [Workbox](https://github.com/GoogleChrome/workbox/?target=_blank).


![Screenshot](https://cdn.staticaly.com/screenshot/illvart.pinkyui.com?fullPage=true)


### Clone
Clone this repository and customization it:

```
$ git clone https://github.com/illvart/illvart.github.io.git
```

### Install Packages
Install the packages required:

```
$ yarn install
```

### Development
Running on localhost by using [http-server](https://github.com/indexzero/http-server/?target=_blank):

```
$ yarn dev
```

### Deploy
Default deploy command for **GitHub Pages**. You can also use **Netlify**, and this automatically pointing to the static directory.

```
$ yarn deploy
```

Note: Create a new branch with the name gh-pages, then deploy static directory to the gh-pages branch.

### PWA
After editing the code and adding something, then inject manifest:

```
$ yarn inject-manifest
```

### Testing
You can test netlify headers including security, cache, etc:

- [Security Headers](https://securityheaders.com/?q=https://illvart.pinkyui.com&followRedirects=on/?target=_blank)
- [webhint](https://webhint.io/scanner/7a2fa722-6fa4-43bf-b692-9400366979c6/?target=_blank)

### License
This code is available under the [MIT License](LICENSE)