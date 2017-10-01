/* singleton controller for application */
'use strict';
window.addEventListener('load', () => new scApplication());
class scApplication {
  constructor() {
    let me = this;
    window.gAPPP = this;
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.toolbarItems = {};
    this.dialogs = {};

    //load user profile
    this.a = new scAuthorization('#sign-in-button', '#sign-out-button');

    this.screenCanvas = document.querySelector('#renderCanvas');
    this.renderEngine = new SCRender(this.screenCanvas);
    this.screenSceneDetails = scBabylonUtility.createDefaultScene();
    this.renderEngine.setDefaultSceneDetails(this.screenSceneDetails);
    this.renderEngine.setSceneDetails(this.screenSceneDetails);

    this.toolbarItems['scene'] = new CTLToolband('scene', 'Scenes');
    this.toolbarItems['mesh'] = new CTLToolband('mesh', 'Meshes');
    this.toolbarItems['material'] = new CTLToolband('material', "Materials");
    this.toolbarItems['texture'] = new CTLToolband('texture', 'Textures');

    this.dialogs['mesh-edit'] = new ctlDialogEditItem('mesh');
    this.dialogs['material-edit'] = new ctlDialogEditItem('material');
    this.dialogs['textur-edit'] = new ctlDialogEditItem('texture');
    this.dialogs['scene-edit'] = new ctlDialogEditItem('scene');

    this.dialogs['mesh-create'] = new ctlDialogCreateItem('mesh', ['id']);
    this.dialogs['texture-create'] = new ctlDialogCreateItem('texture', ['title']);
    this.dialogs['material-create'] = new ctlDialogCreateItem('material', ['title']);
    this.dialogs['scene-create'] = new ctlDialogCreateItem('scene', ['title']);

    this.dialogs['ace-editor-popup'] = new SCDialogUtility('utility-dialog-show-ace-editor');
    this.dialogs['user-profile'] = new scDialogUserProfile('#user-profile-settings-dialog');

    document.querySelector('#expand-all-toolbands').addEventListener('click', e => me.expandAllBands(), false);
    document.querySelector('#collapse-all-toolbands').addEventListener('click', e => me.collapseAllBands(), false);
    document.querySelector('#user-profile-settings-button').addEventListener('click', e => me.dialogs['user-profile'].show(), false);
  }
  expandAllBands(){
    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggle(true);
  }
  collapseAllBands() {
    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggle(false);
  }
}
