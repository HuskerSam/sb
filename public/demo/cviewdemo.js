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
              this.updateProductsDisplay()
                .then(() => {});
            }, 1000);
          });
      }, 200);
    };

    this.displayButtonPanel = document.querySelector('.user-options-panel');
    this.receiptDisplayPanel = document.querySelector('.cart-contents');
    this.collapseButton = document.querySelector('.collapse-expand');
    this.collapseButton.addEventListener('click', () => this.toggleViewMode());
  }
  toggleViewMode() {
    if (this.viewCollapsed) {
      this.receiptDisplayPanel.style.display = 'block';
      this.collapseButton.innerHTML = 'C';
      this.displayButtonPanel.style.width = '';
      this.viewCollapsed = false;
    } else {
      this.viewCollapsed = true;
      this.collapseButton.innerHTML = 'E';
      this.displayButtonPanel.style.width = '6em';
      this.receiptDisplayPanel.style.display = 'none';



    }

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
  //  console.log(currentElapsed, productShown);

    return this._updateProducts3D();
  }
  _updateProducts3D() {
    let promises = [];
    for (let c = 0, l = this.productsShown.length; c < l; c++) {
      if (this.productsShown[c]) {
        promises.push(this.productShowPriceAndImage(c));
      } else {
        promises.push(this.productHideSign(c));
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
          price: b.itemPrice
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
    let frames = this.rootBlock._findBestTargetObject(`block:${product.cacheRef.title}`).
    _findBestTargetObject(`block:${product.cacheRef.title}_signpost`).framesHelper.framesStash;

    let frameIds = [];
    for (let i in frames)
      frameIds.push(i);

    if (frameIds.length > 0)
      return gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionY',
        newValue: "2"
      }], frameIds[0]);

    return Promise.resolve();
  }
  removeByTitle(collection, title) {
    let promises = [];
    let priceShapeChildren = gAPPP.a.modelSets[collection].queryCache('title', title);
    for (let i in priceShapeChildren)
      promises.push(gAPPP.a.modelSets[collection].removeByKey(i));

    return promises;
  }
  productHideSign(index) {
    let product = this.products[index];
    let frames = this.rootBlock._findBestTargetObject(`block:${product.cacheRef.title}`).
    _findBestTargetObject(`block:${product.cacheRef.title}_signpost`).framesHelper.framesStash;

    let frameIds = [];
    for (let i in frames)
      frameIds.push(i);

    if (frameIds.length > 0)
      return gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionY',
        newValue: "-50"
      }], frameIds[0]);

    return Promise.resolve();
  }
  removeAllGeneratedItems() {
    let promises = [];
    for (let c = 0, l = this.products.length; c < l; c++)
      promises.push(this.productHideSign(c));

    return Promise.all(promises);
  }
  addAllGeneratedItems() {
    let promises = [];
    for (let c = 0, l = this.products.length; c < l; c++)
      promises.push(this.productShowPriceAndImage(c));

    return Promise.all(promises);
  }
}
