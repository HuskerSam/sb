class cViewDemo extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => {
      setTimeout(() => {
        this.canvasHelper.cameraSelect.selectedIndex = 2;
        this.canvasHelper.cameraChangeHandler();
        this.canvasHelper.playAnimation();
        this.updateProducts();
      }, 200);
    };
/*
    setInterval(() => {
    }, 1000);
        setInterval(() => {
          this.canvasHelper.cameraSelect.selectedIndex = 0;
          this.canvasHelper.cameraSelect.click();
        }, 1500);
        */
  }
  closeHeaderBands() {


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

    if (!product.priceShape) {
      gAPPP.a.modelSets['shape'].createWithBlobString({
        title: product.priceShape,
        materialName: 'decolor: .5,.1,.1',
        shapeType: 'text',
        textFontFamily: 'Arial',
        textText: product.desc,
        textDepth: '.1',
        textSize: '100'
      }).then(results => {});

      gAPPP.a.modelSets['shape'].createWithBlobString({
        title: product.titleShape,
        materialName: 'decolor: .1,.5,.5',
        shapeType: 'text',
        textFontFamily: 'Times',
        textText: product.title,
        textDepth: '.3',
        textSize: 100
      }).then(results => {});
    }

    gAPPP.a.modelSets['blockchild'].createWithBlobString({
      parentKey: product.blockId,
      childType: 'shape',
      childName: product.priceShape,
      inheritMaterial: false
    }).then(childResults => {
      product.priceBlockChildKey = childResults.key;
      gAPPP.a.modelSets['frame'].createWithBlobString({
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
      }).then(fResults => {});
    });
    gAPPP.a.modelSets['blockchild'].createWithBlobString({
      parentKey: product.blockId,
      childType: 'shape',
      childName: product.titleShape,
      inheritMaterial: false
    }).then(childResults => {
      product.titleBlockChildKey = childResults.key;
      gAPPP.a.modelSets['frame'].createWithBlobString({
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
      }).then(fResults => {});
    });
  }
  productHideRemove(index) {
    let product = this.products[index];
    let priceShapeChildren = gAPPP.a.modelSets['shape'].queryCache('title', product.priceShape);
    let titleShapeChildren = gAPPP.a.modelSets['shape'].queryCache('title', product.titleShape);


  }
  removeAllGeneratedItems() {
    for (let c = 0, l = this.products.length; c < l; c++)
      this.productHideRemove(c);

  }
}
