class cViewDemo extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => {
      if (this.cameraShown)
        return;
      this.cameraShown = true;
      setTimeout(() => {

        this.updateProducts();
        this.canvasHelper.cameraSelect.selectedIndex = 2;
        this.canvasHelper.noTestError = true;
        this.canvasHelper.cameraChangeHandler();
        this.canvasHelper.playAnimation();

        this.hideAllProducts()
          .then(rr => {
            setInterval(() => {
              this.updateProductsDisplay()
                .then(() => {});
            }, 1000);
          });
      }, 200);

    };

    this.itemButtons = [];
    this.itemButtons.push(document.querySelector('.choice-button-one'));
    this.itemButtons.push(document.querySelector('.choice-button-two'));
    this.itemButtons.push(document.querySelector('.choice-button-three'));
    this.itemButtons.push(document.querySelector('.choice-button-four'));

    this._clearButtonLabels();

    this.displayButtonPanel = document.querySelector('.user-options-panel');
    this.receiptDisplayPanel = document.querySelector('.cart-contents');
    this.collapseButton = document.querySelector('.collapse-expand');
    this.collapseButton.addEventListener('click', () => this.toggleViewMode());

    this.colors = [
      'decolor: 1,0,0',
      'decolor: 0,1,0',
      'decolor: 0,0,1',
      'decolor: 1,1,0'
    ];
  }
  toggleViewMode() {
    if (this.viewCollapsed) {
      this.receiptDisplayPanel.style.right = '';
      this.collapseButton.innerHTML = '<i class="material-icons">unfold_less</i>';
      this.displayButtonPanel.style.width = '';
      this.viewCollapsed = false;
      this._setButtonLabels();
    } else {
      this.viewCollapsed = true;
      this.collapseButton.innerHTML = '<i class="material-icons">unfold_more</i>';
      this.displayButtonPanel.style.width = '6em';
      this.receiptDisplayPanel.style.right = '-50%';
      this._clearButtonLabels();
    }
  }
  _clearButtonLabels() {
    this.buttonOne.innerHTML = '&nbsp;';
    this.buttonTwo.innerHTML = '&nbsp;';
    this.buttonThree.innerHTML = '&nbsp;';
    this.buttonFour.innerHTML = '&nbsp;';
  }
  closeHeaderBands() {}
  updateProductsDisplay() {
    let productShown = [];
    let currentElapsed = this.canvasHelper.timeE;

    for (let c = 0; c < this.products.length; c++) {
      let product = this.products[c];
      let started = false;
      if (product.startTime <= currentElapsed)
        started = true;

      let ended = true;
      if (currentElapsed <= product.endTime)
        ended = false;

      productShown.push(started && !ended);
    }
    this.productsShown = productShown;

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
    let children = gAPPP.a.modelSets['blockchild'].fireDataValuesByKey;
    let cameraFollowBlockName = 'FollowCamera_followblock';

    this.productBC = [];
    for (let i in children) {
      if (children[i].productIndex)
        this.productBC.push(children[i]);
    }

    let cameraFollowBlocks = gAPPP.a.modelSets['block'].queryCache('title', cameraFollowBlockName);
    let cameraData = null;
    for (let i in cameraFollowBlocks)
      cameraData = cameraFollowBlocks[i];

    if (cameraData) {
      this.finishDelay = GLOBALUTIL.getNumberOrDefault(cameraData.finishdelay, 0);
      this.introTime = GLOBALUTIL.getNumberOrDefault(cameraData.introtime, 0);
      this.runLength = GLOBALUTIL.getNumberOrDefault(cameraData.runlength, 60);
    }

    this.products = [];
    for (let c = 0, l = this.productBC.length; c < l; c++) {
      let pBC = this.productBC[c];
      let obj = this.rootBlock._findBestTargetObject(`${pBC.childType}:${pBC.childName}`);

      let blockData = obj.blockRenderData;
      let bcData = obj.blockRawData;

      let p = {
        blockRef: obj,
        itemId: blockData.itemId,
        title: blockData.itemTitle,
        itemCount: blockData.itemCount,
        desc: blockData.itemDesc,
        price: blockData.itemPrice,
        productIndex: bcData.productIndex,
        childName: bcData.childName,
        childType: bcData.childType
      };
      this.products.push(p);
    }

    this.products.sort((a, b) => {
      if (a.productIndex > b.productIndex)
        return 1;
      if (a.productIndex < b.productIndex)
        return -1;
      return 0;
    });

    let productCount = this.products.length;
    let productsShownAtOnce = 3;
    let numberOfButtons = 4;
    let runTime = this.runLength - this.introTime - this.finishDelay;
    let incLength = runTime / productCount;

    for (let c = 0; c < productCount; c++) {
      this.products[c].startTime = c * incLength + this.introTime;
      this.products[c].endTime = (c + 3) * incLength + this.products[c].startTime;
      this.products[c].colorIndex = c % 4;
    }
  }
  productShowPriceAndImage(index) {
    let product = this.products[index];
    let bc = this.rootBlock._findBestTargetObject(`block:${product.childName}`)
      ._findBestTargetObject(`block:${product.childName}_signpost`);
    let frames = bc.framesHelper.framesStash;

    let frameIds = [];
    for (let i in frames)
      frameIds.push(i);

    if (frameIds.length > 0) {
      return Promise.all([
        gAPPP.a.modelSets['frame'].commitUpdateList([{
          field: 'positionY',
          newValue: "2"
        }], frameIds[0]),
        gAPPP.a.modelSets['block'].commitUpdateList([{
          field: 'materialName',
          newValue: this.colors[product.colorIndex]
        }], bc.blockTargetKey)
      ]);
    }

    this.updateDisplayButtons();
    return Promise.resolve();
  }
  updateDisplayButtons(index) {

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
    let frames = this.rootBlock._findBestTargetObject(`block:${product.childName}`).
    _findBestTargetObject(`block:${product.childName}_signpost`).framesHelper.framesStash;

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
  hideAllProducts() {
    let promises = [];
    for (let c = 0, l = this.products.length; c < l; c++)
      promises.push(this.productHideSign(c));

    return Promise.all(promises);
  }
}
