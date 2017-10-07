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

    this.a = new gAuthorization('#sign-in-button', '#sign-out-button');
    this.mV = new gMainView();
    this.mV.show();

    window.addEventListener("resize", () => this.resize());

    this.toolbarItems['scene'] = new cToolband('scene', 'Scenes');
    this.toolbarItems['mesh'] = new cToolband('mesh', 'Meshes');
    this.toolbarItems['material'] = new cToolband('material', "Materials");
    this.toolbarItems['texture'] = new cToolband('texture', 'Textures');
    this.toolbarItems['scene'].toggle();

    this.dialogs['mesh-edit'] = new cDialogEditItem('mesh', 'Mesh Options');
    this.dialogs['material-edit'] = new cDialogEditItem('material', 'Material Options');
    this.dialogs['texture-edit'] = new cDialogEditItem('texture', 'Texture Options');
    this.dialogs['scene-edit'] = new cDialogEditItem('scene', 'Scene Options');

    this.dialogs['mesh-create'] = new cDialogCreateItem('mesh', 'Add Mesh');
    this.dialogs['texture-create'] = new cDialogCreateItem('texture', 'Add Texture');
    this.dialogs['material-create'] = new cDialogCreateItem('material', 'Add Material', true);
    this.dialogs['scene-create'] = new cDialogCreateItem('scene', 'Add Scene');

    this.dialogs['user-profile'] = new cDialogUserProfile('#user-profile-settings-dialog', 'userProfile');

    document.querySelector('#expand-all-toolbands').addEventListener('click', e => this._expandAllBands(), false);
    document.querySelector('#collapse-all-toolbands').addEventListener('click', e => this._collaspseAllBands(), false);
    document.querySelector('#user-profile-settings-button').addEventListener('click', e => this.dialogs['user-profile'].show(), false);
    document.querySelector('#global-toolbar-decrease-fontsize').addEventListener('click', e => this._increaseFontSize(true), false);
    document.querySelector('#global-toolbar-increase-fontsize').addEventListener('click', e => this._increaseFontSize(), false);
    document.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e => this.a.resetProfile(), false);

  }
  handleDataUpdate() {
    this.activeContext.scene.clearColor = sUtility.color(this.a.profile.canvasColor);
    this._updateApplicationStyle();
    this.mV._updateSelectedScene();
  }
  resize() {
    if (this.activeContext)
      this.activeContext.engine.resize();
  }
  _collaspseAllBands() {
    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggle(false);
  }
  _expandAllBands() {
    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggle(true);
  }
  _increaseFontSize(decrease) {
    let originalFontSize = this.a.profile.fontSize;
    let size = sUtility.parseFontSize(originalFontSize);

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
  _updateApplicationStyle() {
    let css = 'html, body { ';
    let fontSize = sUtility.parseFontSize(this.a.profile.fontSize);
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
}
