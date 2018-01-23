'use strict';
window.addEventListener('load', () => new gApplication());
class gApplication {
  constructor() {
    window.gAPPP = this;
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.styleProfileDom = null;
    this.activeContext = null;
    this.lastStyleProfileCSS = '';
    this.shapeTypes = [
      'box', 'cylinder', 'sphere', 'text'
    ];
    this._initShapesList();
    this.a = new gAuthorization('#sign-in-button', '#sign-out-button');

    window.addEventListener("resize", () => this.resize());
    document.addEventListener("keyup", e => {
      if (e.keyCode === 27) {
         this.mV.closeAllDialogs();
      }
    });

    this.initialUILoad = true;
    this.waitingOnProfileLoad = false;
  }
  get dialogs() {
    return this.mV.dialogs;
  }
  handleDataUpdate() {
    if (this.initialUILoad) {
      if (!this.waitingOnProfileLoad) {
        setTimeout(() => this._handleDataUpdate(), 0);
        this.waitingOnProfileLoad = true;
      }
    } else {
      this._handleDataUpdate();
    }
  }
  _handleDataUpdate() {
    if (this.initialUILoad) {
      let workspace = this.a.profile.selectedWorkspace;
      if (!workspace)
        workspace = 'default';

      this.a.initProjectModels(workspace);
      this.mV = new cViewMain();
      this.a._activateModels();
      setTimeout(() => this.mV._updateSelectedBlock(gAPPP.a.profile.selectedBlockKey), 100);
    }

    this.initialUILoad = false;
    this.activeContext.scene.clearColor = GLOBALUTIL.color(this.a.profile.canvasColor);
    this._updateApplicationStyle();
  }
  resize() {
    if (this.activeContext)
      this.activeContext.engine.resize();
  }
  _handleFontSizeChange() {
    let newSize = this.fontSizeSlider.value;
    let originalFontSize = this.a.profile.fontSize;
    let fontUpdate = {
      field: 'fontSize',
      newValue: newSize,
      oldValue: originalFontSize
    }
    gAPPP.a.modelSets['userProfile'].commitUpdateList([fontUpdate]);
  }
  _parseFontSize(str) {
    if (str === undefined)
      str = '';
    let size = parseFloat(str);
    if (isNaN(size))
      size = 9;
    if (size < 7)
      size = 7;
    if (size > 36)
      size = 36;
    return size;
  }
  _initShapesList() {
    this._domShapeList = document.createElement('datalist');
    this._domShapeList.id = 'applicationdynamicshapelistlookuplist';

    let innerHTML = '';
    for (let i in this.shapeTypes)
      innerHTML += '<option>' + this.shapeTypes[i] + '</option>';
    this._domShapeList.innerHTML = innerHTML;

    document.body.appendChild(this._domShapeList);
  }
  _updateApplicationStyle() {
    let css = 'html, body { ';
    let fontSize = this._parseFontSize(this.a.profile.fontSize);
    css += 'font-size:' + fontSize.toString() + 'pt;';
    if (this.a.profile.fontFamily)
      css += 'font-family:' + this.a.profile.fontFamily + ';';
    css += '}';

    if (this.lastStyleProfileCSS === css)
      return;
    this.lastStyleProfileCSS = css;

    if (this.styleProfileDom !== null) {
      this.styleProfileDom.parentNode.removeChild(this.styleProfileDom);
    }

    this.styleProfileDom = document.createElement('style');
    this.styleProfileDom.innerHTML = css;
    document.body.appendChild(this.styleProfileDom);
    this.resize();
  }
}
