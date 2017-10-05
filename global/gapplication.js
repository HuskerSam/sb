/* singleton controller for application */
'use strict';
window.addEventListener('load', () => new gApplication());
class gApplication {
  constructor() {
    let me = this;
    window.gAPPP = this;
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.toolbarItems = {};
    this.dialogs = {};

    //load user profile
    this.a = new gAuthorization('#sign-in-button', '#sign-out-button');

    this.screenCanvas = document.querySelector('#renderCanvas');
    this.renderEngine = new gRender(this.screenCanvas);
    this.screenSceneDetails = sBabylonUtility.createDefaultScene();
    this.renderEngine.setDefaultSceneDetails(this.screenSceneDetails);
    this.renderEngine.setSceneDetails(this.screenSceneDetails);

    this.toolbarItems['scene'] = new cToolband('scene', 'Scenes');
    this.toolbarItems['mesh'] = new cToolband('mesh', 'Meshes');
    this.toolbarItems['material'] = new cToolband('material', "Materials");
    this.toolbarItems['texture'] = new cToolband('texture', 'Textures');

    this.dialogs['mesh-edit'] = new cDialogEditItem('mesh');
    this.dialogs['material-edit'] = new cDialogEditItem('material');
    this.dialogs['texture-edit'] = new cDialogEditItem('texture');
    this.dialogs['scene-edit'] = new cDialogEditItem('scene');

    this.dialogs['mesh-create'] = new cDialogCreateItem('mesh', 'Add Mesh');
    this.dialogs['texture-create'] = new cDialogCreateItem('texture', 'Add Texture');
    this.dialogs['material-create'] = new cDialogCreateItem('material', 'Add Material');
    this.dialogs['scene-create'] = new cDialogCreateItem('scene', 'Add Scene');

    this.dialogs['ace-editor-popup'] = new cDialogUtility('utility-dialog-show-ace-editor');
    this.dialogs['user-profile'] = new cDialogUserProfile('#user-profile-settings-dialog', 'userProfile');

    document.querySelector('#expand-all-toolbands').addEventListener('click', e => me.expandAllBands(), false);
    document.querySelector('#collapse-all-toolbands').addEventListener('click', e => me.collapseAllBands(), false);
    document.querySelector('#user-profile-settings-button').addEventListener('click', e => me.dialogs['user-profile'].show(), false);
    document.querySelector('#global-toolbar-decrease-fontsize').addEventListener('click', e => me.increaseFontSize(true), false);
    document.querySelector('#global-toolbar-increase-fontsize').addEventListener('click', e => me.increaseFontSize(), false);
    document.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e => me.a.resetProfile(), false);
  }
  expandAllBands(){
    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggle(true);
  }
  collapseAllBands() {
    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggle(false);
  }
  increaseFontSize(decrease) {
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
}
