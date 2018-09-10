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

    this.buttonOne = document.querySelector('.choice-button-one');
    this.buttonTwo = document.querySelector('.choice-button-two');
    this.buttonThree = document.querySelector('.choice-button-three');
    this.buttonFour = document.querySelector('.choice-button-four');

    this.buttonOneText = 'Pears &nbsp; 2 for $1';
    this.buttonTwoText = 'Watermelon &nbsp; $5 each';
    this.buttonThreeText = 'Apples &nbsp; $1.99 / lb';
    this.buttonFourText = 'Onions &nbsp; $.89 / lb';
    this._setButtonLabels();

    this.displayButtonPanel = document.querySelector('.user-options-panel');
    this.receiptDisplayPanel = document.querySelector('.cart-contents');
    this.collapseButton = document.querySelector('.collapse-expand');
    this.collapseButton.addEventListener('click', () => this.toggleViewMode());
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
  _setButtonLabels() {
    this.buttonOne.innerHTML = this.buttonOneText;
    this.buttonTwo.innerHTML = this.buttonTwoText;
    this.buttonThree.innerHTML = this.buttonThreeText;
    this.buttonFour.innerHTML = this.buttonFourText;
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

    this.productBC = [];
    for (let i in children)
      if (children[i].productIndex)
        this.productBC.push(children[i]);

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
  }
  productShowPriceAndImage(index) {
    let product = this.products[index];
    let frames = this.rootBlock._findBestTargetObject(`block:${product.childName}`).
    _findBestTargetObject(`block:${product.childName}_signpost`).framesHelper.framesStash;

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
