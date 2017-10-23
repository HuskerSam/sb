'use strict';
window.addEventListener('load', () => new gApplication());
class gApplication {
  constructor() {
    window.gAPPP = this;
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.toolbarItems = {};
    this.dialogs = {};
    this.styleProfileDom = null;
    this.activeContext = null;
    this.lastStyleProfileCSS = '';
    this.shapeTypes = [
      'box', 'cylinder', 'sphere', 'text'
    ];
    this._initShapesList();
    this.a = new gAuthorization('#sign-in-button', '#sign-out-button');
    this.mV = new cViewMain();

    this.sceneToolsButton = document.querySelector('#canvas-settings-tool-button');
    this.sceneToolsContainer = document.querySelector('.global-floating-toolbar .toolbar-content');
    this.sceneTools = new cBandOptions(this.sceneToolsButton, this.sceneToolsContainer);
    this.renderLogButton = document.querySelector('#toolbar-render-log-button');
    this.renderLog = new cPanelLog(this.renderLogButton, this.sceneToolsContainer);

    window.addEventListener("resize", () => this.resize());
    document.addEventListener("keyup", e => {
      if (e.keyCode === 27) {
        let dialog = this.__detectIfEditDialogShown();

        if (dialog)
          dialog.close();
      }
    });
    this.toolbarItems['scene'] = new cBandRecords('scene', 'Scenes');
    this.toolbarItems['block'] = new cBandRecords('block', 'Blocks');
    this.toolbarItems['mesh'] = new cBandRecords('mesh', 'Meshes');
    this.toolbarItems['shape'] = new cBandRecords('shape', 'Shapes');
    this.toolbarItems['material'] = new cBandRecords('material', "Materials");
    this.toolbarItems['texture'] = new cBandRecords('texture', 'Textures');

    this.dialogs['mesh-edit'] = new cDialogEditItem('mesh', 'Mesh Options');
    this.dialogs['shape-edit'] = new cDialogEditItem('shape', 'Shape Editor');
    this.dialogs['block-edit'] = new cDialogBlock();
    this.dialogs['material-edit'] = new cDialogEditItem('material', 'Material Editor');
    this.dialogs['texture-edit'] = new cDialogEditItem('texture', 'Texture Options');
    this.dialogs['scene-edit'] = new cDialogEditItem('scene', 'Scene Options');

    this.dialogs['mesh-create'] = new cDialogCreateItem('mesh', 'Add Mesh');
    this.dialogs['shape-create'] = new cDialogCreateItem('shape', 'Add Shape', true);
    this.dialogs['block-create'] = new cDialogCreateItem('block', 'Add Block', true);
    this.dialogs['texture-create'] = new cDialogCreateItem('texture', 'Add Texture');
    this.dialogs['material-create'] = new cDialogCreateItem('material', 'Add Material', true);
    this.dialogs['scene-create'] = new cDialogCreateItem('scene', 'Add Scene');
    this.dialogs['user-profile'] = new cDialogUserProfile(document.querySelector('#user-profile-settings-dialog'), 'userProfile');

    document.querySelector('#expand-all-toolbands').addEventListener('click', e => this._expandAllBands(), false);
    document.querySelector('#collapse-all-toolbands').addEventListener('click', e => this._collaspseAllBands(), false);
    document.querySelector('#user-profile-settings-button').addEventListener('click', e => this.dialogs['user-profile'].show(), false);
    document.querySelector('#global-toolbar-decrease-fontsize').addEventListener('click', e => this._increaseFontSize(true), false);
    document.querySelector('#global-toolbar-increase-fontsize').addEventListener('click', e => this._increaseFontSize(), false);
    document.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e => this.a.resetProfile(), false);

  }
  handleDataUpdate() {
    this._updateApplicationStyle();
    this.mV._updateSelectedScene();
    this.activeContext.scene.clearColor = GLOBALUTIL.color(this.a.profile.canvasColor);
  }
  resize() {
    if (this.activeContext)
      this.activeContext.engine.resize();
  }
  _collaspseAllBands() {
    let dialog = this.__detectIfEditDialogShown();
    if (dialog)
      return dialog.collapseAll();

    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggleChildBandDisplay(false);
  }
  _expandAllBands() {
    let dialog = this.__detectIfEditDialogShown();
    if (dialog)
      return dialog.expandAll();

    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggleChildBandDisplay(true);
  }
  _increaseFontSize(decrease) {
    let originalFontSize = this.a.profile.fontSize;
    let size = this._parseFontSize(originalFontSize);

    if (decrease)
      size -= 1;
    else
      size += 1;
    let newFontSize = size.toString();

    let fontUpdate = {
      field: 'fontSize',
      newValue: newFontSize,
      oldValue: originalFontSize
    }
    gAPPP.a.modelSets['userProfile'].commitUpdateList([fontUpdate]);
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
  }
  __detectIfEditDialogShown() {
    for (let i in this.dialogs)
      if ($(this.dialogs[i].dialog).hasClass('in'))
        return this.dialogs[i];
    return null;
  }
}
