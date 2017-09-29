'use strict';
window.addEventListener('load', () => new scApplication());
class scApplication {
  constructor() {
    window.gAPPP = this;
    this.u = new SCUtility();
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.initDialogs();

    this.screenCanvas = document.querySelector('#renderCanvas');
    this.renderEngine = new SCRender(this.screenCanvas);
    this.sceneController = new SCScene();
    this.screenSceneDetails = this.sceneController.createDefaultScene();
    this.renderEngine.setDefaultSceneDetails(this.screenSceneDetails);
    this.renderEngine.setSceneDetails(this.screenSceneDetails);

    this.authorizationController = new scAuthorization('#sign-in-button', '#sign-out-button');
    this.toolbarItems = {};
    this.toolbarItems['scenes'] = new CTLToolband('scenes', 'Scenes');
    this.toolbarItems['meshes'] = new CTLToolband('meshes', 'Meshes');
    this.toolbarItems['materials'] = new CTLToolband('materials', "Materials");
    this.toolbarItems['textures'] = new CTLToolband('textures', 'Textures');

    let me = this;
    document.querySelector('#expand-all-toolbands').addEventListener('click', (e) => me.expandAllBands(), false);
    document.querySelector('#collapse-all-toolbands').addEventListener('click', (e) => me.collapseAllBands(), false);
  }
  expandAllBands(){
    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggle(true);
  }
  collapseAllBands() {
    for (let i in this.toolbarItems)
      this.toolbarItems[i].toggle(false);
  }
  initDialogs() {
    this.dialogs = {};

    this.meshFields = [{
      title: 'Title',
      fireSetField: 'title',
      uiObjectField: null,
      group: 'title'
    }, {
      title: 'Material Name',
      fireSetField: 'materialName',
      uiObjectField: 'material',
      group: 'title',
      type: 'material'
    }, {
      title: 'Scale X',
      fireSetField: 'simpleUIDetails.scaleX',
      uiObjectField: 'scaling.x',
      group: 'scale'
    }, {
      title: 'Scale Y',
      fireSetField: 'simpleUIDetails.scaleY',
      uiObjectField: 'scaling.y',
      group: 'scale'
    }, {
      title: 'Scale Z',
      fireSetField: 'simpleUIDetails.scaleZ',
      uiObjectField: 'scaling.z',
      group: 'scale'
    }, {
      title: 'Offset X',
      fireSetField: 'simpleUIDetails.positionX',
      uiObjectField: 'position.x',
      group: 'offset'
    }, {
      title: 'Offset Y',
      fireSetField: 'simpleUIDetails.positionY',
      uiObjectField: 'position.y',
      group: 'offset'
    }, {
      title: 'Offset Z',
      fireSetField: 'simpleUIDetails.positionZ',
      uiObjectField: 'position.z',
      group: 'offset'
    }, {
      title: 'Rotate X',
      fireSetField: 'simpleUIDetails.rotateX',
      uiObjectField: 'rotation.x',
      group: 'rotate'
    }, {
      title: 'Rotate Y',
      fireSetField: 'simpleUIDetails.rotateY',
      uiObjectField: 'rotation.y',
      group: 'rotate'
    }, {
      title: 'Rotate Z',
      fireSetField: 'simpleUIDetails.rotateZ',
      uiObjectField: 'rotation.z',
      group: 'rotate'
    }];

    this.materialFields = [{
      title: 'Title',
      fireSetField: 'title',
      uiObjectField: null,
      group: 'title'
    }, {
      title: 'Name (scene id)',
      fireSetField: 'name',
      uiObjectField: 'name',
      type: 'id',
      group: 'title'
    }, {
      title: 'Wireframe',
      fireSetField: 'wireframe',
      uiObjectField: 'wireframe',
      type: 'boolean',
      group: 'options'
    }, {
      title: 'Alpha (0-1)',
      fireSetField: 'alpha',
      uiObjectField: 'alpha',
      group: 'options'
    }, {
      title: 'Diffuse Color r,g,b (0-1)',
      fireSetField: 'diffuseColor',
      uiObjectField: 'diffuseColor',
      type: 'color',
      group: 'diffuseColor'
    }, {
      title: 'Diffuse Texture Name',
      fireSetField: 'diffuseTextureName',
      uiObjectField: 'diffuseTexture',
      type: 'texture',
      group: 'diffuseColor'
    }, {
      title: 'Ambient Color (reflects)',
      fireSetField: 'ambientColor',
      uiObjectField: 'ambientColor',
      type: 'color',
      group: 'ambientColor'
    }, {
      title: 'Ambient Texture Name',
      fireSetField: 'ambientTextureName',
      uiObjectField: 'ambientTexture',
      type: 'texture',
      group: 'ambientColor'
    }, {
      title: 'Emissive Color (glows)',
      fireSetField: 'emissiveColor',
      uiObjectField: 'emissiveColor',
      type: 'color',
      group: 'emissiveColor'
    }, {
      title: 'Emissive Texture Name',
      fireSetField: 'emissiveTextureName',
      uiObjectField: 'emissiveTexture',
      type: 'texture',
      group: 'emissiveColor'
    }, {
      title: 'Specular Power (64 default)',
      fireSetField: 'specularPower',
      uiObjectField: 'specularPower',
      group: 'specularPower'
    }, {
      title: 'useSpecularOverAlpha',
      fireSetField: 'useSpecularOverAlpha',
      uiObjectField: 'useSpecularOverAlpha',
      group: 'specularPower',
      type: 'boolean'
    }, {
      title: 'useGlossinessFromSpecularMapAlpha',
      fireSetField: 'useGlossinessFromSpecularMapAlpha',
      uiObjectField: 'specularPower',
      group: 'specularPower',
      type: 'boolean',
    }, {
      title: 'Specular Color (shines)',
      fireSetField: 'specularColor',
      uiObjectField: 'specularColor',
      group: 'specularColor',
      type: 'color'
    }, {
      title: 'Specular Texture Name',
      fireSetField: 'specularTextureName',
      uiObjectField: 'specularTexture',
      group: 'specularColor',
      type: 'texture'
    }, {
      title: 'Backface Culling',
      fireSetField: 'backfaceCulling',
      uiObjectField: 'backfaceCulling',
      type: 'boolean'
    }];

    let textureFields = [{
      title: 'Title',
      fireSetField: 'title',
      uiObjectField: null,
      group: 'title'
    }, {
      title: 'Url',
      fireSetField: 'url',
      uiObjectField: null,
      type: 'url',
      group: 'options'
    }, {
      title: 'Alpha',
      fireSetField: 'hasAlpha',
      uiObjectField: 'hasAlpha',
      type: 'boolean',
      group: 'options'
    }, {
      title: 'Offset v (0-1)',
      fireSetField: 'vOffset',
      uiObjectField: 'vOffset',
      group: 'offset'
    }, {
      title: 'Offset u (0-1)',
      fireSetField: 'uOffset',
      uiObjectField: 'uOffset',
      group: 'offset'
    }, {
      title: 'Scale v (1/x)',
      fireSetField: 'vScale',
      uiObjectField: 'vScale',
      group: 'scale'
    }, {
      title: 'Scale u (1/x)',
      fireSetField: 'uScale',
      uiObjectField: 'uScale',
      group: 'scale'
    }];

    this.sceneFields = [{
      title: 'Title',
      fireSetField: 'title',
      uiObjectField: null,
      group: 'title'
    }, {
      title: 'Url',
      fireSetField: 'url',
      uiObjectField: null,
      type: 'url',
      group: 'options'
    }];

    this.dialogs['meshes-edit'] = new CTLDialogEditItem('mesh', this.meshFields, 'meshes');
    this.dialogs['materials-edit'] = new CTLDialogEditItem('material', this.materialFields, 'materials');
    this.dialogs['textures-edit'] = new CTLDialogEditItem('texture', textureFields, 'textures');
    this.dialogs['scenes-edit'] = new CTLDialogEditItem('scene', this.sceneFields, 'scenes');

    this.dialogs['meshes-create'] = new CTLDialogCreateItem('mesh', ['id'], 'meshes');
    this.dialogs['textures-create'] = new CTLDialogCreateItem('texture', ['title'], 'textures');
    this.dialogs['materials-create'] = new CTLDialogCreateItem('material', ['title'], 'materials');
    this.dialogs['scenes-create'] = new CTLDialogCreateItem('scene', ['title'], 'scenes');

    this.dialogs['ace-editor-popup'] = new SCDialogUtility('utility-dialog-show-ace-editor');
  }
  initToolbars() {
    for (let i in this.toolbarItems)
      this.toolbarItems[i].init();
  }
}
