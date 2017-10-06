class sStatic {
  static get bindingFields() {
    return __localStaticStorageForBindingFields;
  }
  static bindingFieldsCloned(tag) {
    return JSON.parse(JSON.stringify(__localStaticStorageForBindingFields[tag]));
  }
  static get defaultData() {
    return __defaultData;
  }
  static getDefaultDataCloned(tag) {
    return JSON.parse(JSON.stringify(__defaultData[tag]));
  }
}
let __localStaticStorageForBindingFields = {};
let __defaultData = {};

__localStaticStorageForBindingFields['mesh'] = [{
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
}, {
  title: 'Mesh Url (.babylon file[Object Id])',
  fireSetField: 'url',
  uiObjectField: null,
  type: 'url',
  uploadType: 'mesh',
  group: 'url'
}];

__localStaticStorageForBindingFields['material'] = [{
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
  title: 'Alpha Level',
  fireSetField: 'alpha',
  uiObjectField: 'alpha',
  group: 'options'
}, {
  title: 'Diffuse Color (main)',
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
  title: 'Specular Power',
  fireSetField: 'specularPower',
  uiObjectField: 'specularPower',
  group: 'specularPower'
}, {
  title: 'Specular over Alpha',
  fireSetField: 'useSpecularOverAlpha',
  uiObjectField: 'useSpecularOverAlpha',
  group: 'specularPower',
  type: 'boolean'
}, {
  title: 'Gloss From Specular',
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

__localStaticStorageForBindingFields['texture'] = [{
  title: 'Title',
  fireSetField: 'title',
  uiObjectField: null,
  group: 'title'
}, {
  title: 'has Alpha',
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
}, {
  title: 'Url (Image)',
  fireSetField: 'url',
  uiObjectField: null,
  type: 'url',
  uploadType: 'texture',
  group: 'url'
}];

__localStaticStorageForBindingFields['scene'] = [{
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

__localStaticStorageForBindingFields['userProfile'] = [{
  title: 'Font Family',
  fireSetField: 'fontFamily',
  uiObjectField: null,
  group: 'font'
}, {
  title: 'Font Size (pt)',
  fireSetField: 'fontSize',
  uiObjectField: null,
  group: 'font'
}, {
  title: 'Canvas Color',
  fireSetField: 'canvasColor',
  uiObjectField: null,
  type: 'color',
  group: 'main'
}, {
  title: 'Camera Vector',
  fireSetField: 'cameraVector',
  uiObjectField: null,
  group: 'camera'
}, {
  title: 'Light Intensity',
  fireSetField: 'lightIntensity',
  uiObjectField: null,
  group: 'light'
}, {
  title: 'Light Vector',
  fireSetField: 'lightVector',
  uiObjectField: null,
  group: 'light'
}, {
  title: 'Show Grid',
  fireSetField: 'showFloorGrid',
  type: 'boolean',
  uiObjectField: null,
  group: 'extras'
}, {
  title: 'Grid Depth',
  fireSetField: 'floorGridDepth',
  uiObjectField: null,
  group: 'extras'
}, {
  title: 'Show Guides',
  fireSetField: 'showSceneGuides',
  uiObjectField: null,
  type: 'boolean',
  group: 'extras'
}, {
  title: 'Disable focus lock',
  fireSetField: 'inputFocusLock',
  uiObjectField: null,
  type: 'boolean',
  group: 'inputFocusLock'
}];

__localStaticStorageForBindingFields['sceneToolsBar'] = [{
  title: 'Canvas Color',
  fireSetField: 'canvasColor',
  uiObjectField: null,
  type: 'color'
}, {
  title: 'Camera Vector',
  fireSetField: 'cameraVector',
  uiObjectField: null
}, {
  title: 'Light Intensity',
  fireSetField: 'lightIntensity',
  uiObjectField: null
}, {
  title: 'Light Vector',
  fireSetField: 'lightVector',
  uiObjectField: null
}, {
  title: 'Show Grid',
  fireSetField: 'showFloorGrid',
  type: 'boolean',
  uiObjectField: null
}, {
  title: 'Grid and Guides Depth',
  fireSetField: 'gridAndGuidesDepth',
  uiObjectField: null
}, {
  title: 'Show Guides',
  fireSetField: 'showSceneGuides',
  uiObjectField: null,
  type: 'boolean'
}];

__defaultData['mesh'] = {
    title: 'Mesh',
    name: '',
    materialName: '',
    url: '',
    type: 'url',
    size: 0,
    simpleUIDetails: {
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: 1.0,
      positionX: 0.0,
      positionY: 0.0,
      positionZ: 0.0,
      rotateX: 0.0,
      rotateY: 0.0,
      rotateZ: 0.0
    }
};
__defaultData['scene'] = {
    title: 'Scene',
    url: '',
    type: 'url',
    size: 0,
    simpleUIDetails: {}
  };
__defaultData['texture'] = {
    title: 'Texture',
    url: '',
    vOffset: 0.0,
    uOffset: 0.0,
    vScale: 1.0,
    uScale: 1.0,
    hasAlpha: false
  };
__defaultData['material'] = {
    title: 'Material',
    name: '',
    alpha: 1.0,
    diffuseColor: '',
    diffuseTextureName: '',
    emissiveColor: '',
    emissiveTextureName: '',
    ambientColor: '',
    ambientTextureName: '',
    specularColor: '',
    specularTextureName: '',
    specularPower: 64.0,
    useSpecularOverAlpha: false,
    useGlossinessFromSpecularMapAlpha: false,
    backFaceCulling: true,
    wireframe: false
  };
