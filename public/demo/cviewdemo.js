class cViewDemo extends bView {
  constructor() {
    super();
    this.updateProducts();
    this.canvasHelper.cameraShownCallback = () => {
      if (this.cameraShown)
        return;
      this.cameraShown = true;
      setTimeout(() => {
        this.canvasHelper.cameraSelect.selectedIndex = 2;
        this.canvasHelper.noTestError = true;
        this.canvasHelper.cameraChangeHandler();
        this.canvasHelper.playAnimation();
        this.removeAllGeneratedItems()
          .then(rr => {
            setInterval(() => {
        //      this.updateProductsDisplay()
            //    .then(() => {});
            }, 1000);
//    this.productShowPriceAndImage(0).then(() => {});
//    this.productShowPriceAndImage(1).then(() => {});
//    this.productShowPriceAndImage(2).then(() => {});
        //    this.productHideRemove(0).then(() => {});
      //  this.removeAllGeneratedItems();
          });
      }, 200);
    };
  }
  generateStaticProductItems() {

  }
  closeHeaderBands() {


  }
  updateProductsDisplay() {
    let animLen = this.canvasHelper.timeLength;
    let productCount = this.products.length;
    let currentElapsed = this.canvasHelper.timeE;
    let productsShownAtOnce = 3;
    let numberOfButtons = 4;

    let incLength = animLen / productCount;
    let productShown = [];
    for (let c = 0; c < productCount; c++) {
      let started = false;
      let startTime = c * incLength;
      let endTime = (3 * incLength + startTime);
      let modEndTime = endTime % animLen;

      if (startTime <= currentElapsed)
        started = true;
    //  if (endTime - modEndTime <= currentElapsed)
      //  started = true;

      let ended = true;
      if (modEndTime >= currentElapsed)
        ended = false;

      productShown.push(started && !ended);

    }
    this.productsShown = productShown;
    console.log(currentElapsed, productShown);

    return this._updateProducts3D();
  }
  _updateProducts3D() {
    let promises = [];
    for (let c = 0, l = this.productsShown.length; c < l; c++) {
      if (this.productsShown[c]) {
        promises.push(this.productShowPriceAndImage(c));
      } else {
//        promises.push(this.productHideRemove(c));
      }
    }
    return Promise.all(promises);
  }
  updateProducts() {
    if (this.productsUpdated)
      return;

    this.productsUpdated = true;
    let bD = gAPPP.a.modelSets['block'].fireDataValuesByKey;
    this.products = [];
    for (let i in bD) {
      let b = bD[i];
      if (b.itemId) {
        this.products.push({
          cacheRef: b,
          blockId: i,
          itemId: b.itemId,
          itemIndex: b.itemIndex,
          title: b.itemTitle,
          itemCount: b.itemCount,
          desc: b.itemDesc,
          price: b.itemPrice,
          signBoardBlockName: 'signBoardBlockName' + b.itemId,
          signTextImageName: 'signTextImageName' + b.itemId,
          signTextPriceName: 'signTextPriceName' + b.itemId,
          signTextTitleName: 'signTextTitleName' + b.itemId
        });
      }
    }

    this.products.sort((a, b) => {
      if (a.itemIndex > b.itemIndex)
        return 1;
      if (a.itemIndex < b.itemIndex)
        return -1;
      return 0;
    });

  }
  productShowPriceAndImage(index) {
    let product = this.products[index];
    let blockExists = gAPPP.a.modelSets['block'].queryCache('title', product.signBoardBlockName);
    let keys = Object.keys(blockExists);

    if (keys.length > 0)
      return;

    if (product.texturepath === undefined)
      product.texturepath = '';
    let promises = [];
    let bcList = [];
    let bcFrameList = [];

    let signImagePlane = {
      title: product.signTextImageName,
      materialName: product.signTextImageName,
      shapeType: 'plane',
      boxDepth: '',
      boxHeight: '3',
      boxWidth: '3'
    };
    let signImageMaterial = {
      title: product.signTextImageName,
      "ambientColor": "",
      "ambientTextureName": product.signTextImageName,
      "backFaceCulling": true,
      "bumpTextureName": "",
      "diffuseColor": "",
      "diffuseTextureName": product.signTextImageName,
      "emissiveColor": "",
      "emissiveTextureName": product.signTextImageName
    };
    let signImageTexture = {
      "title": product.signTextImageName,
      "uScale": "1",
      "url": product.texturepath,
      "vScale": "1"
    };

    promises.push(gAPPP.a.modelSets['shape'].createWithBlobString(signImagePlane));
    promises.push(gAPPP.a.modelSets['material'].createWithBlobString(signImageMaterial));
    promises.push(gAPPP.a.modelSets['texture'].createWithBlobString(signImageTexture));

    let signImageBC = {
      parentKey: product.blockId,
      childType: 'shape',
      childName: product.signTextImageName,
      inheritMaterial: false
    };
    let signImageBCFrame = {
      parentKey: undefined,
      positionX: '0.06',
      positionY: '5',
      positionZ: '',
      rotationX: '',
      rotationY: '-90deg',
      rotationZ: '',
      scalingX: '',
      scalingY: '',
      scalingZ: '',
      frameOrder: 10,
      frameTime: '0'
    };
    bcList.push(signImageBC);
    bcFrameList.push(signImageBCFrame);

    let signPostBC = {
      parentKey: product.blockId,
      childType: 'shape',
      childName: 'signpost',
      inheritMaterial: true
    };
    let signPostBCFrame = {
      parentKey: undefined,
      positionX: '-0.05',
      positionY: '2',
      positionZ: '',
      rotationX: '',
      rotationY: '',
      rotationZ: '',
      scalingX: '',
      scalingY: '',
      scalingZ: '',
      frameOrder: 10,
      frameTime: '0'
    };
    bcList.push(signPostBC);
    bcFrameList.push(signPostBCFrame);

    let signBoardBC = {
      parentKey: product.blockId,
      childType: 'shape',
      childName: 'signboard',
      inheritMaterial: true
    };
    let signBoardBCFrame = {
      parentKey: undefined,
      positionX: '',
      positionY: '5',
      positionZ: '',
      rotationX: '',
      rotationY: '',
      rotationZ: '',
      scalingX: '',
      scalingY: '',
      scalingZ: '',
      frameOrder: 10,
      frameTime: '0'
    };
    bcList.push(signBoardBC);
    bcFrameList.push(signBoardBCFrame);

    let signBlockData = {
      title: product.signBoardBlockName,
      materialName: 'decolor: 0,.7,0',
      height: 1,
      width: 2,
      depth: 2
    };
    promises.push(
      gAPPP.a.modelSets['block'].createWithBlobString(signBlockData)
      .then(blockResult => {
        let parentKey = blockResult.key;
        let childPromises = [];

        let addChild = (index) => {
          childPromises.push(
            gAPPP.a.modelSets['blockchild'].createWithBlobString(bcList[index]).then(childResults => {
              bcFrameList[index].parentKey = childResults.key;

              return gAPPP.a.modelSets['frame'].createWithBlobString(bcFrameList[index]);
            })
          );
        };

        for (let c = 0, l = bcList.length; c < l; c++) {
          bcList[c].parentKey = parentKey;
          addChild(c);
        }

        return Promise.all(childPromises);
      })
    );

    let signBlockBC = {
      parentKey: product.blockId,
      childType: 'block',
      childName: product.signBoardBlockName,
      inheritMaterial: false
    };
    let signBlockBCBCFrame = {
      parentKey: undefined,
      positionX: '.1',
      positionY: '',
      positionZ: '',
      rotationX: '',
      rotationY: '180deg',
      rotationZ: '10deg',
      scalingX: '',
      scalingY: '',
      scalingZ: '',
      frameOrder: 10,
      frameTime: '0'
    };
    promises.push(
      gAPPP.a.modelSets['blockchild'].createWithBlobString(signBlockBC).then(childResults => {
        signBlockBCBCFrame.parentKey = childResults.key;
        return gAPPP.a.modelSets['frame'].createWithBlobString(signBlockBCBCFrame);
      })
    );

    return Promise.all(promises);
  }
  removeByTitle(collection, title) {
    let promises = [];
    let priceShapeChildren = gAPPP.a.modelSets[collection].queryCache('title', title);
    for (let i in priceShapeChildren)
      promises.push(gAPPP.a.modelSets[collection].removeByKey(i));

    return promises;
  }
  productHideRemove(index) {
    let product = this.products[index];
    let childblocks = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', product.blockId);
    let promises = [];

    for (let i in childblocks) {
      let bData = childblocks[i];
      if (bData.childName === product.signBoardBlockName && bData.childType === 'block')
        promises.push(gAPPP.a.modelSets['blockchild'].removeByKey(i));
    }

    promises.concat(this.removeByTitle('block', product.signBoardBlockName));
    promises.concat(this.removeByTitle('shape', product.signTextImageName));
    promises.concat(this.removeByTitle('material', product.signTextImageName));
    promises.concat(this.removeByTitle('texture', product.signTextImageName));

    return Promise.all(promises);
  }
  removeAllGeneratedItems() {
    let promises = [];
    for (let c = 0, l = this.products.length; c < l; c++)
      promises.push(this.productHideRemove(c));

    return Promise.all(promises);
  }
  addAllGeneratedItems() {
    let promises = [];
    for (let c = 0, l = this.products.length; c < l; c++)
      promises.push(this.productShowPriceAndImage(c));

    return Promise.all(promises);
  }
}
