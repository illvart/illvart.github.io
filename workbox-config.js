module.exports = {
  globDirectory: "./static/",
  globPatterns: [
    "**/*.{html,css,js,mjs,map,jpg,jpeg,png,gif,webp,ico,svg,woff2,woff,eot,ttf,otf,json,webmanifest}"
  ],
  swDest: "./static/sw.js",
  swSrc: "precache-manifest.js"
};