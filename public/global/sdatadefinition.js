class sDataDefinition {
  static bindingFields(tag) {
    if (!tag)
      return [];
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
      let cmdCopy = this.bindingFields('frameCommand');
      meshCopy = meshCopy.slice(1);

      localCopy = localCopy.concat(meshCopy);
      return localCopy.concat(cmdCopy);
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
      //localCopy = localCopy.concat(this.bindingFields('frameCommand'));
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
__animFieldFilters.animateCameraFields['ArcRotate'] = ['cameraOriginX', 'cameraOriginY', 'cameraOriginZ', 'cameraRadius', 'cameraHeightOffset', 'cameraFOV'];
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
  type: 'url',
  uploadType: 'mesh',
  dataListId: 'sbmesheslist',
  group: 'url'
}];
__localStaticStorageForBindingFields['material'] = [{
  title: 'Title',
  fireSetField: 'title',
  group: 'title',
  floatLeft: true
}, {
  title: 'Preview Shape',
  fireSetField: 'previewShape',
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
  fireSetField: 'backFaceCulling',
  contextObjectField: 'backFaceCulling',
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
  title: 'Max Lights',
  fireSetField: 'maxSimultaneousLights',
  contextObjectField: 'maxSimultaneousLights',
  displayType: 'number',
  group: 'maxLights'
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
  group: 'title'
}, {
  title: 'Preview Shape',
  fireSetField: 'previewShape',
  group: 'options',
  dataListId: 'applicationdynamicshapelistlookuplist'
}, {
  title: 'is Text',
  fireSetField: 'isText',
  type: 'boolean',
  group: 'options'
}, {
  title: 'shrink Text',
  fireSetField: 'isFittedText',
  type: 'boolean',
  group: 'options'
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
}, {
  title: '2D Text',
  fireSetField: 'textureText',
  group: 'texttext',
  inlineWidth: '20em',
  noTrim: true
}, {
  title: 'Line 2',
  fireSetField: 'textureText2',
  group: 'texttext2',
  inlineWidth: '20em',
  noTrim: true
}, {
  title: 'Line 3',
  fireSetField: 'textureText3',
  group: 'texttext3',
  inlineWidth: '20em',
  noTrim: true
}, {
  title: 'Line 4',
  fireSetField: 'textureText4',
  group: 'texttext4',
  inlineWidth: '20em',
  noTrim: true
}, {
  title: '2D Render size',
  fireSetField: 'textureTextRenderSize',
  group: 'font'
}, {
  title: 'Font Family',
  fireSetField: 'textFontFamily',
  dataListId: 'fontfamilydatalist',
  type: 'font',
  group: 'textdetails',
  inlineWidth: '10em'
}, {
  title: 'Size (number)',
  fireSetField: 'textFontSize',
  group: 'textdetails'
}, {
  title: 'Font Weight',
  fireSetField: 'textFontWeight',
  shapeOption: 'fontWeight',
  displayGroup: 'textdetails',
  group: 'font'
}, {
  title: 'Font Color',
  fireSetField: 'textFontColor',
  type: 'color',
  group: 'textColor'
}, {
  title: 'Clear Color',
  fireSetField: 'textFontClearColor',
  type: 'color',
  group: 'textColor'
}];
__localStaticStorageForBindingFields['publishFontFamilyProfile'] = [{
  title: 'Font',
  fireSetField: 'fontFamily',
  group: 'main',
  dataListId: 'fontfamilydatalist',
  type: 'font',
  floatLeft: true
}, {
  title: 'Size',
  fireSetField: 'fontSize',
  group: 'main',
  displayType: 'number',
  helperType: 'singleSlider',
  rangeMin: '7',
  rangeMax: '22',
  rangeStep: '.25',
  groupClass: 'font-size-main-view',
  floatLeft: true
}];
__localStaticStorageForBindingFields['fontFamilyProfile'] = [{
  title: 'Background',
  fireSetField: 'canvasColor',
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
  group: 'main',
  dataListId: 'fontfamilydatalist',
  type: 'font',
  floatLeft: true
}, {
  title: 'Size',
  fireSetField: 'fontSize',
  group: 'main',
  displayType: 'number',
  helperType: 'singleSlider',
  rangeMin: '7',
  rangeMax: '22',
  rangeStep: '.25',
  groupClass: 'font-size-main-view',
  floatLeft: true
}, {
  title: 'Focus Lock',
  fireSetField: 'inputFocusLock',
  group: 'main',
  type: 'boolean',
  floatLeft: true,
  clearLeft: true
}];
__localStaticStorageForBindingFields['sceneToolsBar'] = [{
  title: 'Bounds',
  fireSetField: 'showBoundsBox',
  type: 'boolean',
  group: 'depthExtras',
  floatLeft: true,
  groupClass: 'scene-tools-checkboxes'
}, {
  title: 'Wireframe',
  fireSetField: 'showForceWireframe',
  type: 'boolean',
  group: 'depthExtras',
  floatLeft: true,
  clearLeft: true,
}, {
  title: 'Grid',
  fireSetField: 'showFloorGrid',
  type: 'boolean',
  group: 'depthExtras',

  floatLeft: true,
  clearLeft: true
}, {
  title: 'Guides',
  fireSetField: 'showSceneGuides',
  group: 'depthExtras',
  type: 'boolean',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Depth',
  fireSetField: 'gridAndGuidesDepth',
  displayType: 'number',
  group: 'depthExtras',
  clearLeft: true
}, {
  title: 'Light',
  fireSetField: 'lightIntensity',

  helperType: 'singleSlider',
  rangeMin: '0',
  rangeMax: '2',
  rangeStep: '.01',
  displayType: 'number',
  group: 'group2',
  groupClass: 'light-intensity-user-panel'
}, {
  title: 'Camera Updates',
  fireSetField: 'cameraUpdates',

  group: 'cameraTrack',
  type: 'boolean',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Camera Saves',
  fireSetField: 'cameraSaves',
  group: 'cameraTrack',
  type: 'boolean',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'No Bump Maps',
  fireSetField: 'noBumpMaps',
  group: 'cameraTrack',
  type: 'boolean',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Hide Video',
  fireSetField: 'noVideo',

  group: 'cameraTrack',
  type: 'boolean',
  floatLeft: true,
  clearLeft: true
}];
__localStaticStorageForBindingFields['shape'] = [{
  title: 'Title',
  fireSetField: 'title',
  group: 'main'
}, {
  title: 'Shape Type',
  fireSetField: 'shapeType',
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
  shapeOption: 'size',
  displayGroup: 'box',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'main'
}, {
  title: 'Width',
  fireSetField: 'boxWidth',
  shapeOption: 'width',
  displayGroup: ['box', 'plane'],
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Height',
  fireSetField: 'boxHeight',
  shapeOption: 'height',
  displayGroup: ['box', 'plane'],
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Depth',
  fireSetField: 'boxDepth',
  shapeOption: 'depth',
  displayGroup: 'box',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Diameter',
  fireSetField: 'sphereDiameter',
  shapeOption: 'diameter',
  displayGroup: 'sphere',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Segments',
  fireSetField: 'sphereSegments',
  shapeOption: 'segments',
  displayGroup: 'sphere',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Diameter X',
  fireSetField: 'sphereDiameterX',
  shapeOption: 'diameterX',
  displayGroup: 'sphere',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Diameter Y',
  fireSetField: 'sphereDiameterY',
  shapeOption: 'diameterY',
  displayGroup: 'sphere',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Diameter Z',
  fireSetField: 'sphereDiameterZ',
  shapeOption: 'diameterZ',
  displayGroup: 'sphere',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Height',
  fireSetField: 'cylinderHeight',
  shapeOption: 'height',
  displayGroup: 'cylinder',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Diameter',
  fireSetField: 'cylinderDiameter',
  shapeOption: 'diameter',
  displayGroup: 'cylinder',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Tessellsation',
  fireSetField: 'cylinderTessellation',
  shapeOption: 'tessellation',
  displayGroup: 'cylinder',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Top',
  fireSetField: 'cylinderDiameterTop',
  shapeOption: 'diameterTop',
  displayGroup: 'cylinder',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Bottom',
  fireSetField: 'cylinderDiameterBottom',
  shapeOption: 'diameterBottom',
  displayGroup: 'cylinder',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'tweaks'
}, {
  title: 'Text',
  fireSetField: 'textText',
  shapeOption: 'text',
  displayGroup: 'text',
  inlineWidth: '15em',
  displayKey: 'shapeType',
  group: 'text'
}, {
  title: 'Tessellation',
  fireSetField: 'textSize',
  shapeOption: 'size',
  displayGroup: 'text',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'text2'
}, {
  title: 'Depth',
  fireSetField: 'textDepth',
  shapeOption: 'depth',
  displayGroup: 'text',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'text2'
}, {
  title: 'Open Face',
  fireSetField: 'textStroke',
  shapeOption: 'stroke',
  displayGroup: 'text',
  displayKey: 'shapeType',
  type: 'boolean',
  group: 'openface'
}, {
  title: 'Font Family',
  fireSetField: 'textFontFamily',
  shapeOption: 'fontFamily',
  displayGroup: 'text',
  displayKey: 'shapeType',
  group: 'font',
  dataListId: 'fontfamilydatalist',
  type: 'font'
}, {
  title: 'Font Weight',
  fireSetField: 'textFontWeight',
  shapeOption: 'fontWeight',
  displayGroup: 'text',
  displayKey: 'shapeType',
  group: 'font'
}, {
  title: 'Font Variant',
  fireSetField: 'textFontVariant',
  shapeOption: 'fontVariant',
  displayGroup: 'text',
  displayKey: 'shapeType',
  group: 'fontExtra'
}, {
  title: 'Font Style',
  fireSetField: 'textFontStyle',
  shapeOption: 'fontStyle',
  displayGroup: 'text',
  displayKey: 'shapeType',
  group: 'fontExtra'
}, {
  title: 'Diameter',
  fireSetField: 'torusDiameter',
  shapeOption: 'diameter',
  displayGroup: 'torus',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Thickness',
  fireSetField: 'torusThickness',
  shapeOption: 'thickness',
  displayGroup: 'torus',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Tessellation',
  fireSetField: 'torusTessellation',
  shapeOption: 'tessellation',
  displayGroup: 'torus',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Radius',
  fireSetField: 'torusKnotRadius',
  shapeOption: 'radius',
  displayGroup: 'torusknot',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Thickness',
  fireSetField: 'torusKnotThickness',

  shapeOption: 'tube',
  displayGroup: 'torusknot',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions'
}, {
  title: 'Radial Seg',
  fireSetField: 'torusKnotRadialSeg',
  shapeOption: 'radialSegments',
  displayGroup: 'torusknot',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions2'
}, {
  title: 'Tube Seg',
  fireSetField: 'torusKnotTubeSeg',
  shapeOption: 'tubularSegments',
  displayGroup: 'torusknot',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions2'
}, {
  title: 'p (windings)',
  fireSetField: 'torusKnotP',
  shapeOption: 'p',
  displayGroup: 'torusknot',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions3'
}, {
  title: 'q (windings)',
  fireSetField: 'torusKnotQ',
  shapeOption: 'q',
  displayGroup: 'torusknot',
  displayKey: 'shapeType',
  displayType: 'number',
  group: 'dimensions3'
}];
__localStaticStorageForBindingFields['block'] = [{
  title: 'Block Title',
  fireSetField: 'title',
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
  displayType: 'number',
  group: 'main'
}, {
  title: 'Depth',
  fireSetField: 'depth',
  displayType: 'number',
  group: 'main'
}, {
  title: 'Height',
  fireSetField: 'height',
  displayType: 'number',
  group: 'main'
}];
__localStaticStorageForBindingFields['sceneFields'] = [{
  title: 'Y Code',
  fireSetField: 'blockCode',
  group: 'ground',
  floatLeft: true
}, {
  title: 'Ground Material',
  fireSetField: 'groundMaterial',
  type: 'material',
  group: 'ground',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Skybox',
  fireSetField: 'skybox',
  dataListId: 'skyboxlist',
  group: 'ground',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Clear Color',
  fireSetField: 'clearColor',
  group: 'sceneColor',
  type: 'color',
  floatLeft: true
}, {
  title: 'Ambient Color',
  fireSetField: 'ambientColor',
  group: 'sceneColor',
  type: 'color',
  clearLeft: true,
  floatLeft: true
}, {
  title: 'Fog',
  fireSetField: 'fogType',
  group: 'fog',
  floatLeft: true,
  dataListId: 'fogtypelist'
}, {
  title: 'Density',
  fireSetField: 'fogDensity',
  group: 'fog',
  displayType: 'number',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Color',
  fireSetField: 'fogColor',
  group: 'fog',
  type: 'color',
  floatLeft: true
}, {
  title: 'Start',
  fireSetField: 'fogStart',
  group: 'fog',
  displayType: 'number',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'End',
  fireSetField: 'fogEnd',
  group: 'fog',
  displayType: 'number',
  floatLeft: true
}, {
  title: 'Video URL',
  fireSetField: 'videoURL',
  group: 'video',
  type: 'url',
  uploadType: 'video',
  floatLeft: true
}, {
  title: 'Height',
  fireSetField: 'videoHeight',
  group: 'video',
  displayType: 'number',
  floatLeft: true,
  clearLeft: true
}, {
  title: 'Width',
  fireSetField: 'videoWidth',
  group: 'video',
  displayType: 'number',
  floatLeft: true
}, {
  title: 'Video Type',
  fireSetField: 'videoType',
  group: 'video',
  dataListId: 'htmlvideosourcelist',
  floatLeft: true
}, {
  title: 'Right Align',
  fireSetField: 'videoAlignRight',
  group: 'video',
  type: 'boolean',
  clearLeft: true,
  floatLeft: true
}, {
  title: 'Bottom Align',
  fireSetField: 'videoAlignBottom',
  group: 'video',
  type: 'boolean',
  floatLeft: true
}, {
  title: 'Clear URL on Stop/Play',
  fireSetField: 'videoClearURL',
  group: 'video',
  type: 'boolean',
  floatLeft: true
}, {
  title: 'blockFlag',
  fireSetField: 'blockFlag',
  group: 'blockData',
  floatLeft: true
}, {
  title: 'genericBlockData',
  fireSetField: 'genericBlockData',
  group: 'blockData',
  floatLeft: true
}];
__localStaticStorageForBindingFields['childBlock'] = [{
  title: 'Type',
  fireSetField: 'childType',
  group: 'main',
  displayType: 'displayListFilter',
  dataListId: 'blockchildtypelist',
  displayType: 'displayFilter'
}, {
  title: 'Mesh',
  fireSetField: 'childName',
  inlineWidth: '20em',
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
  group: 'options',
  type: 'boolean',
  displayGroup: ['mesh', 'shape', 'block'],
  displayKey: 'childType'
}, {
  title: 'Name',
  fireSetField: 'cameraName',
  displayGroup: 'camera',
  displayKey: 'childType',
  group: 'camera'
}, {
  title: 'Target Block',
  fireSetField: 'cameraTargetBlock',
  displayGroup: ['camera'],
  displayKey: 'childType',
  dataListId: 'followblocktargetoptionslist',
  group: 'camera'
}];
__localStaticStorageForBindingFields['frameBase'] = [{
  title: 'Time (ms)',
  fireSetField: 'frameTime',
  wrapperClass: 'frame-time',
  group: 'time'
}, {
  title: 'Order',
  fireSetField: 'frameOrder',
  displayType: 'number',
  group: 'time'
}];
__localStaticStorageForBindingFields['frameCommand'] = [{
  title: 'Command',
  fireSetField: 'frameCommand',
  frameFieldType: 'command',
  group: 'command',
  dataListId: 'framecommandoptionslist'
}, {
  title: 'field',
  fireSetField: 'frameCommandField',
  frameFieldType: 'command',
  group: 'command',
  dataListId: 'framecommandfieldslist'
}, {
  title: 'value',
  fireSetField: 'frameCommandValue',
  frameFieldType: 'command',
  group: 'command'
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

  group: 'light4',
  displayGroup: 'light',
  displayKey: 'childType',
  displayType: 'number'
}, {
  title: 'decay',
  fireSetField: 'lightDecay',

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
  inheritMaterial: false,
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
