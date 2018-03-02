'use strict';
window.addEventListener('load', () => new gApplication());
class gApplication {
  constructor() {
    window.gAPPP = this;
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.styleProfileDom = null;
    this.activeContext = null;
    this.lastStyleProfileCSS = '';
    this.cdnPrefix = 'https://s3-us-west-2.amazonaws.com/hcwebflow/';
    window.addEventListener("resize", () => this.resize());
    document.addEventListener("keyup", e => {
      if (e.keyCode === 27) {
      }
    });
}
