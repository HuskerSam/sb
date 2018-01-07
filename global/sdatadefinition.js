class sDataDefinition {
  static bindingFields(tag) {
    if (tag === 'frame') {
      let localCopy = __localStaticStorageForBindingFields[tag].slice(0);
      return localCopy.concat(this.bindingFields('baseMesh'));
    }
    if (tag === 'shape') {
      let localCopy = __localStaticStorageForBindingFields[tag].slice(0);
      return localCopy.concat(this.bindingFields('baseMesh'));
    }
    if (tag === 'mesh') {
      let localCopy = __localStaticStorageForBindingFields[tag].slice(0, 2);
      localCopy = localCopy.concat(this.bindingFields('baseMesh'));
      return localCopy.concat(__localStaticStorageForBindingFields[tag].slice(2));
    }

    return __localStaticStorageForBindingFields[tag].slice(0);
  }
  static bindingFieldsCloned(tag) {
    return JSON.parse(JSON.stringify(this.bindingFields(tag)));
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
  title: 'Preview Shape',
  fireSetField: 'previewShape',
  contextObjectField: null,
  group: 'options',
  dataListId: 'applicationdynamicshapelistlookuplist'
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
  title: 'Preview Shape',
  fireSetField: 'previewShape',
  contextObjectField: null,
  group: 'options',
  dataListId: 'applicationdynamicshapelistlookuplist'
}, {
  title: 'has Alpha',
  fireSetField: 'hasAlpha',
  contextObjectField: 'hasAlpha',
  type: 'boolean',
  group: 'options'
}, {
  title: 'Url (Image)',
  fireSetField: 'url',
  contextObjectField: null,
  type: 'url',
  uploadType: 'texture',
  group: 'url'
}, {
  title: 'Offset v (0-1)',
  fireSetField: 'vOffset',
  contextObjectField: 'vOffset',
  group: 'textureoffset',
  displayType: 'number'
}, {
  title: 'Offset u (0-1)',
  fireSetField: 'uOffset',
  contextObjectField: 'uOffset',
  group: 'textureoffset',
  displayType: 'number'
}, {
  title: 'Scale v (1/x)',
  fireSetField: 'vScale',
  contextObjectField: 'vScale',
  group: 'texturescale',
  displayType: 'number'
}, {
  title: 'Scale u (1/x)',
  fireSetField: 'uScale',
  contextObjectField: 'uScale',
  group: 'texturescale',
  displayType: 'number'
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
  group: 'font',
  dataListId: 'fontfamilydatalist'
}, {
  title: 'Font Size (pt)',
  fireSetField: 'fontSize',
  contextObjectField: null,
  group: 'font',
  displayType: 'number'
}, {
  title: 'Canvas Color',
  fireSetField: 'canvasColor',
  contextObjectField: null,
  type: 'color',
  group: 'main'
}, {
  title: 'Disable focus lock',
  fireSetField: 'inputFocusLock',
  contextObjectField: null,
  type: 'boolean',
  group: 'inputFocusLock'
}];
__localStaticStorageForBindingFields['sceneToolsBar'] = [{
  title: 'Color',
  fireSetField: 'canvasColor',
  contextObjectField: null,
  type: 'color',
  displayType: 'shortvector',
  helperType: 'vector',
  rangeMin: '0',
  rangeMax: '1',
  rangeStep: '.01'
}, {
  title: 'Sun Light',
  fireSetField: 'lightIntensity',
  contextObjectField: null,
  displayType: 'number',
  group: 'light',
  helperType: 'singleSlider',
  rangeMin: '0',
  rangeMax: '1.5',
  rangeStep: '.01',
  floatLeft: true
}, {
  title: 'Direction',
  fireSetField: 'lightVector',
  contextObjectField: null,
  helperType: 'vector',
  displayType: 'shortvector',
  rangeMin: '-1',
  rangeMax: '1',
  rangeStep: '.01',
  group: 'light'
}, {
  title: 'Origin',
  fireSetField: 'cameraVector',
  contextObjectField: null,
  displayType: 'longvector',
  helperType: 'vector',
  rangeMin: '-100',
  rangeMax: '100',
  rangeStep: '1',
  floatRight: true,
  group: 'cameraType',
  paddingRight: '.5em'
}, {
  title: 'Camera Type',
  fireSetField: 'cameraType',
  contextObjectField: null,
  group: 'cameraType',
  dataListId: 'cameratypeoptionslist',
  floatLeft: true
}, {
  title: 'Aim Center',
  fireSetField: 'cameraAimCenter',
  contextObjectField: null,
  group: 'cameraType',
  type: 'boolean',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Bounds',
  fireSetField: 'showBoundsBox',
  type: 'boolean',
  contextObjectField: null,
  group: 'depthExtras',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Wireframe',
  fireSetField: 'showForceWireframe',
  type: 'boolean',
  group: 'depthExtras',
  contextObjectField: null,
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Floor Grid',
  fireSetField: 'showFloorGrid',
  type: 'boolean',
  group: 'depthExtras',
  contextObjectField: null,
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Guides',
  fireSetField: 'showSceneGuides',
  contextObjectField: null,
  group: 'depthExtras',
  floatLeft: true,
  clearLeft: true,
  type: 'boolean'
}, {
  title: 'UI Depth',
  fireSetField: 'gridAndGuidesDepth',
  contextObjectField: null,
  displayType: 'number',
  group: 'depthextra',
  helperType: 'singleSlider',
  rangeMin: '0',
  rangeMax: '100',
  rangeStep: '1',
  paddingRight: '1.2em',
  paddingBottom: '2.7em'
}];
__localStaticStorageForBindingFields['baseMesh'] = [{
  title: 'Scale X',
  fireSetField: 'scalingX',
  contextObjectField: 'scaling.x',
  group: 'scale',
  displayType: 'number'
}, {
  title: 'Scale Y',
  fireSetField: 'scalingY',
  contextObjectField: 'scaling.y',
  group: 'scale',
  displayType: 'number'
}, {
  title: 'Scale Z',
  fireSetField: 'scalingZ',
  contextObjectField: 'scaling.z',
  group: 'scale',
  displayType: 'number'
}, {
  title: 'Offset X',
  fireSetField: 'positionX',
  contextObjectField: 'position.x',
  group: 'offset',
  displayType: 'number'
}, {
  title: 'Offset Y',
  fireSetField: 'positionY',
  contextObjectField: 'position.y',
  group: 'offset',
  displayType: 'number'
}, {
  title: 'Offset Z',
  fireSetField: 'positionZ',
  contextObjectField: 'position.z',
  group: 'offset',
  displayType: 'number'
}, {
  title: 'Rotate X',
  fireSetField: 'rotationX',
  contextObjectField: 'rotation.x',
  group: 'rotate',
  displayType: 'number'
}, {
  title: 'Rotate Y',
  fireSetField: 'rotationY',
  contextObjectField: 'rotation.y',
  group: 'rotate',
  displayType: 'number'
}, {
  title: 'Rotate Z',
  fireSetField: 'rotationZ',
  contextObjectField: 'rotation.z',
  group: 'rotate',
  displayType: 'number'
}, {
  title: 'Visibility',
  fireSetField: 'visibility',
  contextObjectField: 'visibility',
  group: 'visi',
  displayType: 'number',
  type: 'visibility'
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
  displayType: 'displayFilter',
  group: 'main'
}, {
  title: 'Material Name',
  fireSetField: 'materialName',
  contextObjectField: 'material',
  type: 'material'
}, {
  title: 'Size',
  fireSetField: 'boxSize',
  contextObjectField: null,
  shapeOption: 'size',
  displayGroup: 'box',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'main'
}, {
  title: 'Width',
  fireSetField: 'boxWidth',
  contextObjectField: null,
  shapeOption: 'width',
  displayGroup: 'box',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Height',
  fireSetField: 'boxHeight',
  contextObjectField: null,
  shapeOption: 'height',
  displayGroup: 'box',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Depth',
  fireSetField: 'boxDepth',
  contextObjectField: null,
  shapeOption: 'depth',
  displayGroup: 'box',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Diameter',
  fireSetField: 'sphereDiameter',
  contextObjectField: null,
  shapeOption: 'diameter',
  displayGroup: 'sphere',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Segments',
  fireSetField: 'sphereSegments',
  contextObjectField: null,
  shapeOption: 'segments',
  displayGroup: 'sphere',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Diameter X',
  fireSetField: 'sphereDiameterX',
  contextObjectField: null,
  shapeOption: 'diameterX',
  displayGroup: 'sphere',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Diameter Y',
  fireSetField: 'sphereDiameterY',
  contextObjectField: null,
  shapeOption: 'diameterX',
  displayGroup: 'sphere',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Diameter Z',
  fireSetField: 'sphereDiameterZ',
  contextObjectField: null,
  shapeOption: 'diameterZ',
  displayGroup: 'sphere',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Height',
  fireSetField: 'cylinderHeight',
  contextObjectField: null,
  shapeOption: 'height',
  displayGroup: 'cylinder',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Diameter',
  fireSetField: 'cylinderDiameter',
  contextObjectField: null,
  shapeOption: 'diameter',
  displayGroup: 'cylinder',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Tessellsation',
  fireSetField: 'cylinderTessellation',
  contextObjectField: null,
  shapeOption: 'tessellation',
  displayGroup: 'cylinder',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Top',
  fireSetField: 'cylinderDiameterTop',
  contextObjectField: null,
  shapeOption: 'diameterTop',
  displayGroup: 'cylinder',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Bottom',
  fireSetField: 'cylinderDiameterBottom',
  contextObjectField: null,
  shapeOption: 'diameterBottom',
  displayGroup: 'cylinder',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Text',
  fireSetField: 'textText',
  contextObjectField: null,
  shapeOption: 'text',
  displayGroup: 'text',
  displayKey: 'shapeType',
  group: 'text'
}, {
  title: 'Tessellation',
  fireSetField: 'textSize',
  contextObjectField: null,
  shapeOption: 'size',
  displayGroup: 'text',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'text2'
}, {
  title: 'Open Face',
  fireSetField: 'textStroke',
  contextObjectField: null,
  shapeOption: 'stroke',
  displayGroup: 'text',
  displayKey: 'shapeType',
  type: 'boolean',
  group: 'text2'
}, {
  title: 'Depth',
  fireSetField: 'textDepth',
  contextObjectField: null,
  shapeOption: 'depth',
  displayGroup: 'text',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'text2'
}, {
  title: 'Font Family',
  fireSetField: 'textFontFamily',
  contextObjectField: null,
  shapeOption: 'fontFamily',
  displayGroup: 'text',
  displayKey: 'shapeType',
  group: 'font',
  dataListId: 'fontfamilydatalist'
}, {
  title: 'Font Weight',
  fireSetField: 'textFontWeight',
  contextObjectField: null,
  shapeOption: 'fontWeight',
  displayGroup: 'text',
  displayKey: 'shapeType',
  group: 'font'
}, {
  title: 'Font Variant',
  fireSetField: 'textFontVariant',
  contextObjectField: null,
  shapeOption: 'fontVariant',
  displayGroup: 'text',
  displayKey: 'shapeType',
  group: 'fontExtra'
}, {
  title: 'Font Style',
  fireSetField: 'textFontStyle',
  contextObjectField: null,
  shapeOption: 'fontStyle',
  displayGroup: 'text',
  displayKey: 'shapeType',
  group: 'fontExtra'
}];
__localStaticStorageForBindingFields['block'] = [{
  title: 'Block Title',
  fireSetField: 'title',
  contextObjectField: null,
  group: 'title'
}, {
  title: 'Width',
  fireSetField: 'width',
  contextObjectField: null,
  displayType: 'number',
  group: 'main'
}, {
  title: 'Depth',
  fireSetField: 'depth',
  contextObjectField: null,
  displayType: 'number',
  group: 'main'
}, {
  title: 'Height',
  fireSetField: 'height',
  contextObjectField: null,
  displayType: 'number',
  group: 'main'
}, {
  title: 'Center',
  fireSetField: 'centerVector',
  contextObjectField: null,
  group: 'center',
  rangeMin: '-10',
  rangeMax: '10',
  rangeStep: '1'
}, {
  title: 'Direction',
  fireSetField: 'directionVector',
  contextObjectField: null,
  group: 'direction',
  rangeMin: '-1',
  rangeMax: '1',
  rangeStep: '.01'
}, {
  title: 'Material Name',
  fireSetField: 'materialName',
  contextObjectField: 'material',
  group: 'material',
  type: 'material'
}];
__localStaticStorageForBindingFields['blockchild'] = [{
  title: 'Type',
  fireSetField: 'childType',
  contextObjectField: null,
  group: 'main',
  displayType: 'displayListFilter',
  dataListId: 'blockchildtypelist'
}, {
  title: 'Mesh',
  fireSetField: 'childName',
  contextObjectField: null,
  group: 'main',
  listKey: 'childType',
  titlesByKey: {
    mesh: 'Mesh',
    block: 'Block',
    shape: 'Shape'
  },
  listsByKey: {
    mesh: 'meshdatatitlelookuplist',
    block: 'blockdatatitlelookuplist',
    shape: 'shapedatatitlelookuplist'
  },
  dataListId: 'meshdatatitlelookuplist'
}, {
  title: 'Inherit Material',
  fireSetField: 'inheritMaterial',
  contextObjectField: null,
  group: 'options',
  type: 'boolean'
}];
__localStaticStorageForBindingFields['frame'] = [{
  title: 'Time (ms)',
  fireSetField: 'frameTime',
  contextObjectField: null,
  wrapperClass: 'frame-time',
  group: 'time'
}, {
  title: 'Order',
  fireSetField: 'frameOrder',
  contextObjectField: null,
  displayType: 'number',
  group: 'time'
}];
__defaultData['mesh'] = {
  title: 'Mesh',
  name: '',
  materialName: '',
  url: '',
  type: 'url',
  size: 0,
  scalingX: 1.0,
  scalingY: 1.0,
  scalingZ: 1.0,
  positionX: 0.0,
  positionY: 0.0,
  positionZ: 0.0,
  rotationX: 0.0,
  rotationY: 0.0,
  rotationZ: 0.0
};
__defaultData['scene'] = {
  title: 'Scene',
  url: '',
  type: 'url',
  size: 0
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
__defaultData['shape'] = {
  title: 'Shape',
  shapeType: 'box',
  boxWidth: 10,
  boxHeight: 10,
  boxDepth: 10,
  materialName: '',
  face0Color: '',
  face1Color: '',
  face2Color: '',
  face3Color: '',
  face4Color: '',
  face5Color: '',
  face0UV: '',
  face1UV: '',
  face2UV: '',
  face3UV: '',
  face4UV: '',
  face5UV: '',
  textText: 'Text',
  textFontFamily: 'Geneva',
  textDepth: 4,
  textSize: 100,
  scalingX: 1.0,
  scalingY: 1.0,
  scalingZ: 1.0,
  positionX: 0.0,
  positionY: 0.0,
  positionZ: 0.0,
  rotationX: 0.0,
  rotationY: 0.0,
  rotationZ: 0.0
};
__defaultData['block'] = {
  title: 'Block',
  blockType: 'container',
  width: 2,
  depth: 2,
  height: 1,
  blockScale: 10,
  children: {}
};
__defaultData['blockchild'] = {
  childType: 'mesh',
  childName: '',
  inheritMaterial: true,
  order: 0
};
__defaultData['frame'] = {
  frameTime: '',
  frameOrder: '1',
  parentKey: null,
  scalingX: '',
  scalingY: '',
  scalingZ: '',
  positionX: '',
  positionY: '',
  positionZ: '',
  rotationX: '',
  rotationY: '',
  rotationZ: ''
};
