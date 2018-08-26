'use strict';
class gDemoApp extends gAppSuper {
  constructor() {
    super();
    this.a = new gAuthorization();
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
    this.a.signInAnon();
  }
  profileReadyAndLoaded() {
    this.loadStarted = true;

    let urlParams = new URLSearchParams(window.location.search);
    let workspace = urlParams.get('w');
    let block = urlParams.get('b');
    let workspaceCode = urlParams.get('z');
    let blockCode = urlParams.get('y');

    blockCode = 'demo';

    if (!workspaceCode)
      workspaceCode = 'Week 1';
    if (workspaceCode) {
      let data = gAPPP.a.modelSets['projectTitles'].getValuesByFieldLookup('code', workspaceCode);
      if (data)
        workspace = gAPPP.a.modelSets['projectTitles'].lastKeyLookup;
    }
    this.a.profile.selectedWorkspace = workspace;
    this.a.initProjectModels(workspace);

    this.a._activateModels();
    this.initialUILoad = false;

    gAPPP.a.workspaceLoadedCallback = () => {
      if (blockCode) {
        let data = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockCode', blockCode);
        if (data)
          block = gAPPP.a.modelSets['block'].lastKeyLookup;
      }

      gAPPP.a.profile['selectedBlockKey' + workspace] = block;
      this.mV = new cViewDemo();
      this._updateApplicationStyle();

      this.updateProducts();
    };

    document.querySelector('.choice-button-clear').addEventListener('click', () => this.hideBasketGoods());
    document.querySelector('.choice-button-one').addEventListener('click', () => this.showBasketGood('apples'));
    document.querySelector('.choice-button-two').addEventListener('click', () => this.showBasketGood('pears'));
    document.querySelector('.choice-button-three').addEventListener('click', () => this.showBasketGood('plums'));
    document.querySelector('.choice-button-four').addEventListener('click', () => this.showBasketGood('spring onions'));

    document.querySelector('.show-more-controls').addEventListener('click', () => this.toggleShowControls());

    document.getElementById('week-picker-select').addEventListener('input', () => this.changeSelectedWeek());
    document.getElementById('week-picker-select').value = workspaceCode;

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

    for (let c = 0, l = this.products.length; c < l; c++)
      this.productShowPriceAndImage(c);
  }
  changeSelectedWeek() {
    let projCode = document.getElementById('week-picker-select').value;
    /*
        let data = gAPPP.a.modelSets['projectTitles'].getValuesByFieldLookup('code', projCode);
        if (data) {
          let workspace = gAPPP.a.modelSets['projectTitles'].lastKeyLookup;

          gAPPP.a.modelSets['userProfile'].commitUpdateList([{
            field: 'selectedWorkspace',
            newValue: workspace
          }]);
          setTimeout(() => location.reload(), 100);
        }
        */

    if (projCode === 'About') {
      let anchor = document.createElement('a');
      anchor.setAttribute('href', '/demo/about.html');
      anchor.setAttribute('target', '_blank');
      document.body.appendChild(anchor)
      anchor.click();
      document.body.removeChild(anchor);
      return;
    }

    console.log(location);
    let path = location.origin + location.pathname + '?z=' + projCode;
    window.location = path;
    //    setTimeout(() => location.reload(), 100);
  }
  toggleShowControls() {
    if (!this.controlsShown) {
      this.controlsShown = true;
      document.querySelector('.canvas-actions').style.display = 'block';
    } else {
      this.controlsShown = false;
      document.querySelector('.canvas-actions').style.display = 'none';
    }
  }
  hideBasketGoods() {
    this._hideBasketGood('apples');
    this._hideBasketGood('pears');
    this._hideBasketGood('plums');
    this._hideBasketGood('spring onions');
  }
  _hideBasketGood(name) {
    let frames =
      this.mV.rootBlock._findBestTargetObject('block:basketcart').
    _findBestTargetObject('block:display ' + name).framesHelper.framesStash;

    let frameIds = [];
    for (let i in frames)
      frameIds.push(i);

    if (frameIds.length > 0)
      gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionY',
        newValue: "-5"
      }], frameIds[0]);
  }
  addCartItem(itemId) {
    /*
     */

  }
  productShowPriceAndImage(index) {
    let product = this.products[index];

    if (product.priceShown)
      return;

    product.priceShown = true;
    if (!product.priceShape) {
      product.priceShape = 'priceshape' + product.itemId;
      product.titleShape = 'titleshape' + product.itemId;

      let priceShapeData = {
        title: product.priceShape,
        materialName: 'decolor: .5,.1,.1',
        shapeType: 'text',
        textFontFamily: 'Arial',
        textText: product.price,
        textDepth: '.1',
        textSize: '100'
      };

      gAPPP.a.modelSets['shape'].createWithBlobString(priceShapeData).then(results => {});
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
  showBasketGood(name) {
    let frames =
      this.mV.rootBlock._findBestTargetObject('block:basketcart').
    _findBestTargetObject('block:display ' + name).framesHelper.framesStash;

    let frameIds = [];
    for (let i in frames)
      frameIds.push(i);

    if (frameIds.length > 0)
      gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionY',
        newValue: "1.5"
      }], frameIds[0]);
  }
  _addCartItemDOM() {
    let description = 'Apples $3.98';
    let detail = '2 @ $ 1.99 / lb';
    let template =
      `<div class="cart-item">
      <button class="cart-item-remove">X</button>
      <div class="cart-item-description">${description}</div>
      <br>
      <div class="cart-item-detail">${detail}</div>
    </div>`;

    let cartItem = document.createElement('div');
    cartItem.innerHTML = template;
    let cartItemObj = {};

    cartItemObj.dom = cartItem;
    cartItemObj.removeDom = cartItem.querySelector('.cart-item-remove');
    cartItemObj.descriptionDom = cartItem.querySelector('.cart-item-description');
    cartItemObj.detailDom = cartItem.querySelector('.cart-item-detail');

  }
  updateProfile() {
    /*
        gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'cameraPositionSave' + this.rootBlock.blockKey,
          newValue: cp
        }]);
        */
  }
}
