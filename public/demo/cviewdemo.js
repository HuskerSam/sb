class cViewDemo extends bView {
  constructor() {
    super();
    this.canvasHelper.cameraShownCallback = () => {
      if (this.cameraShown)
        return;
      this.cameraShown = true;
      setTimeout(() => {

        this.productsInit();
        this.canvasHelper.cameraSelect.selectedIndex = 2;
        this.canvasHelper.noTestError = true;
        this.canvasHelper.cameraChangeHandler();
        this.canvasHelper.playAnimation();

        this._productsHideAll()
          .then(rr => this.productsDisplayUpdate());
      }, 200);

    };

    this.itemButtons = [];
    this.itemButtons.push(document.querySelector('.choice-button-one'));
    this.itemButtons.push(document.querySelector('.choice-button-two'));
    this.itemButtons.push(document.querySelector('.choice-button-three'));
    this.itemButtons.push(document.querySelector('.choice-button-four'));

    this.basketClearButtons();

    document.querySelector('.choice-button-clear').addEventListener('click', () => this.basketCheckout());
    document.querySelector('.choice-button-one').addEventListener('click', e => this.basketAddItem(e));
    document.querySelector('.choice-button-two').addEventListener('click', e => this.basketAddItem(e));
    document.querySelector('.choice-button-three').addEventListener('click', e => this.basketAddItem(e));
    document.querySelector('.choice-button-four').addEventListener('click', e => this.basketAddItem(e));

    this.displayButtonPanel = document.querySelector('.user-options-panel');
    this.receiptDisplayPanel = document.querySelector('.cart-contents');
    this.collapseButton = document.querySelector('.collapse-expand');
    this.collapseButton.addEventListener('click', () => this.sceneToggleView());

    this.colors = [
      'decolor: 1,0,0',
      'decolor: 0,1,0',
      'decolor: 0,0,1',
      'decolor: 1,1,0'
    ];
    this.buttonColors = [
      'rgb(255,0,0)',
      'rgb(0,255,0)',
      'rgb(0,0,255)',
      'rgb(255,255,0)'
    ];
    this.buttonForeColors = [
      'rgb(0,0,0)',
      'rgb(0,0,0)',
      'rgb(255,255,255)',
      'rgb(0,0,0)'
    ];

    this.sceneIndex = 0;
    this.weekPickerSelect = document.getElementById('week-picker-select');
    this.canvasActionsDom = document.querySelector('.canvas-actions');
    this.cartItemTotal = document.querySelector('.cart-item-total');
    this.weekPickerSelect.addEventListener('input', () => this.sceneSelect());
    this.weekPickerSelect.value = gAPPP.workspaceCode;

    this.productBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};
  }
  _userProfileChange() {
    super._userProfileChange();

    let basketData = gAPPP.a.profile.basketData;

    if (basketData) {
      this.basketSKUs = basketData.basketSKUs;
      this.skuOrder = basketData.skuOrder;
    } else {
      this.basketSKUs = {};
      this.skuOrder = [];
    }
    this.basketUpdateTotal();
  }

  basketAddItem(event) {
    let btn = event.target;
    let sku = btn.sku;

    if (!sku)
      return;

    if (this.skuOrder.indexOf(sku) === -1)
      this.skuOrder.push(sku);

    if (!this.basketSKUs[sku])
      this.basketSKUs[sku] = 1.0;
    else
      this.basketSKUs[sku] += 1.0;

    let basketData = {
      basketSKUs: this.basketSKUs,
      skuOrder: this.skuOrder
    }

    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'basketData',
      newValue: basketData
    }]);
  }
  basketRemoveItem(event) {
    let btn = event.target;
    let sku = btn.sku;
    let skuIndex = this.skuOrder.indexOf(sku);

    if (skuIndex === -1)
      return;

    this.skuOrder.splice(skuIndex, 1);

    delete  this.basketSKUs[sku];

    let basketData = {
      basketSKUs: this.basketSKUs,
      skuOrder: this.skuOrder
    }

    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'basketData',
      newValue: basketData
    }]);

    this.basketRemoveItemBlock(sku);
  }
  basketCheckout() {
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'basketData',
      newValue: null
    }]);
  }
  basketUpdateTotal() {
    this.receiptDisplayPanel.innerHTML = '';
    let gTotal = 0.0;
    for (let c = 0, l = this.skuOrder.length; c < l; c++) {
      let sku = this.skuOrder[c];
      let count = this.basketSKUs[sku];
      let product = this.productBySKU[sku];

      if (count === 0)
        continue;

      let total = count * product.price;
      let l1 = product.title + ' $' + total.toFixed(2);
      let l2 = count.toString() + ' @ ' + product.desc;
      gTotal += total;
      let template = `<div class="cart-item">
        <button class="cart-item-remove">X</button>
        <div class="cart-item-description">${l1}</div>
        <br>
        <div class="cart-item-detail">${l2}</div>
      </div>`;

      let cartItem = document.createElement('div');
      cartItem.innerHTML = template;
      this.receiptDisplayPanel.appendChild(cartItem);
      let removeDom = cartItem.querySelector('.cart-item-remove');
      removeDom.sku = sku;
      removeDom.addEventListener('click', e => this.basketRemoveItem(e));

      this.basketAddItemBlock(sku, c);
    }

    this.cartItemTotal.innerHTML = '$' + gTotal.toFixed(2);
  }
  basketClearButtons() {
    for (let c = 0, l = this.itemButtons.length; c < l; c++) {
      this.itemButtons[c].innerHTML = '&nbsp;';
    }
  }
  basketAddItemBlock(sku, index) {
    this.basketRemoveAllItems();
    
    let product = this.productBySKU[sku];
    let basketBlock = product.blockRef.blockRenderData.basketBlock;

    let basketCart = this.rootBlock._findBestTargetObject(`block:basketcart`);
    let existingItemBlock = basketCart._findBestTargetObject(`block:${basketBlock}`);

    if (existingItemBlock === null) {
      //return;
      console.log(basketBlock, 'adding');
      //add blockchild and frame
      let row = {
        asset: 'blockchild',
        materialname: '',
        parent: 'basketcart',
        childtype: 'block',
        name: basketBlock,
        inheritmaterial: false,
        x: index.toString(),
        y: '',
        z: '',
        rx: '',
        ry: '',
        rz: '',
        sx: '.5',
        sy: '.5',
        sz: '.5',
        visibility: ''
      };

      GUTILImportCSV.addCSVRow(row).then(() => {});
    } else {
      //test frame - if fail remove and add new
    }
  }
  basketRemoveItemBlock(sku) {
    let product = this.productBySKU[sku];
    let basketBlock = product.blockRef.blockRenderData.basketBlock;

    let basketCart = this.rootBlock._findBestTargetObject(`block:basketcart`);
    let existingItemBlock = basketCart._findBestTargetObject(`block:${basketBlock}`);
    if (existingItemBlock !== null)
      gAPPP.a.modelSets['blockchild'].removeByKey(existingItemBlock.blockKey);
  }
  basketRemoveAllItems() {
    let basketCart = this.rootBlock._findBestTargetObject(`block:basketcart`);
    console.log(basketCart);
  }

  sceneSelect() {
    let projCode = this.weekPickerSelect.value;

    if (projCode === 'About') {
      let anchor = document.createElement('a');
      anchor.setAttribute('href', '/demo/about.html');
      anchor.setAttribute('target', '_blank');
      document.body.appendChild(anchor)
      anchor.click();
      document.body.removeChild(anchor);
      this.weekPickerSelect.selectedIndex = this.sceneIndex;
      return;
    }

    if (projCode === 'Options') {
      this.weekPickerSelect.selectedIndex = this.sceneIndex;
      if (this.optionsShown) {
        this.optionsShown = false;
        this.canvasActionsDom.classList.remove('canvas-actions-shown');
      } else {
        this.optionsShown = true;
        this.canvasActionsDom.classList.add('canvas-actions-shown');
      }

      return;
    }

    this.sceneIndex = this.weekPickerSelect.selectedIndex;
    let path = location.origin + location.pathname + '?z=' + projCode;
    window.location = path;
  }
  sceneToggleView() {
    if (this.viewCollapsed) {
      this.receiptDisplayPanel.style.right = '';
      this.collapseButton.innerHTML = '<i class="material-icons">unfold_less</i>';
      this.displayButtonPanel.style.width = '';
      this.viewCollapsed = false;
      //this._setButtonLabels();
    } else {
      this.viewCollapsed = true;
      this.collapseButton.innerHTML = '<i class="material-icons">unfold_more</i>';
      this.displayButtonPanel.style.width = '6em';
      this.receiptDisplayPanel.style.right = '-50%';
      this.basketClearButtons();
    }
  }
  sceneToggleControls() {
    if (!this.controlsShown) {
      this.controlsShown = true;
      document.querySelector('.canvas-actions').style.display = 'block';
    } else {
      this.controlsShown = false;
      document.querySelector('.canvas-actions').style.display = 'none';
    }
  }

  productsInit() {
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
      this.productBySKU[p.itemId] = p;
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
      this.products[c].endTime = productsShownAtOnce * incLength + this.products[c].startTime;
      this.products[c].colorIndex = c % 4;
    }
  }
  productsDisplayUpdate() {
    let productShown = [];
    let currentElapsed = this.canvasHelper.timeE;

    if (this.updateDisplay)
      return;

    this.updateDisplay = true;
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

    Promise.all([
      this._productsUpdateScene(),
      this._productsUpdateButtons()
    ]).then(result => {
      this.updateDisplay = false;
      clearTimeout(this.updateProductsTimeout);
      this.updateProductsTimeout = setTimeout(() => {
        this.productsDisplayUpdate();
      }, 1000);
    });

  }
  _productsUpdateButtons() {
    this.itemButtons[0].style.display = 'none';
    this.itemButtons[0].sku = '';
    this.itemButtons[1].style.display = 'none';
    this.itemButtons[1].sku = '';
    this.itemButtons[2].style.display = 'none';
    this.itemButtons[2].sku = '';
    this.itemButtons[3].style.display = 'none';
    this.itemButtons[3].sku = '';

    for (let c = 0, l = this.productsShown.length; c < l; c++) {
      if (this.productsShown[c]) {
        let product = this.products[c];
        let btn = this.itemButtons[product.colorIndex];
        btn.innerHTML = product.price.toString();
        btn.sku = product.itemId;
        btn.style.display = 'inline-block';
      }
    }

    return Promise.resolve();
  }
  _productsUpdateScene() {
    let promises = [];
    for (let c = 0, l = this.productsShown.length; c < l; c++) {
      if (this.productsShown[c]) {
        promises.push(this._productsShowDetails(c));
      } else {
        promises.push(this._productsHideSign(c));
      }
    }
    return Promise.all(promises);
  }
  _productsHideAll() {
    let promises = [];
    for (let c = 0, l = this.products.length; c < l; c++)
      promises.push(this._productsHideSign(c));

    return Promise.all(promises);
  }
  _productsHideSign(index) {
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
  _productsShowDetails(index) {
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

    return Promise.resolve();
  }
}
