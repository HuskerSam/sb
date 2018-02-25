class wGenerate {
  static generateShapeAndText(context, blockId, blockTitle, options) {
    let shapeTextName = blockTitle + '_shapeText';
    let shapeTextNameLine2 = blockTitle + '_shapeTextLine2';
    let textLen = Math.max(options.textText.length, options.textTextLine2.length);
    let scale = 2 * options.width / textLen;
    let textDepth = GLOBALUTIL.getNumberOrDefault(options.textDepth, .25);
    let height = GLOBALUTIL.getNumberOrDefault(options.height, 1);
    let depth = textDepth;
    if (!depth) depth = '.001';
    let positionY = scale * .5;
    if (options.textTextLine2 === '')
      positionY = 0;
    context.createObject('shape', shapeTextName, null, {
      textText: options.textText,
      shapeType: 'text',
      textFontFamily: options.textFontFamily,
      materialName: options.textMaterial,
      scalingX: scale,
      scalingZ: scale,
      positionY: positionY.toFixed(3),
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

    if (options.textTextLine2 !== '') {
      context.createObject('shape', shapeTextNameLine2, null, {
        textText: options.textTextLine2,
        shapeType: 'text',
        textFontFamily: options.textFontFamily,
        materialName: options.textMaterial,
        scalingX: scale,
        scalingZ: scale,
        positionY: (-1 * positionY).toFixed(3),
        textDepth: depth
      }).then(results => {
        context.createObject('blockchild', '', null, {
          childType: 'shape',
          childName: shapeTextNameLine2,
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
    }

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

    this.createShapeBlockChild(context, blockId, blockTitle + '_shapeShape', shapeOptions).then(resultsObj => {
      let newObj = {
        frameTime: '',
        frameOrder: '10',
        parentKey: resultsObj.blockChildResults.key
      };

      for (let i in resultsObj.firstFrameOptions)
        newObj[i] = resultsObj.firstFrameOptions[i];

      context.createObject('frame', '', null, newObj).then(resultB => {});
    });
  }
  static createShapeBlockChild(context, blockId, shapeBlockName, shapeOptions, createShape = true) {
    let width = shapeOptions.width;
    let height = shapeOptions.height;
    let depth = shapeOptions.depth;
    let minDim = Math.min(Math.min(width, height), depth);
    let maxDim = Math.max(Math.max(width, height), depth);
    let firstFrameOptions = {};

    firstFrameOptions.positionZ = (-1.0 * minDim / 2.0).toFixed(3);

    if (shapeOptions.createShapeType === 'Cube') {
      shapeOptions.shapeType = 'box';
      shapeOptions.boxSize = minDim;
      shapeOptions.boxWidth = '';
      shapeOptions.boxHeight = '';
      shapeOptions.boxDepth = '';
      firstFrameOptions.positionZ = (-1.0 * minDim / 2.0).toFixed(3);
    }
    if (shapeOptions.createShapeType === 'Box') {
      shapeOptions.shapeType = 'box';
      shapeOptions.boxSize = '';
      shapeOptions.boxWidth = width.toFixed(3);
      shapeOptions.boxHeight = height.toFixed(3);
      shapeOptions.boxDepth = depth.toFixed(3);
    }
    if (shapeOptions.createShapeType === 'Cone' || shapeOptions.createShapeType === 'Cylinder') {
      if (shapeOptions.cylinderHorizontal) {
        firstFrameOptions.rotationZ = '90deg';
        let h = height;
        height = width;
        width = h;
      }

      shapeOptions.shapeType = 'cylinder';
      shapeOptions.cylinderHeight = height.toFixed(3);
      shapeOptions.cylinderDiameter = width.toFixed(3);
      if (width !== depth) {
        firstFrameOptions.scalingZ = (depth / width).toFixed(3);
      }

      shapeOptions.cylinderTessellation = shapeOptions.shapeDivs;
      firstFrameOptions.positionZ = (-1.0 * depth / 2.0).toFixed(3);

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
      firstFrameOptions.positionZ = (-1.0 * minDim / 2.0).toFixed(3);
    }
    if (shapeOptions.createShapeType === 'Ellipsoid') {
      shapeOptions.shapeType = 'sphere';
      shapeOptions.sphereDiameter = '';
      shapeOptions.sphereDiameterX = width.toFixed(3);
      shapeOptions.sphereDiameterY = height.toFixed(3);
      shapeOptions.sphereDiameterZ = depth.toFixed(3);
      shapeOptions.sphereSegments = shapeOptions.shapeDivs;
    }

    let createShapePromise = new Promise((resolve) => resolve({}));
    if (createShape)
      createShapePromise = context.createObject('shape', shapeBlockName, null, shapeOptions);

    return new Promise((resolve, reject) => {
      createShapePromise.then(results => {
        context.createObject('blockchild', '', null, {
          childType: 'shape',
          childName: shapeBlockName,
          parentKey: blockId
        }).then(innerResults => resolve({
          blockChildResults: innerResults,
          shapeOptions,
          firstFrameOptions
        }));
      });
    });
  }
  static generateConnectorLine(context, blockId, blockTitle, options) {
    let lineShapeOptions = {
      width: options.lineDiameter,
      shapeDivs: options.lineSides,
      height: options.lineLength,
      depth: options.lineDiameter,
      materialName: options.lineMaterial,
      cylinderHorizontal: false,
      createShapeType: 'Cylinder'
    };
    this.createShapeBlockChild(context, blockId, blockTitle + '_connectorLineShape', lineShapeOptions).then(resultsObj => {
      let frameOrder = 10;
      let newObj = {
        parentKey: resultsObj.blockChildResults.key
      };
      newObj.rotationZ = '90deg';
      newObj.rotationX = '90deg';
      newObj.frameOrder = frameOrder.toString();
      newObj.frameTime = "0";
      context.createObject('frame', '', null, newObj).then(resultB => {});
    });
    let pointShapeOptions = {
      width: options.pointDiameter,
      shapeDivs: options.pointSides,
      height: options.pointDiameter,
      depth: options.pointLength,
      materialName: options.pointMaterial,
      createShapeType: options.pointShape
    };

    if (options.pointShape !== 'None')
      this.createShapeBlockChild(context, blockId, blockTitle + '_connectorPointShape', pointShapeOptions).then(resultsObj => {
        let frameOrder = 10;
        let newObj = {
          parentKey: resultsObj.blockChildResults.key
        };
        if (options.pointShape !== 'Cone' && options.pointShape !== 'Cylinder')
          newObj.rotationY = '90deg';
        newObj.rotationZ = '90deg';
        newObj.positionX = -1.0 * (options.lineLength) / 2.0;
        newObj.frameOrder = frameOrder.toString();
        newObj.frameTime = "0";
        context.createObject('frame', '', null, newObj).then(resultB => {});
      });
    let tailShapeOptions = {
      width: options.tailDiameter,
      shapeDivs: options.tailSides,
      height: options.tailDiameter,
      depth: options.tailLength,
      materialName: options.tailMaterial,
      createShapeType: options.tailShape
    };
    if (options.tailShape !== 'None')
      this.createShapeBlockChild(context, blockId, blockTitle + '_connectorTailShape', tailShapeOptions).then(resultsObj => {
        let frameOrder = 10;
        let newObj = {
          parentKey: resultsObj.blockChildResults.key
        };
        if (options.tailShape !== 'Cone' && options.tailShape !== 'Cylinder')
          newObj.rotationY = '90deg';
        newObj.rotationZ = '90deg';
        newObj.positionX = (options.lineLength) / 2.0;
        newObj.frameOrder = frameOrder.toString();
        newObj.frameTime = "0";
        context.createObject('frame', '', null, newObj).then(resultB => {});
      });
  }
  static generateAnimatedLine(context, blockId, blockTitle, options) {
    let barLength = GLOBALUTIL.getNumberOrDefault(options.depth, 10);
    let shapeOptions = {
      width: GLOBALUTIL.getNumberOrDefault(options.width, 1),
      depth: GLOBALUTIL.getNumberOrDefault(options.dashDepth, 1),
      height: GLOBALUTIL.getNumberOrDefault(options.height, 1),
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

    let moreOptions = {};
    if (shapeOptions.createShapeType === 'Cone' || shapeOptions.createShapeType === 'Cylinder') {
      let h = shapeOptions.height;
      shapeOptions.height = shapeOptions.depth;
      shapeOptions.depth = h;
      if (shapeOptions.width !== shapeOptions.height) {
        moreOptions.scalingX = (shapeOptions.width / shapeOptions.height).toFixed(3);
        shapeOptions.width = shapeOptions.height;
      }
      moreOptions.rotationX = '90deg';
    }
    if (shapeOptions.createShapeType === 'Ellispoid') {
      let width = shapeOptions.width;
      let height = shapeOptions.height;
      let depth = shapeOptions.depth;
      shapeOptions.depth = width;
      shapeOptions.width = depth;
    }

    moreOptions.positionZ = barLength / 2.0;

    moreOptions.runTime = GLOBALUTIL.getNumberOrDefault(options.runTime, 2000);
    moreOptions.dashCount = GLOBALUTIL.getNumberOrDefault(options.dashCount, 1);
    moreOptions.endTime = moreOptions.runTime;
    moreOptions.timePerDash = moreOptions.runTime / moreOptions.dashCount;

    for (let i = 0; i < moreOptions.dashCount; i++)
      this.__createLineNode(context, blockId, blockTitle, shapeOptions, moreOptions, i, (i === 0));

    let blockFrame = {
      frameTime: moreOptions.endTime.toFixed(3),
      frameOrder: '10',
      parentKey: blockId
    };
    context.createObject('frame', '', null, blockFrame).then(resultB => {});
  }
  static __createLineNode(context, blockId, blockTitle, shapeOptions, moreOptions, index, createShape = true) {
    this.createShapeBlockChild(context, blockId, blockTitle + '_shapeShape', shapeOptions, createShape).then(resultsObj => {
      let frameOrder = 10;
      let newObj = {
        parentKey: resultsObj.blockChildResults.key
      };

      for (let i in resultsObj.firstFrameOptions)
        newObj[i] = resultsObj.firstFrameOptions[i];
      for (let i in moreOptions)
        newObj[i] = moreOptions[i];

      let zLen = newObj.positionZ * 2;
      let minZTime = index * moreOptions.timePerDash;

      let startPos = (-0.5 * zLen) + (index * moreOptions.timePerDash / moreOptions.endTime * zLen);

      newObj.positionZ = startPos;
      newObj.frameOrder = frameOrder.toString();
      newObj.frameTime = "0";
      context.createObject('frame', '', null, newObj).then(resultB => {});
      frameOrder += 10;

      if (minZTime > .001) {
        let zh = zLen / 2.0;
        let iTime = moreOptions.endTime - minZTime;
        newObj.frameTime = (iTime / moreOptions.endTime * 100.0).toFixed(2).toString() + '%';
        newObj.frameOrder = frameOrder.toString();
        newObj.positionZ = zh.toFixed(3);
        context.createObject('frame', '', null, newObj).then(resultB => {});
        frameOrder += 10;

        newObj.frameTime = ((iTime + 5) / moreOptions.endTime * 100.0).toFixed(2).toString() + '%';
        newObj.frameOrder = frameOrder.toString();
        newObj.positionZ = (-1.0 * zh).toFixed(3);
        context.createObject('frame', '', null, newObj).then(resultB => {});
        frameOrder += 10;
      }

      newObj.positionZ = startPos + zLen;
      if (newObj.positionZ > (zLen / 2.0))
        newObj.positionZ -= zLen;
      newObj.frameOrder = frameOrder.toString();
      newObj.frameTime = '100%';
      context.createObject('frame', '', null, newObj).then(resultB => {});
    });
  }
  static generate2DTexture(context, shapeId, shapeTitle, textOptions) {
    context.createObject('material', shapeTitle + '_2d_material', null, {
      diffuseTextureName: shapeTitle + '_2d_texture',
      emissiveTextureName: shapeTitle + '_2d_texture'
    }).then(() => {});
    textOptions.isText = true;
    textOptions.hasAlpha = true;
    context.createObject('texture', shapeTitle + '_2d_texture', null, textOptions).then(() => {});
  }
}
