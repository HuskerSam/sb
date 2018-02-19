class sDataDefinition {
  static bindingFields(tag) {
    if (tag === 'frame') {
      alert('errror here');
    }
    if (tag === 'meshFrame' || tag === 'shapeFrame') {
      let localCopy = this.bindingFields('frameBase');
      localCopy = localCopy.concat(this.bindingFields('frameMesh'));
      return localCopy.concat(this.bindingFields('frameColor'));
    }
    if (tag === 'blockFrame') {
      let localCopy = this.bindingFields('frameBase');
      let meshCopy = this.bindingFields('frameMesh');
      meshCopy = meshCopy.slice(1);
      return localCopy.concat(meshCopy);
    }
    if (tag === 'cameraFrame') {
      let localCopy = this.bindingFields('frameBase');
      return localCopy.concat(this.bindingFields('frameCamera'));
    }
    if (tag === 'lightFrame') {
      let localCopy = this.bindingFields('frameBase');
      return localCopy.concat(this.bindingFields('frameLight'));
    }

    if (tag === 'shape') {
      let localCopy = __localStaticStorageForBindingFields[tag].slice(0);
      return localCopy.concat(this.bindingFields('frameMesh'));
    }
    if (tag === 'mesh') {
      let localCopy = __localStaticStorageForBindingFields[tag].slice(0, 3);
      localCopy = localCopy.concat(this.bindingFields('frameMesh'));
      return localCopy.concat(__localStaticStorageForBindingFields[tag].slice(3));
    }

    if (tag === 'blockchild') {
      let localCopy = __localStaticStorageForBindingFields['childBlock'].slice(0);
      return localCopy.concat(this.bindingFields('frameCamera'));
    }
    return __localStaticStorageForBindingFields[tag].slice(0);
  }
  static bindingFieldsLookup(tag) {
    let arr = this.bindingFields(tag);
    let result = {};
    for (let i in arr)
      result[arr[i].fireSetField] = arr[i];

    return result;
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
  static getAnimFieldsFilter() {
    return __animFieldFilters;
  }
}
let __localStaticStorageForBindingFields = {};
let __defaultData = {};
let __animFieldFilters = {};

__animFieldFilters.blockCameraFields = {};
__animFieldFilters.animateCameraFields = {};
__animFieldFilters.blockCameraFields['UniversalCamera'] = ['cameraAimTarget', 'cameraName'];
__animFieldFilters.animateCameraFields['UniversalCamera'] = ['cameraOriginX', 'cameraOriginY', 'cameraOriginZ', 'cameraRotationX', 'cameraRotationY', 'cameraRotationZ', 'cameraOrigin', 'cameraFOV'];
__animFieldFilters.blockCameraFields['ArcRotate'] = ['cameraAimTarget', 'cameraName'];
__animFieldFilters.animateCameraFields['ArcRotate'] = ['cameraOriginX', 'cameraOriginY', 'cameraOriginZ', 'cameraFOV'];
__animFieldFilters.blockCameraFields['FollowCamera'] = ['cameraTargetBlock', 'cameraName'];
__animFieldFilters.animateCameraFields['FollowCamera'] = ['cameraRadius', 'cameraHeightOffset', 'cameraRotationOffset', 'cameraAcceleration',
  'maxCameraSpeed', 'cameraOriginX', 'cameraOriginY', 'cameraOriginZ', 'cameraFOV'
];
__animFieldFilters.blockLightFields = {};
__animFieldFilters.animateLightFields = {};
__animFieldFilters.blockLightFields['Hemispheric'] = [];
__animFieldFilters.animateLightFields['Hemispheric'] = ['lightDirectionX', 'lightDirectionY', 'lightDirectionZ', 'lightIntensity', 'lightGroundColorR', 'lightGroundColorG', 'lightGroundColorB',
  'lightSpecularR', 'lightSpecularG', 'lightSpecularB', 'lightDiffuseR', 'lightDiffuseG', 'lightDiffuseB'
];
__animFieldFilters.blockLightFields['Point'] = [];
__animFieldFilters.animateLightFields['Point'] = ['lightOriginX', 'lightOriginY', 'lightOriginZ', 'lightIntensity', 'lightGroundColor', 'lightGroundColorR', 'lightGroundColorG', 'lightGroundColorB',
  'lightSpecularR', 'lightSpecularG', 'lightSpecularB', 'lightDiffuseR', 'lightDiffuseG', 'lightDiffuseB'
];
__animFieldFilters.blockLightFields['Directional'] = [];
__animFieldFilters.animateLightFields['Directional'] = ['lightDirectionX', 'lightDirectionY', 'lightDirectionZ', 'lightIntensity', 'lightGroundColor', 'lightGroundColorR', 'lightGroundColorG', 'lightGroundColorB',
  'lightSpecularR', 'lightSpecularG', 'lightSpecularB', 'lightDiffuseR', 'lightDiffuseG', 'lightDiffuseB'
];
__animFieldFilters.blockLightFields['Spot'] = [];
__animFieldFilters.animateLightFields['Spot'] = ['lightOriginX', 'lightOriginY', 'lightOriginZ', 'lightDirectionX', 'lightDirectionY', 'lightDirectionZ', 'lightIntensity', 'lightGroundColor', 'lightAngle', 'lightDecay',
  'lightGroundColor', 'lightGroundColorR', 'lightGroundColorG', 'lightGroundColorB',
  'lightSpecularR', 'lightSpecularG', 'lightSpecularB', 'lightDiffuseR', 'lightDiffuseG', 'lightDiffuseB'
];

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
  dataListId: 'sbmesheslist',
  group: 'url'
}];
__localStaticStorageForBindingFields['material'] = [{
  title: 'Title',
  fireSetField: 'title',
  contextObjectField: null,
  group: 'title',
  floatLeft: true
}, {
  title: 'Preview Shape',
  fireSetField: 'previewShape',
  contextObjectField: null,
  group: 'title',
  dataListId: 'applicationdynamicshapelistlookuplist',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Alpha',
  fireSetField: 'alpha',
  contextObjectField: 'alpha',
  displayType: 'number',
  group: 'options',
  floatLeft: true
}, {
  title: 'Wireframe',
  fireSetField: 'wireframe',
  contextObjectField: 'wireframe',
  type: 'boolean',
  group: 'options',
  floatLeft: true
}, {
  title: 'Backface Culling',
  fireSetField: 'backfaceCulling',
  contextObjectField: 'backfaceCulling',
  type: 'boolean',
  floatLeft: true,
  clearLeft: true,
  group: 'options'
}, {
  title: 'Diffuse (main)',
  fireSetField: 'diffuseColor',
  contextObjectField: 'diffuseColor',
  type: 'color',
  group: 'diffuseColor',
  displayType: 'shortVector',
  floatLeft: true
}, {
  title: 'Diffuse Texture Name',
  fireSetField: 'diffuseTextureName',
  contextObjectField: 'diffuseTexture',
  type: 'texture',
  group: 'diffuseColor',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Ambient (reflects)',
  fireSetField: 'ambientColor',
  contextObjectField: 'ambientColor',
  type: 'color',
  group: 'ambientColor',
  displayType: 'shortVector',
  floatLeft: true
}, {
  title: 'Ambient Texture Name',
  fireSetField: 'ambientTextureName',
  contextObjectField: 'ambientTexture',
  type: 'texture',
  group: 'ambientColor',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Emissive (glows)',
  fireSetField: 'emissiveColor',
  contextObjectField: 'emissiveColor',
  type: 'color',
  group: 'emissiveColor',
  displayType: 'shortVector',
  floatLeft: true
}, {
  title: 'Emissive Texture Name',
  fireSetField: 'emissiveTextureName',
  contextObjectField: 'emissiveTexture',
  type: 'texture',
  group: 'emissiveColor',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Specular (shines)',
  fireSetField: 'specularColor',
  contextObjectField: 'specularColor',
  group: 'specularColor',
  type: 'color',
  displayType: 'shortVector',
  floatLeft: true
}, {
  title: 'Specular over Alpha',
  fireSetField: 'useSpecularOverAlpha',
  contextObjectField: 'useSpecularOverAlpha',
  group: 'specularColor',
  type: 'boolean',
  floatLeft: true
}, {
  title: 'Specular Texture Name',
  fireSetField: 'specularTextureName',
  contextObjectField: 'specularTexture',
  group: 'specularColor',
  type: 'texture',
  floatLeft: true,
  clearLeft: true,
}, {
  title: 'Gloss From Specular',
  fireSetField: 'useGlossinessFromSpecularMapAlpha',
  contextObjectField: 'specularPower',
  group: 'specularColor',
  type: 'boolean',
  floatLeft: true
}, {
  title: 'Specular Power',
  fireSetField: 'specularPower',
  contextObjectField: 'specularPower',
  group: 'specularColor',
  displayType: 'number'
}, {
  title: 'Bump Texture Name',
  fireSetField: 'bumpTextureName',
  contextObjectField: 'bumpTexture',
  group: 'roughness',
  type: 'texture',
  floatLeft: true
}, {
  title: 'Roughness',
  fireSetField: 'roughness',
  contextObjectField: 'roughness',
  displayType: 'number',
  group: 'roughness'
}, {
  title: 'Reflection Texture Name',
  fireSetField: 'reflectionTextureName',
  contextObjectField: 'reflectionTexture',
  group: 'reflection',
  type: 'texture',
  floatLeft: true
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
  title: 'is Video',
  fireSetField: 'isVideo',
  contextObjectField: 'isVideo',
  type: 'boolean',
  group: 'options'
}, {
  title: 'has Alpha',
  fireSetField: 'hasAlpha',
  contextObjectField: 'hasAlpha',
  type: 'boolean',
  group: 'options'
}, {
  title: 'Url',
  fireSetField: 'url',
  contextObjectField: null,
  type: 'url',
  uploadType: 'texture',
  dataListId: 'sbimageslist',
  group: 'url'
}, {
  title: 'Offset v',
  fireSetField: 'vOffset',
  contextObjectField: 'vOffset',
  group: 'textureoffset',
  displayType: 'number'
}, {
  title: 'Offset u',
  fireSetField: 'uOffset',
  contextObjectField: 'uOffset',
  group: 'textureoffset',
  displayType: 'number'
}, {
  title: 'Scale v',
  fireSetField: 'vScale',
  contextObjectField: 'vScale',
  group: 'texturescale',
  displayType: 'number'
}, {
  title: 'Scale u',
  fireSetField: 'uScale',
  contextObjectField: 'uScale',
  group: 'texturescale',
  displayType: 'number'
}];
__localStaticStorageForBindingFields['fontFamilyProfile'] = [{
  title: 'Canvas Color',
  fireSetField: 'canvasColor',
  contextObjectField: null,
  type: 'color',
  group: 'color',
  helperType: 'vector',
  rangeMin: '0',
  rangeMax: '1',
  rangeStep: '.005',
  floatLeft: true,
  displayType: 'shortVector'
}, {
  title: 'Font',
  fireSetField: 'fontFamily',
  contextObjectField: null,
  group: 'main',
  dataListId: 'fontfamilydatalist',
  floatLeft: true
}, {
  title: 'Size',
  fireSetField: 'fontSize',
  contextObjectField: null,
  group: 'main',
  displayType: 'number',
  helperType: 'singleSlider',
  rangeMin: '7',
  rangeMax: '22',
  rangeStep: '.25',
  groupClass: 'font-size-main-view',
  floatLeft: true
}, {
  title: 'Focus Lock (Editing)',
  fireSetField: 'inputFocusLock',
  contextObjectField: null,
  group: 'main',
  type: 'boolean',
  floatLeft: true,
  clearLeft: true
}];
__localStaticStorageForBindingFields['sceneToolsBar'] = [{
  title: 'Bounds',
  fireSetField: 'showBoundsBox',
  type: 'boolean',
  contextObjectField: null,
  group: 'depthExtras',
  floatLeft: true,
  groupClass: 'scene-tools-checkboxes'
}, {
  title: 'Wireframe',
  fireSetField: 'showForceWireframe',
  type: 'boolean',
  group: 'depthExtras',
  contextObjectField: null,
  floatLeft: true,
  clearLeft: true,
}, {
  title: 'Grid',
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
  type: 'boolean',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Depth',
  fireSetField: 'gridAndGuidesDepth',
  contextObjectField: null,
  displayType: 'number',
  group: 'depthExtras',
  clearLeft: true
}, {
  title: 'Light',
  fireSetField: 'lightIntensity',
  contextObjectField: null,
  helperType: 'singleSlider',
  rangeMin: '0',
  rangeMax: '2',
  rangeStep: '.01',
  displayType: 'number',
  group: 'group2',
  groupClass: 'light-intensity-main-page'
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
  shapeOption: 'diameterY',
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
  inlineWidth: '15em',
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
  title: 'Depth',
  fireSetField: 'textDepth',
  contextObjectField: null,
  shapeOption: 'depth',
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
  group: 'openface'
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
  title: 'Material',
  fireSetField: 'materialName',
  contextObjectField: 'material',
  group: 'material',
  type: 'material'
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
  title: 'Ground Material',
  fireSetField: 'groundMaterial',
  contextObjectField: null,
  type: 'material',
  group: 'ground'
}, {
  title: 'Skybox',
  fireSetField: 'skybox',
  contextObjectField: null,
  dataListId: 'skyboxlist',
  group: 'skybox'
}];
__localStaticStorageForBindingFields['childBlock'] = [{
  title: 'Type',
  fireSetField: 'childType',
  contextObjectField: null,
  group: 'main',
  displayType: 'displayListFilter',
  dataListId: 'blockchildtypelist',
  displayType: 'displayFilter'
}, {
  title: 'Mesh',
  fireSetField: 'childName',
  contextObjectField: null,
  group: 'main',
  listKey: 'childType',
  titlesByKey: {
    mesh: 'Mesh',
    block: 'Block',
    shape: 'Shape',
    light: 'Light',
    camera: 'Camera'
  },
  listsByKey: {
    mesh: 'meshdatatitlelookuplist',
    block: 'blockdatatitlelookuplist',
    shape: 'shapedatatitlelookuplist',
    light: 'lightsourceslist',
    camera: 'camerasourceslist'
  },
  dataListId: 'meshdatatitlelookuplist'
}, {
  title: 'Inherit Material',
  fireSetField: 'inheritMaterial',
  contextObjectField: null,
  group: 'options',
  type: 'boolean',
  displayGroup: ['mesh', 'shape', 'block'],
  displayKey: 'childType'
}, {
  title: 'Use root frames from block',
  fireSetField: 'useChildBlockFrames',
  contextObjectField: null,
  group: 'options',
  type: 'boolean',
  displayGroup: ['block'],
  displayKey: 'childType'
}, {
  title: 'Name',
  fireSetField: 'cameraName',
  displayGroup: 'camera',
  displayKey: 'childType',
  contextObjectField: null,
  group: 'camera'
}, {
  title: 'Target Block',
  fireSetField: 'cameraTargetBlock',
  contextObjectField: null,
  displayGroup: ['camera'],
  displayKey: 'childType',
  dataListId: 'followblocktargetoptionslist',
  group: 'camera'
}];
__localStaticStorageForBindingFields['frameBase'] = [{
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
__localStaticStorageForBindingFields['frameMesh'] = [{
  title: 'Visibility',
  fireSetField: 'visibility',
  contextObjectField: 'visibility',
  group: 'visi',
  displayType: 'number',
  type: 'visibility'
}, {
  title: 'Position',
  fireSetField: 'positionX',
  contextObjectField: 'position.x',
  group: 'offset',
  displayType: 'number'
}, {
  title: '&nbsp;',
  fireSetField: 'positionY',
  contextObjectField: 'position.y',
  group: 'offset',
  displayType: 'number'
}, {
  title: 'x y z',
  fireSetField: 'positionZ',
  contextObjectField: 'position.z',
  group: 'offset',
  displayType: 'number'
}, {
  title: 'Scale',
  fireSetField: 'scalingX',
  contextObjectField: 'scaling.x',
  group: 'scale',
  displayType: 'number'
}, {
  title: '&nbsp;',
  fireSetField: 'scalingY',
  contextObjectField: 'scaling.y',
  group: 'scale',
  displayType: 'number'
}, {
  title: 'x y z',
  fireSetField: 'scalingZ',
  contextObjectField: 'scaling.z',
  group: 'scale',
  displayType: 'number'
}, {
  title: 'Rotation',
  fireSetField: 'rotationX',
  contextObjectField: 'rotation.x',
  group: 'rotate',
  displayType: 'number'
}, {
  title: '&nbsp;',
  fireSetField: 'rotationY',
  contextObjectField: 'rotation.y',
  group: 'rotate',
  displayType: 'number'
}, {
  title: 'x y z',
  fireSetField: 'rotationZ',
  contextObjectField: 'rotation.z',
  group: 'rotate',
  displayType: 'number'
}];
__localStaticStorageForBindingFields['frameLight'] = [{
  title: 'Origin',
  fireSetField: 'lightOriginX',
  contextObjectField: 'position.x',
  group: 'lightP',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: 'x y z',
  fireSetField: 'lightOriginY',
  contextObjectField: 'position.y',
  group: 'lightP',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: '&nbsp;',
  fireSetField: 'lightOriginZ',
  contextObjectField: 'position.z',
  group: 'lightP',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: 'direction',
  fireSetField: 'lightDirectionX',
  contextObjectField: 'direction.x',
  displayType: 'number',
  group: 'light',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: 'x y z',
  fireSetField: 'lightDirectionY',
  contextObjectField: 'direction.y',
  displayType: 'number',
  group: 'light',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: '&nbsp;',
  fireSetField: 'lightDirectionZ',
  contextObjectField: 'direction.z',
  displayType: 'number',
  group: 'light',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: 'intensity',
  fireSetField: 'lightIntensity',
  contextObjectField: 'intensity',
  group: 'lightsub',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: 'diffuse',
  fireSetField: 'lightDiffuseR',
  contextObjectField: 'diffuse.r',
  group: 'lightsubdif',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: 'r g b',
  fireSetField: 'lightDiffuseG',
  contextObjectField: 'diffuse.g',
  group: 'lightsubdif',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: '&nbsp;',
  fireSetField: 'lightDiffuseB',
  contextObjectField: 'diffuse.b',
  group: 'lightsubdif',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: 'specular',
  fireSetField: 'lightSpecularR',
  contextObjectField: 'specular.r',
  group: 'lightsubspec',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: 'r g b',
  fireSetField: 'lightSpecularG',
  contextObjectField: 'specular.g',
  group: 'lightsubspec',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: '&nbsp;',
  fireSetField: 'lightSpecularB',
  contextObjectField: 'specular.b',
  group: 'lightsubspec',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: 'ground',
  fireSetField: 'lightGroundColorR',
  contextObjectField: 'groundColor.r',
  group: 'lightsubgnd',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: 'r g b',
  fireSetField: 'lightGroundColorG',
  contextObjectField: 'groundColor.g',
  group: 'lightsubgnd',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: '&nbsp;',
  fireSetField: 'lightGroundColorB',
  contextObjectField: 'groundColor.b',
  group: 'lightsubgnd',
  displayType: 'number',
  displayGroup: 'light',
  displayKey: 'childType'
}, {
  title: 'angle',
  fireSetField: 'lightAngle',
  contextObjectField: null,
  group: 'light4',
  displayGroup: 'light',
  displayKey: 'childType',
  displayType: 'number'
}, {
  title: 'decay',
  fireSetField: 'lightDecay',
  contextObjectField: null,
  group: 'light4',
  displayGroup: 'light',
  displayType: 'number',
  displayKey: 'childType'
}];
__localStaticStorageForBindingFields['frameCamera'] = [{
  title: 'FOV (zoom)',
  fireSetField: 'cameraFOV',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'fov',
  group: 'cameraFOV'
}, {
  title: 'Position',
  fireSetField: 'cameraOriginX',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'position.x',
  group: 'camera'
}, {
  title: 'x y z',
  fireSetField: 'cameraOriginY',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'position.y',
  group: 'camera'
}, {
  title: '&nbsp;',
  fireSetField: 'cameraOriginZ',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'position.z',
  group: 'camera'
}, {
  title: 'Rotation',
  fireSetField: 'cameraRotationX',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'rotation.x',
  group: 'camera0'
}, {
  title: 'x y z',
  fireSetField: 'cameraRotationY',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'rotation.y',
  group: 'camera0'
}, {
  title: '&nbsp;',
  fireSetField: 'cameraRotationZ',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'rotation.z',
  group: 'camera0'
}, {
  title: 'Radius',
  fireSetField: 'cameraRadius',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'radius',
  group: 'cameraArc'
}, {
  title: 'Height',
  fireSetField: 'cameraHeightOffset',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'heightOffset',
  group: 'cameraArc'
}, {
  title: 'R Offset',
  fireSetField: 'cameraRotationOffset',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'rotationOffset',
  group: 'camera1'
}, {
  title: 'Accel',
  fireSetField: 'cameraAcceleration',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'acceleration',
  group: 'camera1'
}, {
  title: 'Max Spd',
  fireSetField: 'maxCameraSpeed',
  displayGroup: 'camera',
  displayKey: 'childType',
  displayType: 'number',
  contextObjectField: 'maxCameraSpeed',
  group: 'camera1'
}, {
  title: 'Aim at Position',
  fireSetField: 'cameraAimTarget',
  contextObjectField: null,
  displayGroup: 'camera',
  displayType: 'shortVector',
  displayKey: 'childType',
  group: 'camera'
}];
__localStaticStorageForBindingFields['frameColor'] = [{
  title: 'Diffuse Color',
  fireSetField: 'diffuseColorR',
  contextObjectField: 'material.diffuseColor.r',
  displayType: 'number',
  group: 'diffuse'
}, {
  title: '&nbsp;',
  fireSetField: 'diffuseColorG',
  contextObjectField: 'material.diffuseColor.g',
  displayType: 'number',
  group: 'diffuse'
}, {
  title: 'r g b',
  fireSetField: 'diffuseColorB',
  contextObjectField: 'material.diffuseColor.b',
  displayType: 'number',
  group: 'diffuse'
}, {
  title: 'Emissive Color',
  fireSetField: 'emissiveColorR',
  contextObjectField: 'material.emissiveColor.r',
  displayType: 'number',
  group: 'emissive'
}, {
  title: '&nbsp;',
  fireSetField: 'emissiveColorG',
  contextObjectField: 'material.emissiveColor.g',
  displayType: 'number',
  group: 'emissive'
}, {
  title: 'r g b',
  fireSetField: 'emissiveColorB',
  contextObjectField: 'material.emissiveColor.b',
  displayType: 'number',
  group: 'emissive'
}, {
  title: 'Ambient Color',
  fireSetField: 'ambientColorR',
  contextObjectField: 'material.ambientColor.r',
  displayType: 'number',
  group: 'ambient'
}, {
  title: '&nbsp;',
  fireSetField: 'ambientColorG',
  contextObjectField: 'material.ambientColor.g',
  displayType: 'number',
  group: 'ambient'
}, {
  title: 'r g b',
  fireSetField: 'ambientColorB',
  contextObjectField: 'material.ambientColor.b',
  displayType: 'number',
  group: 'ambient'
}, {
  title: 'Specular Color',
  fireSetField: 'specularColorR',
  contextObjectField: 'material.specularColor.r',
  displayType: 'number',
  group: 'specular'
}, {
  title: '&nbsp;',
  fireSetField: 'specularColorG',
  contextObjectField: 'material.specularColor.g',
  displayType: 'number',
  group: 'specular'
}, {
  title: 'r g b',
  fireSetField: 'specularColorB',
  contextObjectField: 'material.specularColor.b',
  displayType: 'number',
  group: 'specular'
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
__defaultData['texture'] = {
  title: 'Texture',
  url: '',
  vOffset: 0.0,
  uOffset: 0.0,
  vScale: 1.0,
  uScale: 1.0,
  hasAlpha: false,
  isVideo: false
};
__defaultData['material'] = {
  title: 'Material',
  name: '',
  alpha: 1.0,
  diffuseColor: '1,1,1',
  diffuseTextureName: '',
  emissiveColor: '0,0,0',
  emissiveTextureName: '',
  ambientColor: '0,0,0',
  ambientTextureName: '',
  specularColor: '1,1,1',
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
  textDepth: '.5',
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
  skybox: '',
  url: '',
  children: {}
};
__defaultData['blockchild'] = {
  childType: 'block',
  childName: '',
  inheritMaterial: true,
  inheritGround: true,
  lightSource: '',
  lightOrigin: '',
  lightIntensity: '',
  lightDiffuse: '',
  lightSpecular: '',
  cameraName: '',
  cameraName: '',
  cameraOrigin: '',
  cameraTargetBlock: '',
  cameraParentBlock: '',
  cameraAimTarget: '',
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
  rotationZ: '',
  diffuseColorR: '',
  diffuseColorG: '',
  diffuseColorB: '',
  emissiveColorR: '',
  emissiveColorG: '',
  emissiveColorB: '',
  ambientColorR: '',
  ambientColorG: '',
  ambientColorB: '',
  specularColorR: '',
  specularColorG: '',
  specularColorB: '',
  visibility: '',
  lightSpecularR: '1',
  lightSpecularB: '1',
  lightSpecularG: '1',
  lightDiffuseR: '1',
  lightDiffuseB: '1',
  lightDiffuseG: '1',
  lightIntensity: '',
  lightRadius: '',
  cameraRotationOffset: '0',
  cameraAcceleration: '.005',
  cameraHeightOffset: '10',
  cameraRadius: '30',
  maxCameraSpeed: '10',
  cameraOriginX: '10',
  cameraOriginY: '10',
  cameraOriginZ: '10',
  cameraFOV: '.8'
};
