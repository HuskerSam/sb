class wGenerate {
  static generateShapeAndText(context, blockId, blockTitle, options) {
    let shapeTextName = blockTitle + '_shapeText';
    let scale = 2 * options.width / options.textText.length;
    let textDepth = GLOBALUTIL.getNumberOrDefault(options.textDepth, 1);
    let depth = textDepth;
    if (!depth) depth = '.001';
    context.createObject('shape', shapeTextName, null, {
      textText: options.textText,
      shapeType: 'text',
      textFontFamily: options.textFontFamily,
      materialName: options.textMaterial,
      scalingX: scale,
      scalingZ: scale,
      textDepth: depth
    }).then(results => {
      context.createObject('blockchild', '', null, {
        childType: 'shape',
        childName: shapeTextName,
        parentKey: blockId
      }).then(innerResults => {
        context.createObject('frame', '', null, {
          frameTime: '',
          frameOrder: '10',
          parentKey: innerResults.key,
          rotationY: '-90deg',
          rotationZ: '-90deg',
          positionZ: (textDepth / 2.0).toFixed(3)
        });
      });
    });

    let shapeOptions = {
      width: GLOBALUTIL.getNumberOrDefault(options.width, 1),
      height: GLOBALUTIL.getNumberOrDefault(options.height, 1),
      depth: GLOBALUTIL.getNumberOrDefault(options.depth, 1),
      createShapeType: options.createShapeType,
      materialName: options.shapeMaterial,
      shapeDivs: options.shapeDivs,
      cylinderHorizontal: options.cylinderHorizontal,
      rotationZ: ''
    }

    this.createShapeBlockChild(context, blockId, blockTitle + '_shapeShape', shapeOptions);
  }
  static createShapeBlockChild(context, blockId, shapeBlockName, shapeOptions) {
    let width = shapeOptions.width;
    let height = shapeOptions.height;
    let depth = shapeOptions.depth;
    let minDim = Math.min(Math.min(width, height), depth);
    let maxDim = Math.max(Math.max(width, height), depth);

    if (shapeOptions.rotationX === undefined)
      shapeOptions.rotationX = '';
    if (shapeOptions.rotationZ === undefined)
      shapeOptions.rotationZ = '';
    if (!shapeOptions.positionZ)
      shapeOptions.positionZ = (-1.0 * minDim / 2.0).toFixed(3);
    if (shapeOptions.scalingX === undefined)
      shapeOptions.scalingX = '';

    if (shapeOptions.createShapeType === 'Cube') {
      shapeOptions.shapeType = 'box';
      shapeOptions.boxSize = minDim;
      shapeOptions.boxWidth = '';
      shapeOptions.boxHeight = '';
      shapeOptions.boxDepth = '';
      shapeOptions.positionZ = (-1.0 * minDim / 2.0).toFixed(3);
    }
    if (shapeOptions.createShapeType === 'Box') {
      shapeOptions.shapeType = 'box';
      shapeOptions.boxSize = '';
      shapeOptions.boxWidth = width.toFixed(3);
      shapeOptions.boxHeight = height.toFixed(3);
      shapeOptions.boxDepth = depth.toFixed(3);
    }
    if (shapeOptions.createShapeType === 'Cone' || shapeOptions.createShapeType === 'Cylinder') {
      shapeOptions.shapeType = 'cylinder';
      shapeOptions.cylinderHeight = depth.toFixed(3);
      shapeOptions.cylinderDiameter = Math.min(width, height).toFixed(3);
      shapeOptions.cylinderTessellation = shapeOptions.shapeDivs;

      if (shapeOptions.cylinderHorizontal) {
        shapeOptions.cylinderHeight = width.toFixed(3);
        shapeOptions.cylinderDiameter = Math.min(height, depth).toFixed(3);
        shapeOptions.rotationZ = '90deg';
        shapeOptions.positionZ = (-1.0 * shapeOptions.cylinderDiameter / 2.0).toFixed(3);
      }
      console.log(shapeOptions);

      if (shapeOptions.createShapeType === 'Cone')
        shapeOptions.cylinderDiameterTop = 0;
    }
    if (shapeOptions.createShapeType === 'Sphere') {
      shapeOptions.shapeType = 'sphere';
      shapeOptions.sphereDiameter = minDim;
      shapeOptions.sphereSegments = shapeOptions.shapeDivs;
      shapeOptions.boxWidth = '';
      shapeOptions.boxHeight = '';
      shapeOptions.boxDepth = '';
      shapeOptions.positionZ = (-1.0 * minDim / 2.0).toFixed(3);
    }
    if (shapeOptions.createShapeType === 'Ellipsoid') {
      shapeOptions.shapeType = 'sphere';
      shapeOptions.sphereDiameter = '';
      shapeOptions.sphereDiameterX = width.toFixed(3);
      shapeOptions.sphereDiameterY = height.toFixed(3);
      shapeOptions.sphereDiameterZ = depth.toFixed(3);
      shapeOptions.sphereSegments = shapeOptions.shapeDivs;
    }

    context.createObject('shape', shapeBlockName, null, shapeOptions).then(results => {
      context.createObject('blockchild', '', null, {
        childType: 'shape',
        childName: shapeBlockName,
        parentKey: blockId
      }).then(innerResults => {
        context.createObject('frame', '', null, {
          frameTime: '',
          frameOrder: '10',
          parentKey: innerResults.key,
          rotationZ: shapeOptions.rotationZ,
          rotationX: shapeOptions.rotationX,
          positionZ: shapeOptions.positionZ,
          scalingX: shapeOptions.scalingX
        }).then(resultB => {});
      });
    });
  }
  static generateAnimatedLine(context, blockId, blockTitle, options) {
    let shapeOptions = {
      width: GLOBALUTIL.getNumberOrDefault(options.dashWidth, 1),
      depth: GLOBALUTIL.getNumberOrDefault(options.dashDepth, 1),
      height: GLOBALUTIL.getNumberOrDefault(options.dashHeight, 1),
      createShapeType: options.createShapeType,
      materialName: options.materialName,
      shapeDivs: options.shapeDivs,
      cylinderHorizontal: false,
      rotationZ: ''
    }
    if (shapeOptions.width <= 0.0)
      shapeOptions.width = 0.001;
    if (shapeOptions.height <= 0.0)
      shapeOptions.height = 0.001;
    if (shapeOptions.depth <= 0.0)
      shapeOptions.depth = 0.001;

    shapeOptions.rotationX = '90deg';
    if (shapeOptions.width !== shapeOptions.height) {
      shapeOptions.scalingX = (shapeOptions.width / shapeOptions.height).toFixed(3);
      shapeOptions.width = shapeOptions.height;
    }

    this.createShapeBlockChild(context, blockId, blockTitle + '_shapeShape', shapeOptions);

    console.log(options);
  }
}
