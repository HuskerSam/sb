class clsPopupDialogs {
  constructor() {
    this.dialogs = {};

    let meshFields = [{
      title: 'Title',
      fireSetField: 'title',
      babylonMeshField: null
    }, {
      title: 'Scale X',
      fireSetField: 'simpleUIDetails.scaleX',
      babylonMeshField: 'scaling.x',
      group: 'scale'
    }, {
      title: 'Scale Y',
      fireSetField: 'simpleUIDetails.scaleY',
      babylonMeshField: 'scaling.y',
      group: 'scale'
    }, {
      title: 'Scale Z',
      fireSetField: 'simpleUIDetails.scaleZ',
      babylonMeshField: 'scaling.z',
      group: 'scale'
    }, {
      title: 'Offset X',
      fireSetField: 'simpleUIDetails.positionX',
      babylonMeshField: 'position.x',
      group: 'offset'
    }, {
      title: 'Offset Y',
      fireSetField: 'simpleUIDetails.positionY',
      babylonMeshField: 'position.y',
      group: 'offset'
    }, {
      title: 'Offset Z',
      fireSetField: 'simpleUIDetails.positionZ',
      babylonMeshField: 'position.z',
      group: 'offset'
    }, {
      title: 'Rotate X',
      fireSetField: 'simpleUIDetails.rotateX',
      babylonMeshField: 'rotation.x',
      group: 'rotate'
    }, {
      title: 'Rotate Y',
      fireSetField: 'simpleUIDetails.rotateY',
      babylonMeshField: 'rotation.y',
      group: 'rotate'
    }, {
      title: 'Rotate Z',
      fireSetField: 'simpleUIDetails.rotateZ',
      babylonMeshField: 'rotation.z',
      group: 'rotate'
    }];

    let materialFields = [{
      title: 'Title',
      fireSetField: 'title',
      babylonMeshField: null,
      group: 'title'
    }, {
      title: 'Wireframe',
      fireSetField: 'wireFrame',
      babylonMeshField: null,
      group: 'title'
    }, {
      title: 'Alpha',
      fireSetField: 'alpha',
      babylonMeshField: null,
      group: 'title'
    }, {
      title: 'Diffuse Color (main)',
      fireSetField: 'diffuseColor',
      babylonMeshField: null,
      group: 'diffuseColor'
    }, {
      title: 'Diffuse Texture Name',
      fireSetField: 'diffuseTextureName',
      babylonMeshField: null,
      group: 'diffuseColor'
    }, {
      title: 'Ambient Color (reflects)',
      fireSetField: 'ambientColor',
      babylonMeshField: null,
      group: 'ambientColor'
    }, {
      title: 'Ambient Texture Name',
      fireSetField: 'ambientTextureName',
      babylonMeshField: null,
      group: 'ambientColor'
    }, {
      title: 'Emissive Color (emits)',
      fireSetField: 'emissiveColor',
      babylonMeshField: null,
      group: 'emissiveColor'
    }, {
      title: 'Emissive Texture Name',
      fireSetField: 'emissiveTextureName',
      babylonMeshField: null,
      group: 'emissiveColor'
    }, {
      title: 'Specular Power',
      fireSetField: 'specularPower',
      babylonMeshField: null,
      group: 'specularPower'
    }, {
      title: 'useSpecularOverAlpha',
      fireSetField: 'useSpecularOverAlpha',
      babylonMeshField: null,
      group: 'specularPower'
    }, {
      title: 'Specular Color (shines)',
      fireSetField: 'specularColor',
      babylonMeshField: null,
      group: 'specularColor'
    }, {
      title: 'Specular Texture Name',
      fireSetField: 'specularTextureName',
      babylonMeshField: null,
      group: 'specularColor'
    }, {
      title: 'Backface Culling',
      fireSetField: 'backfaceCulling',
      babylonMeshField: null
    }];

    let textureFields = [{
      title: 'Title',
      fireSetField: 'title',
      babylonMeshField: null,
      group: 'title'
    }, {
      title: 'Name',
      fireSetField: 'name',
      babylonMeshField: null,
      group: 'title'
    }, {
      title: 'Alpha',
      fireSetField: 'hasAlpha',
      babylonMeshField: null,
      group: 'title'
    }, {
      title: 'Offset v',
      fireSetField: 'vOffset',
      babylonMeshField: null,
      group: 'offset'
    }, {
      title: 'Offset u',
      fireSetField: 'uOffset',
      babylonMeshField: null,
      group: 'offset'
    }, {
      title: 'Scale v',
      fireSetField: 'vScale',
      babylonMeshField: null,
      group: 'scale'
    }, {
      title: 'Scale u',
      fireSetField: 'uScale',
      babylonMeshField: null,
      group: 'scale'
    }];

    this.dialogs['meshes-edit'] = new clsCanvasPopup('mesh', meshFields);
    this.dialogs['materials-edit'] = new clsCanvasPopup('material', materialFields);
    this.dialogs['textures-edit'] = new clsCanvasPopup('texture', textureFields);

    this.dialogs['meshes-create'] = new clsCreatePopup('#mesh-upload-dialog', ['id'], 'uploadMesh');
    this.dialogs['textures-create'] = new clsCreatePopup('#texture-upload-dialog', ['title'], 'uploadTexture');
    this.dialogs['materials-create'] = new clsCreatePopup('#material-upload-dialog', ['title'], 'uploadMaterial');

    this.dialogs['ace-editor-popup'] = new clsUtilityPopup('utility-dialog-show-ace-editor');
  }
}
