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
        this.canvasHelper.cameraChangeHandler();
        this.canvasHelper.playAnimation();
        this.removeAllGeneratedItems()
          .then(rr => {
              setInterval(() => this.updateProductsDisplay(), 1500);

          });
      }, 200);
    };
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

      if (startTime >= currentElapsed)
        started = true;
      if (endTime - modEndTime <= currentElapsed)
        started = true;

      let ended = true;
      if (modEndTime <= currentElapsed)
        ended = false;

      productShown.push(started && !ended);

      if (productShown[c]) {
        this.productShowPriceAndImage(c);
      }
      else {
        this.productHideRemove(c);
      }
    }

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
          priceShape: 'priceshape' + b.itemId,
          titleShape: 'titleshape' + b.itemId
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

    if (product.priceShown)
      return;
    product.priceShown = true;

    let promises = [];

    promises.push(gAPPP.a.modelSets['shape'].createWithBlobString({
      title: product.priceShape,
      materialName: 'decolor: .5,.1,.1',
      shapeType: 'text',
      textFontFamily: 'Arial',
      textText: product.desc,
      textDepth: '.1',
      textSize: '100'
    }));
    promises.push(gAPPP.a.modelSets['shape'].createWithBlobString({
      title: product.titleShape,
      materialName: 'decolor: .1,.5,.5',
      shapeType: 'text',
      textFontFamily: 'Times',
      textText: product.title,
      textDepth: '.3',
      textSize: 100
    }));

    promises.push(gAPPP.a.modelSets['blockchild'].createWithBlobString({
      parentKey: product.blockId,
      childType: 'shape',
      childName: product.priceShape,
      inheritMaterial: false
    }).then(childResults => {
      product.priceBlockChildKey = childResults.key;

      return gAPPP.a.modelSets['frame'].createWithBlobString({
        parentKey: product.priceBlockChildKey,
        positionX: '',
        positionY: '2',
        positionZ: '',
        rotationX: '',
        rotationY: '180deg',
        rotationZ: '-90deg',
        scalingX: '',
        scalingY: '',
        scalingZ: '',
        visibility: '',
        frameOrder: 10,
        frameTime: 0
      });
    }));

    promises.push(gAPPP.a.modelSets['blockchild'].createWithBlobString({
      parentKey: product.blockId,
      childType: 'shape',
      childName: product.titleShape,
      inheritMaterial: false
    }).then(childResults => {
      product.titleBlockChildKey = childResults.key;
      return gAPPP.a.modelSets['frame'].createWithBlobString({
        parentKey: product.titleBlockChildKey,
        positionX: '',
        positionY: '3',
        positionZ: '',
        rotationX: '',
        rotationY: '180deg',
        rotationZ: '-90deg',
        scalingX: '',
        scalingY: '',
        scalingZ: '',
        visibility: '',
        frameOrder: 10,
        frameTime: 0
      })
    }));

    return Promise.all(promises);
  }
  productHideRemove(index) {
    let product = this.products[index];
    let childblocks = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', product.blockId);
    let promises = [];

    for (let i in childblocks) {
      let bData = childblocks[i];
      if (bData.childName === product.priceShape && bData.childType === 'shape')
        promises.push(gAPPP.a.modelSets['blockchild'].removeByKey(i));
      if (bData.childName === product.titleShape && bData.childType === 'shape')
        promises.push(gAPPP.a.modelSets['blockchild'].removeByKey(i));
    }

    let priceShapeChildren = gAPPP.a.modelSets['shape'].queryCache('title', product.priceShape);
    for (let i in priceShapeChildren)
      promises.push(gAPPP.a.modelSets['shape'].removeByKey(i));

    let titleShapeChildren = gAPPP.a.modelSets['shape'].queryCache('title', product.titleShape);
    for (let i in titleShapeChildren)
      promises.push(gAPPP.a.modelSets['shape'].removeByKey(i));

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
