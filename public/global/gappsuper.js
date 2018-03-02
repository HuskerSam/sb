'use strict';
class gAppSuper {
  constructor() {
    window.gAPPP = this;
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.styleProfileDom = null;
    this.activeContext = null;
    this.lastStyleProfileCSS = '';
    this.cdnPrefix = 'https://s3-us-west-2.amazonaws.com/hcwebflow/';
    this.shapeTypes = [
      'box', 'cylinder', 'sphere', 'text', 'plane'
    ];
    this._initShapesList();
    window.addEventListener("resize", () => this.resize());
    this.initialUILoad = true;
  }
  get dialogs() {
    return this.mV.dialogs;
  }
  handleDataUpdate() {
    this._handleDataUpdate();
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;
    this.a.initProjectModels(this.workspace);
    this.mV = new cViewMain();
    this.a._activateModels();
    this.initialUILoad = false;
    this.mV.updateProjectList(gAPPP.a.modelSets['projectTitles'].fireDataValuesByKey, gAPPP.a.profile.selectedWorkspace);
    this._updateApplicationStyle();
  }
  profileReady() {
    if (!this.initialUILoad)
      return;
    if (this.loadStarted)
      return;
    if (this.profileLoaded && this.workspaceListLoaded) {
      this.profileReadyAndLoaded();
    }
  }
  get workspace() {
    let workspace = this.a.profile.selectedWorkspace;
    if (!workspace)
      workspace = 'default';
    return workspace;
  }
  _handleDataUpdate() {
    if (this.initialUILoad)
      return;

    if (this.a.profile.canvasColor !== this.lastClearColor) {
      this.lastClearColor = this.a.profile.canvasColor;
      if (this.activeContext)
        this.activeContext.scene.clearColor = GLOBALUTIL.color(this.a.profile.canvasColor);
    }
    this._updateApplicationStyle();
  }
  resize() {
    if (this.activeContext)
      this.activeContext.engine.resize();
  }
  _parseFontSize(str) {
    if (str === undefined)
      str = '';
    let size = parseFloat(str);
    if (isNaN(size))
      size = 9;
    if (size < 7)
      size = 7;
    if (size > 22)
      size = 22;
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
    let css = '* { ';
    let fontSize = this._parseFontSize(this.a.profile.fontSize);
    css += 'font-size:' + fontSize.toString() + 'pt;';
    if (this.a.profile.fontFamily)
      css += 'font-family:' + this.a.profile.fontFamily + ';';
    css += '}';

    if (this.a.profile.showDelete) {
      css += '.band-background-preview .delete-edit-panel-button { display: inline-block; }';
    }

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
