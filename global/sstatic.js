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
  contextObjectField: null,
  group: 'title'
}, {
  title: 'Material Name',
  fireSetField: 'materialName',
  contextObjectField: 'material',
  group: 'title',
  type: 'material'
}, {
  title: 'Scale X',
  fireSetField: 'simpleUIDetails.scaleX',
  contextObjectField: 'scaling.x',
  group: 'scale'
}, {
  title: 'Scale Y',
  fireSetField: 'simpleUIDetails.scaleY',
  contextObjectField: 'scaling.y',
  group: 'scale'
}, {
  title: 'Scale Z',
  fireSetField: 'simpleUIDetails.scaleZ',
  contextObjectField: 'scaling.z',
  group: 'scale'
}, {
  title: 'Offset X',
  fireSetField: 'simpleUIDetails.positionX',
  contextObjectField: 'position.x',
  group: 'offset'
}, {
  title: 'Offset Y',
  fireSetField: 'simpleUIDetails.positionY',
  contextObjectField: 'position.y',
  group: 'offset'
}, {
  title: 'Offset Z',
  fireSetField: 'simpleUIDetails.positionZ',
  contextObjectField: 'position.z',
  group: 'offset'
}, {
  title: 'Rotate X',
  fireSetField: 'simpleUIDetails.rotateX',
  contextObjectField: 'rotation.x',
  group: 'rotate'
}, {
  title: 'Rotate Y',
  fireSetField: 'simpleUIDetails.rotateY',
  contextObjectField: 'rotation.y',
  group: 'rotate'
}, {
  title: 'Rotate Z',
  fireSetField: 'simpleUIDetails.rotateZ',
  contextObjectField: 'rotation.z',
  group: 'rotate'
}, {
  title: 'Mesh Url',
  fireSetField: 'url',
  contextObjectField: null,
  type: 'url',
  uploadType: 'mesh',
  group: 'url'
}];

__localStaticStorageForBindingFields['material'] = [{
  title: 'Title',
  fireSetField: 'title',
  contextObjectField: null,
  group: 'title'
}, {
  title: 'Name (scene id)',
  fireSetField: 'name',
  contextObjectField: 'name',
  type: 'id',
  group: 'title'
}, {
  title: 'Wireframe',
  fireSetField: 'wireframe',
  contextObjectField: 'wireframe',
  type: 'boolean',
  group: 'options'
}, {
  title: 'Alpha Level',
  fireSetField: 'alpha',
  contextObjectField: 'alpha',
  group: 'options'
}, {
  title: 'Diffuse Color (main)',
  fireSetField: 'diffuseColor',
  contextObjectField: 'diffuseColor',
  type: 'color',
  group: 'diffuseColor'
}, {
  title: 'Diffuse Texture Name',
  fireSetField: 'diffuseTextureName',
  contextObjectField: 'diffuseTexture',
  type: 'texture',
  group: 'diffuseColor'
}, {
  title: 'Ambient Color (reflects)',
  fireSetField: 'ambientColor',
  contextObjectField: 'ambientColor',
  type: 'color',
  group: 'ambientColor'
}, {
  title: 'Ambient Texture Name',
  fireSetField: 'ambientTextureName',
  contextObjectField: 'ambientTexture',
  type: 'texture',
  group: 'ambientColor'
}, {
  title: 'Emissive Color (glows)',
  fireSetField: 'emissiveColor',
  contextObjectField: 'emissiveColor',
  type: 'color',
  group: 'emissiveColor'
}, {
  title: 'Emissive Texture Name',
  fireSetField: 'emissiveTextureName',
  contextObjectField: 'emissiveTexture',
  type: 'texture',
  group: 'emissiveColor'
}, {
  title: 'Specular Power',
  fireSetField: 'specularPower',
  contextObjectField: 'specularPower',
  group: 'specularPower'
}, {
  title: 'Specular over Alpha',
  fireSetField: 'useSpecularOverAlpha',
  contextObjectField: 'useSpecularOverAlpha',
  group: 'specularPower',
  type: 'boolean'
}, {
  title: 'Gloss From Specular',
  fireSetField: 'useGlossinessFromSpecularMapAlpha',
  contextObjectField: 'specularPower',
  group: 'specularPower',
  type: 'boolean',
}, {
  title: 'Specular Color (shines)',
  fireSetField: 'specularColor',
  contextObjectField: 'specularColor',
  group: 'specularColor',
  type: 'color'
}, {
  title: 'Specular Texture Name',
  fireSetField: 'specularTextureName',
  contextObjectField: 'specularTexture',
  group: 'specularColor',
  type: 'texture'
}, {
  title: 'Backface Culling',
  fireSetField: 'backfaceCulling',
  contextObjectField: 'backfaceCulling',
  type: 'boolean'
}];

