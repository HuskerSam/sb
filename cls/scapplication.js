/* singleton controller for application */
'use strict';
window.addEventListener('load', () => new scApplication());
class scApplication {
  constructor() {
    let me = this;
    window.gAPPP = this;
    this.u = new SCUtility();
    this.s = new SCStatic();
    this.b = new scBabylonUtility();
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.toolbarItems = {};
    this.dialogs = {};

    //load user profile
    this.a = new scAuthorization('#sign-in-button', '#sign-out-button');

    this.screenCanvas = document.querySelector('#renderCanvas');
    this.renderEngine = new SCRender(this.screenCanvas);
    this.screenSceneDetails = this.b.createDefaultScene();
    this.renderEngine.setDefaultSceneDetails(this.screenSceneDetails);
    this.renderEngine.setSceneDetails(this.screenSceneDetails);


    this.toolbarItems['scenes'] = new CTLToolband('scenes', 'Scenes');
    this.toolbarItems['meshes'] = new CTLToolband('meshes', 'Meshes');
    this.toolbarItems['materials'] = new CTLToolband('materials', "Materials");
    this.toolbarItems['textures'] = new CTLToolband('textures', 'Textures');

    this.dialogs['meshes-edit'] = new CTLDialogEditItem('mesh', this.s.bindingFields['mesh'], 'meshes');
    this.dialogs['materials-edit'] = new CTLDialogEditItem('material', this.s.bindingFields['material'], 'materials');
    this.dialogs['textures-edit'] = new CTLDialogEditItem('texture', this.s.bindingFields['texture'], 'textures');
    this.dialogs['scenes-edit'] = new CTLDialogEditItem('scene', this.s.bindingFields['scene'], 'scenes');

    this.dialogs['meshes-create'] = new CTLDialogCreateItem('mesh', ['id'], 'meshes');
    this.dialogs['textures-create'] = new CTLDialogCreateItem('texture', ['title'], 'textures');
    this.dialogs['materials-create'] = new CTLDialogCreateItem('material', ['title'], 'materials');
    this.dialogs['scenes-create'] = new CTLDialogCreateItem('scene', ['title'], 'scenes');

    this.dialogs['ace-editor-popup'] = new SCDialogUtility('utility-dialog-show-ace-editor');
    this.dialogs['user-profile'] = new SCDialogUserProfile('user-profile-settings-dialog');

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
  initToolbars() {
    for (let i in this.toolbarItems)
      this.toolbarItems[i].init();
  }
}
