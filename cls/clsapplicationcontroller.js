class clsApplicationController {
  constructor() {
    window.gAPPP = this;
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.initDialogs();

    this.authorizationController = new clsAuthorizationController('#sign-in-button', '#sign-out-button');

    this.renderEngine = new clsRenderEngineController(document.querySelector("#renderCanvas"));
    this.scene = this.renderEngine.createDefaultScene();
    this.renderEngine.setScene(this.scene);
    this.toolbarItems = {};
    this.toolbarItems['scenes'] = new clsToolbarBandController('scenes', 'Scenes');
    this.toolbarItems['meshes'] = new clsToolbarBandController('meshes', 'Meshes');
    this.toolbarItems['materials'] = new clsToolbarBandController('materials', "Materials");
    this.toolbarItems['textures'] = new clsToolbarBandController('textures', 'Textures');
    this.toolbarItems['scenes'].toggle();
  }
  initGlobalHelperFunctions() {
    window.isNumeric = function(v) {
      let n = Number(v);
      return !isNaN(parseFloat(n)) && isFinite(n);
    };
  }
  beautify(editor) {
    let val = editor.session.getValue();
    let array = val.split(/\n/);
    array[0] = array[0].trim();
    val = array.join("\n");
    val = js_beautify(val);
    editor.session.setValue(val);
  }
  editor(domId) {
    let e = ace.edit(domId);
    e.setTheme("ace/theme/textmate");
    e.getSession().setMode("ace/mode/json");
    e.setOptions({
      fontFamily: '"Lucida Console",Monaco,monospace',
      fontSize: '9pt'
    });

    return e;
  }
  stringify(obj) {
    let cache = [];
    let result = JSON.stringify(obj, function(key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          return;
        }
        cache.push(value);
      }
      return value;
    });
    cache = null;
    return result;
  }
  path(obj, is, value) {
    if (typeof is == 'string')
      return this.path(obj, is.split('.'), value);
    else if (is.length == 1 && value !== undefined)
      return obj[is[0]] = value;
    else if (is.length == 0)
      return obj;
    else
      return this.path(obj[is[0]], is.slice(1), value);
  }
  emptyPromise() {
    return new Promise((resolve) => resolve());
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
      }
    ];

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
    },{
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

    this.sceneFields = [
      {
        title: 'Title',
        fireSetField: 'title',
        uiObjectField: null,
        group: 'title'
      },{
        title: 'Url',
        fireSetField: 'url',
        uiObjectField: null,
        type: 'url',
        group: 'options'
      }
    ];

    this.dialogs['meshes-edit'] = new clsPopupEditController('mesh', this.meshFields);
    this.dialogs['materials-edit'] = new clsPopupEditController('material', this.materialFields);
    this.dialogs['textures-edit'] = new clsPopupEditController('texture', textureFields);
    this.dialogs['scenes-edit'] = new clsPopupEditController('scene', this.sceneFields);

    this.dialogs['meshes-create'] = new clsPopupCreateController('#mesh-upload-dialog', ['id'], 'uploadMesh');
    this.dialogs['textures-create'] = new clsPopupCreateController('#texture-upload-dialog', ['title'], 'uploadTexture');
    this.dialogs['materials-create'] = new clsPopupCreateController('#material-upload-dialog', ['title'], 'uploadMaterial');
    this.dialogs['scenes-create'] = new clsPopupCreateController('#scene-upload-dialog', ['title'], 'uploadScene');

    this.dialogs['ace-editor-popup'] = new clsPopupUtilityController('utility-dialog-show-ace-editor');
  }
}