__localStaticStorageForBindingFields['texture'] = [{
  title: 'Title',
  fireSetField: 'title',
  contextObjectField: null,
  group: 'title'
}, {
  title: 'has Alpha',
  fireSetField: 'hasAlpha',
  contextObjectField: 'hasAlpha',
  type: 'boolean',
  group: 'options'
}, {
  title: 'Offset v (0-1)',
  fireSetField: 'vOffset',
  contextObjectField: 'vOffset',
  group: 'offset'
}, {
  title: 'Offset u (0-1)',
  fireSetField: 'uOffset',
  contextObjectField: 'uOffset',
  group: 'offset'
}, {
  title: 'Scale v (1/x)',
  fireSetField: 'vScale',
  contextObjectField: 'vScale',
  group: 'scale'
}, {
  title: 'Scale u (1/x)',
  fireSetField: 'uScale',
  contextObjectField: 'uScale',
  group: 'scale'
}, {
  title: 'Url (Image)',
  fireSetField: 'url',
  contextObjectField: null,
  type: 'url',
  uploadType: 'texture',
  group: 'url'
}];

__localStaticStorageForBindingFields['shape'] = [{
  title: 'Title',
  fireSetField: 'title',
  contextObjectField: null,
  group: 'main'
}, {
  title: 'Shape Type',
  fireSetField: 'shapeType',
  contextObjectField: null,
  type: 'shapeType',
  group: 'main'
}];

__localStaticStorageForBindingFields['scene'] = [{
  title: 'Title',
  fireSetField: 'title',
  contextObjectField: null,
  group: 'title'
}, {
  title: 'Scene Url',
  fireSetField: 'url',
  contextObjectField: null,
  type: 'url',
  group: 'options'
}];

__localStaticStorageForBindingFields['userProfile'] = [{
  title: 'Font Family',
  fireSetField: 'fontFamily',
  contextObjectField: null,
  group: 'font'
}, {
  title: 'Font Size (pt)',
  fireSetField: 'fontSize',
  contextObjectField: null,
  group: 'font'
}, {
  title: 'Canvas Color',
  fireSetField: 'canvasColor',
  contextObjectField: null,
  type: 'color',
  group: 'main'
}, {
  title: 'Camera Vector',
  fireSetField: 'cameraVector',
  contextObjectField: null,
  group: 'camera'
}, {
  title: 'Light Intensity',
  fireSetField: 'lightIntensity',
  contextObjectField: null,
  group: 'light'
}, {
  title: 'Light Vector',
  fireSetField: 'lightVector',
  contextObjectField: null,
  group: 'light'
}, {
  title: 'Show Grid',
  fireSetField: 'showFloorGrid',
  type: 'boolean',
  contextObjectField: null,
  group: 'extras'
}, {
  title: 'Grid Depth',
  fireSetField: 'floorGridDepth',
  contextObjectField: null,
  group: 'extras'
}, {
  title: 'Show Guides',
  fireSetField: 'showSceneGuides',
  contextObjectField: null,
  type: 'boolean',
  group: 'extras'
}, {
  title: 'Disable focus lock',
  fireSetField: 'inputFocusLock',
  contextObjectField: null,
  type: 'boolean',
  group: 'inputFocusLock'
}];

__localStaticStorageForBindingFields['sceneToolsBar'] = [{
  title: 'Canvas Color',
  fireSetField: 'canvasColor',
  contextObjectField: null,
  type: 'color'
}, {
  title: 'Camera Vector',
  fireSetField: 'cameraVector',
  contextObjectField: null
}, {
  title: 'Light Intensity',
  fireSetField: 'lightIntensity',
  contextObjectField: null
}, {
  title: 'Light Vector',
  fireSetField: 'lightVector',
  contextObjectField: null
}, {
  title: 'Show Grid',
  fireSetField: 'showFloorGrid',
  type: 'boolean',
  contextObjectField: null
}, {
  title: 'Grid and Guides Depth',
  fireSetField: 'gridAndGuidesDepth',
  contextObjectField: null
}, {
  title: 'Show Guides',
  fireSetField: 'showSceneGuides',
  contextObjectField: null,
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
__defaultData['shape'] = {
  title: 'Shape',
  shapeType: 'sphere',
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
