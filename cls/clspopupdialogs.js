class clsPopupDialogs {
  constructor() {
    this.dialogs = {};

    let meshFields = [{
        title: 'Title',
        fireSetField: 'title',
        uiObjectField: null,
        group: 'title'
      }, {
        title: 'Name (scene id)',
        fireSetField: 'name',
        uiObjectField: name,
        group: 'title'
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
      }
    ];

    let materialFields = [{
      title: 'Title',
      fireSetField: 'title',
      uiObjectField: null,
      group: 'title'
    }, {
      title: 'Name (scene id)',
      fireSetField: 'name',
      uiObjectField: name,
      group: 'title'
    }, {
      title: 'Wireframe',
      fireSetField: 'wireFrame',
      uiObjectField: null,
      group: 'options'
    }, {
      title: 'Alpha',
      fireSetField: 'alpha',
      uiObjectField: null,
      group: 'options'
    }, {
      title: 'Diffuse Color (main)',
      fireSetField: 'diffuseColor',
      uiObjectField: null,
      group: 'diffuseColor'
    }, {
      title: 'Diffuse Texture Name',
      fireSetField: 'diffuseTextureName',
      uiObjectField: null,
      group: 'diffuseColor'
    }, {
      title: 'Ambient Color (reflects)',
      fireSetField: 'ambientColor',
      uiObjectField: null,
      group: 'ambientColor'
    }, {
      title: 'Ambient Texture Name',
      fireSetField: 'ambientTextureName',
      uiObjectField: null,
      group: 'ambientColor'
    }, {
      title: 'Emissive Color (emits)',
      fireSetField: 'emissiveColor',
      uiObjectField: null,
      group: 'emissiveColor'
    }, {
      title: 'Emissive Texture Name',
      fireSetField: 'emissiveTextureName',
      uiObjectField: null,
      group: 'emissiveColor'
    }, {
      title: 'Specular Power',
      fireSetField: 'specularPower',
      uiObjectField: null,
      group: 'specularPower'
    }, {
      title: 'useSpecularOverAlpha',
      fireSetField: 'useSpecularOverAlpha',
      uiObjectField: null,
      group: 'specularPower'
    }, {
      title: 'useGlossinessFromSpecularMapAlpha',
      fireSetField: 'useGlossinessFromSpecularMapAlpha',
      uiObjectField: null,
      group: 'specularPower'
    }, {
      title: 'Specular Color (shines)',
      fireSetField: 'specularColor',
      uiObjectField: null,
      group: 'specularColor'
    }, {
      title: 'Specular Texture Name',
      fireSetField: 'specularTextureName',
      uiObjectField: null,
      group: 'specularColor'
    }, {
      title: 'Backface Culling',
      fireSetField: 'backfaceCulling',
      uiObjectField: null
    }];

    let textureFields = [{
      title: 'Title',
      fireSetField: 'title',
      uiObjectField: null,
      group: 'title'
    },{
      title: 'Url',
      fireSetField: 'url',
      uiObjectField: null,
      uiType: 'texture',
      group: 'options'
    }, {
      title: 'Alpha',
      fireSetField: 'hasAlpha',
      uiObjectField: 'hasAlpha',
      uiType: 'boolean',
      group: 'options'
    }, {
      title: 'Offset v',
      fireSetField: 'vOffset',
      uiObjectField: 'vOffset',
      group: 'offset'
    }, {
      title: 'Offset u',
      fireSetField: 'uOffset',
      uiObjectField: 'uOffset',
      group: 'offset'
    }, {
      title: 'Scale v',
      fireSetField: 'vScale',
      uiObjectField: 'vScale',
      group: 'scale'
    }, {
      title: 'Scale u',
      fireSetField: 'uScale',
      uiObjectField: 'uScale',
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
