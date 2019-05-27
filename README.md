## [illvart.github.io](https://github.com/illvart/illvart.github.io)

> No JavaScript, just CSS!

[![Netlify Status](https://api.netlify.com/api/v1/badges/0392af17-3c20-4278-8139-7dbabd347d5c/deploy-status)](https://app.netlify.com/sites/illvart/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![UI: Material Design](https://img.shields.io/badge/UI-Material%20Design-%23FF4081.svg)](https://material.io)
[![Icons: Material Design Icons](https://img.shields.io/badge/Icons-Material%20Design%20Icons-%232196F3.svg)](https://github.com/templarian/MaterialDesign)
[![PWA: yes](https://img.shields.io/badge/PWA-yes-%235A0FC8.svg)](https://developers.google.com/web/progressive-web-apps)
[![Plugin: Workbox](https://img.shields.io/badge/Plugin-Workbox-%23F57C00.svg)](https://github.com/GoogleChrome/workbox)
[![Front‑End_Checklist followed](https://img.shields.io/badge/Front‑End_Checklist-followed-brightgreen.svg)](https://github.com/thedaviddias/Front-End-Checklist)

This is my first open source project. Basically, this doesn't use ~~JavaScript~~, only CSS! But support **Progressive Web Apps (PWA)** with [Workbox](https://github.com/GoogleChrome/workbox).


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
Running on localhost by using [http-server](https://github.com/indexzero/http-server):

```
$ yarn dev
```

### PWA
After editing the code and adding something, then inject manifest:

```
$ yarn inject-manifest
```

### Deploy
Default deploy command for **GitHub Pages**. You can also use **Netlify**, and this automatically pointing to the static directory.

```
$ yarn deploy
```

Note: Create a new branch with the name gh-pages, then deploy static directory to the gh-pages branch.

### Testing
You can test netlify headers including security, cache, etc:

- [Security Headers](https://securityheaders.com/?q=https://illvart.pinkyui.com&followRedirects=on)
- [webhint](https://webhint.io/scanner/7a2fa722-6fa4-43bf-b692-9400366979c6)

### Note
Version v1.0.0 has been released, [download here](https://github.com/illvart/illvart.github.io/releases). For the next version I will include **Gulp** for optimization of development and production. Soon!

### License
This code is available under the [MIT License](LICENSE)