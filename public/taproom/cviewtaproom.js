class cViewDemo extends bView {
  constructor() {
    super('Demo', null, null, true);
    this.displayCamera = '';

    this.bandButtons = [];

    this.canvasHelper.cameraShownCallback = () => this._cameraShown();

    this.displayButtonPanel = document.querySelector('.nontouch_button_options');
    this.receiptDisplayPanel = document.querySelector('.cart-contents');

    this.itemButtons = [];
    this.itemButtons.push(document.querySelector('.choice-button-one'));
    this.itemButtons.push(document.querySelector('.choice-button-two'));
    this.itemButtons.push(document.querySelector('.choice-button-three'));
    this.itemButtons.push(document.querySelector('.choice-button-four'));

    this.itemSymbols = [];
    this.itemSymbols.push('<i class="material-icons-outlined" style="transform:scaleX(.9) scaleY(.9)">fiber_manual_record</i>');
    this.itemSymbols.push('<i class="material-icons-outlined" style="transform:scaleX(.9) scaleY(.9)">clear</i>');
    this.itemSymbols.push('<i class="material-icons-outlined">stop</i>');
    this.itemSymbols.push('<i class="material-icons-outlined" style="transform:rotate(-90deg) scaleX(1.1) scaleY(1.1)">play_arrow</i>');

    this.basketClearButtons();

    document.querySelector('.cart-submit').addEventListener('click', () => this.basketCheckout());
    document.querySelector('.choice-button-one').addEventListener('click', e => this.basketAddItem(e));
    document.querySelector('.choice-button-two').addEventListener('click', e => this.basketAddItem(e));
    document.querySelector('.choice-button-three').addEventListener('click', e => this.basketAddItem(e));
    document.querySelector('.choice-button-four').addEventListener('click', e => this.basketAddItem(e));

    this.mobile_orientation_options = this.dialog.querySelector('.mobile_orientation_options');

    this.cartItemTotal = document.querySelector('.cart-item-total');
    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelect.addEventListener('input', e => this.sceneSelect());
    this.productsBySKU = {};
    this.skuOrder = [];
    this.basketSKUs = {};
    this.sceneIndex = 0;

    this.productPickUpdateTimeouts = {};

    let key = 'selectedBlockKey' + gAPPP.workspace;
    this._updateSelectedBlock(gAPPP.a.profile[key]);
    this.canvasHelper.show();
    this.canvasActions.style.display = 'none';
    this.initHeaderBar();
    this.initBottomBar();

    this.mobile_orientation_sub_options = this.dialog.querySelector('.mobile_orientation_sub_options');
    this.cChat = new cChat(this.mobile_orientation_sub_options, gAPPP);

    gAPPP.activeContext.handleAnimationNotReadyCallback = () => {
      this.rootBlock.updatesDisabled = true;
      this.canvasHelper.hide();
    };
    gAPPP.activeContext.handleAnimationReadyCallback = () => {
      if (this.rootBlock.updatesDisabled)
        location.reload();
    };

    this.image360bkgupload = this.dialog.querySelector('.image360bkgupload');
    let html = '';
    for (let c = 1; c <= 67; c++) {
      html += '<option>sb:chat360/nwalk' + c.toString() + '.jpg</option>';
    }
    this.image360bkgupload.innerHTML = html;
    this.image360bkgupload.addEventListener('input', e => {
      if (!this.productData.sceneId)
        return;

      let v = this.image360bkgupload.value;
      gAPPP.a.modelSets['block'].commitUpdateList([{
        field: 'skybox',
        newValue: v
      }], this.productData.sceneId);
    });

  }
  appDataUpdate(appData) {
    this.cChat.updateMessageStatus();
  }
  initBottomBar() {
    let expand_more = this.dialog.querySelector('.mobile_orientation_options .expand_more');
    let expand_less = this.dialog.querySelector('.mobile_orientation_options .expand_less');
    this.mobile_orientation_options = this.dialog.querySelector('.mobile_orientation_options');
    expand_more.addEventListener('click', e => {
      this.mobile_orientation_options.classList.remove('collapsed');
    });
    expand_less.addEventListener('click', e => {
      this.mobile_orientation_options.classList.add('collapsed');
    });

    this.arrow_upward = this.dialog.querySelector('.mobile_orientation_options .arrow_upward');
    this.arrow_upward.addEventListener('click', e => {
      clearInterval(this.upwardMoveTimeout);

      if (this.arrow_upward.running) {
        this.arrow_upward.running = false;
        this.arrow_upward.classList.remove('app-inverted');
      } else {
        this.arrow_upward.running = true;
        this.arrow_upward.classList.add('app-inverted');
        this.moveCamera('up');
        this.upwardMoveTimeout = setInterval(() => this.moveCamera('up'), 20);
      }
    });

    this.dialog.querySelector('#enable_vr_canvas_btn').addEventListener('click', e => {
      gAPPP.activeContext.setupXRSupport();
    });
    this.second_light_bar = this.dialog.querySelector('.second_light_bar');
    this.lightBarFields = [{
      title: 'Light',
      fireSetField: 'lightIntensity',
      helperType: 'singleSlider',
      rangeMin: '0',
      rangeMax: '2',
      rangeStep: '.01',
      displayType: 'number',
      group: 'group2',
      groupClass: 'second-light-intensity-user-panel'
    }];

    this.second_light_bar_fc = this.second_light_bar.querySelector('.fields-container');
    this.second_light_bar_button = document.createElement('button');
    this.second_light_bar_ctl = new cBandProfileOptions(this.second_light_bar_button, this.lightBarFields,
      this.second_light_bar_fc, this.second_light_bar);
    this.second_light_bar_ctl.fireFields.values = gAPPP.a.profile;
    this.second_light_bar_ctl.panelShownClass = 'profile-panel-shown';
    this.second_light_bar_ctl.activate();
    this.second_light_bar_button.click();



  }
  moveCamera(dir) {
    let camera = gAPPP.activeContext.camera;
    let speed = camera._computeLocalCameraSpeed();

    if (!camera)
      return;

      let base_speed = .3;

    let displayCamera = gAPPP.mV.rootBlock.blockRawData.displayCamera;

    if (displayCamera === 'arcRotateCamera') {
      let cam_dir = new BABYLON.Vector3(0, 0, 0);
      if (dir === 'left') {
        let vec2 = new BABYLON.Vector3(-base_speed, 0, 0);
        camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
        BABYLON.Vector3.TransformNormalToRef(vec2, camera._cameraTransformMatrix, cam_dir);
        camera.target.addInPlace(cam_dir);
      }
      else if (dir === 'up') {
        let vec2 = new BABYLON.Vector3(0, 0, base_speed);
        camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
        BABYLON.Vector3.TransformNormalToRef(vec2, camera._cameraTransformMatrix, cam_dir);
        camera.target.addInPlace(cam_dir);
      } else if (dir === 'right') {
        let vec2 = new BABYLON.Vector3(base_speed, 0, 0);
        camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
        BABYLON.Vector3.TransformNormalToRef(vec2, camera._cameraTransformMatrix, cam_dir);
        camera.target.addInPlace(cam_dir);
      } else if (dir === 'down') {
        let vec2 = new BABYLON.Vector3(0, 0, -base_speed);
        camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
        BABYLON.Vector3.TransformNormalToRef(vec2, camera._cameraTransformMatrix, cam_dir);
        camera.target.addInPlace(cam_dir);
      }



      return;
    }

    if (!camera._localDirection)
      return;
    if (dir === 'left')
      camera._localDirection.copyFromFloats(-speed, 0, 0);
    else if (dir === 'up')
      camera._localDirection.copyFromFloats(0, 0, speed);
    else if (dir === 'right')
      camera._localDirection.copyFromFloats(speed, 0, 0);
    else if (dir === 'down')
      camera._localDirection.copyFromFloats(0, 0, -speed);

    if (camera.getScene().useRightHandedSystem) {
      camera._localDirection.z *= -1;
    }

    camera.getViewMatrix().invertToRef(camera._cameraTransformMatrix);
    BABYLON.Vector3.TransformNormalToRef(camera._localDirection, camera._cameraTransformMatrix, camera._transformedDirection);
    camera.cameraDirection.addInPlace(camera._transformedDirection);
  }
  initHeaderBar() {
    this.display_header_bar = this.dialog.querySelector('.display_header_bar');
    this.display_header_row = this.dialog.querySelector('.display_header_row');

    this.movie_panel_button = this.dialog.querySelector('.movie_panel_button');
    this.movie_panel = this.dialog.querySelector('.movie_panel');
    this.movieFields = this.getBrightnessFields();
    this.movie_panel_fc = this.movie_panel.querySelector('.movie-panel-fields-container');
    this.movie_panel_ctl = new cBandProfileOptions(this.movie_panel_button, this.movieFields,
      this.movie_panel_fc, this.movie_panel);
    this.movie_panel_ctl.fireFields.values = gAPPP.a.profile;
    this.movie_panel_ctl.panelShownClass = 'profile-panel-shown';
    this.movie_panel_ctl.activate();
    this.bandButtons.push(this.movie_panel_ctl);
    this.canvasHelper.renderTools.panelDisplayCSS = 'block';
    this.movie_panel_ctl.closeOthersCallback = () => this.closeHeaderBands();
    this.movie_panel_ctl.panelClosedCallback = () => this.clearHeaderBar();

    this.profile_panel_button = this.dialog.querySelector('.profile_panel_button');
    this.profile_panel = this.dialog.querySelector('.profile_panel');
    this.profileFields = this.getSceneFields();
    this.profile_panel_fc = this.profile_panel.querySelector('.fields-container');
    this.profile_panel_ctl = new cBandProfileOptions(this.profile_panel_button, this.profileFields,
      this.profile_panel_fc, this.profile_panel);
    this.profile_panel_ctl.fireFields.values = gAPPP.a.profile;
    this.profile_panel_ctl.panelShownClass = 'profile-panel-shown';
    this.profile_panel_ctl.activate();
    this.bandButtons.push(this.profile_panel_ctl);
    this.profile_panel_ctl.closeOthersCallback = () => this.closeHeaderBands();
    this.profile_panel_ctl.panelClosedCallback = () => this.clearHeaderBar();

    this.demo_panel_button = this.dialog.querySelector('.demo_panel_button');
    this.demo_panel = this.dialog.querySelector('.demo_panel');
    this.demo_panel_fc = this.demo_panel.querySelector('.fields-container');
    this.demo_panel_ctl = new cBandProfileOptions(this.demo_panel_button, [],
      this.demo_panel_fc, this.demo_panel);
    this.demo_panel_ctl.fireFields.values = gAPPP.a.profile;
    this.demo_panel_ctl.panelShownClass = 'profile-panel-shown';
    this.demo_panel_ctl.activate();
    this.bandButtons.push(this.demo_panel_ctl);
    this.demo_panel_ctl.closeOthersCallback = () => this.closeHeaderBands();
    this.demo_panel_ctl.panelClosedCallback = () => this.clearHeaderBar();

    /*
    this.cart_panel_button = this.dialog.querySelector('.cart_panel_button');
    this.cart_panel = this.dialog.querySelector('.cart_panel');
    this.cart_panel_fc = this.cart_panel.querySelector('.fields-container');
    this.cart_panel_ctl = new cBandProfileOptions(this.cart_panel_button, [],
      this.cart_panel_fc, this.cart_panel);
    this.cart_panel_ctl.fireFields.values = gAPPP.a.profile;
    this.cart_panel_ctl.panelShownClass = 'profile-panel-shown';
    this.cart_panel_ctl.activate();
    this.bandButtons.push(this.cart_panel_ctl);
    this.cart_panel_ctl.closeOthersCallback = () => this.closeHeaderBands();
    this.cart_panel_ctl.panelClosedCallback = () => this.clearHeaderBar();
    */

    this.mute_header_button = this.dialog.querySelector('.mute_header_button');
    this.mute_header_button.addEventListener('click', async e => {
      this.audio.currentTime = Math.max(0, this.canvasHelper.timeE);
      if (this.audio && this.audio.paused) {
        let noError = true;
        try {
          await this.audio.play();
        } catch (e) {
          noError = false;
        }
        if (noError) {
          this.mute_header_button.innerHTML = '<i class="material-icons">music_note</i>';
          this.mute_header_button.classList.add('app-inverted');
        }
      } else {
        this.mute_header_button.innerHTML = '<i class="material-icons">music_off</i>';
        this.mute_header_button.classList.remove('app-inverted');
        this.audio.pause();
      }
    });

    this.profile_clear_button = this.dialog.querySelector('.profile_clear_button');
    this.profile_clear_button.addEventListener('click', e => {
      gAPPP.a.resetProfile();
    });

    this.help_popup_button = this.dialog.querySelector('.help_popup_button');
    this.help_popup_button.addEventListener('click', e => {
      let a = document.createElement('a');
      a.setAttribute('href', '/doc/taproomapp');
      a.setAttribute('target', '_blank');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }
  clearHeaderBar() {
    this.display_header_row.classList.remove('expanded_header');
  }
  __findProjectID(desc) {
    for (let id in this.projectsMap) {
      let p = this.projectsMap[id];
      if (desc.label === p.label && desc.circuit === p.circuit && desc.song === p.song)
        return id;
    }

    return null;
  }
  addDemoPanelOptions() {
    this.ui_select = this.dialog.querySelector('.ui_select');
    this.ui_select.addEventListener('input', e => this.updateUIDisplay(e));
  }
  updateURL() {
    let searchParams = new URLSearchParams(window.location.search);
    if (this.uiOverlay)
      searchParams.set("uiOverlay", this.uiOverlay);

    let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname;

    if (searchParams.toString())
      newurl += '?' + searchParams.toString();
    window.history.pushState({
      path: newurl
    }, '', newurl);

    //    window.location.search = searchParams.toString();
  }
  _optionsURL() {
    let url = '';
    if (this.displayCamera)
      url += `&displayCamera=${this.displayCamera}`;
    if (this.uiOverlay)
      url += `&uiOverlay=${this.uiOverlay}`;
    return url;
  }
  updateUIDisplay(evt) {
    if (!this.ui_select)
      return;
    let ui_overlay = this.ui_select.value;

    if (!evt) {
      let urlParams = new URLSearchParams(window.location.search);
      let uiOverlay = urlParams.get('uiOverlay');
      if (uiOverlay) {
        ui_overlay = uiOverlay;
        this.ui_select.value = ui_overlay;
      }
    }
    this.uiOverlay = ui_overlay;

    if (evt) {
      this.displayCamera = '';
      this.updateURL();
    }

    this.canvasActions.style.display = 'none';
    this.displayButtonPanel.style.display = 'none';
    if (this.uiOverlay === 'mobile_portrait') {
      if (!this.displayCamera)
        this.displayCamera = 'arcRotateCamera';
    }
    if (this.uiOverlay === 'console_follow') {
      this.displayButtonPanel.style.display = '';
      if (!this.displayCamera)
        this.displayCamera = 'demo';
    }
    if (this.uiOverlay === 'mobile_follow') {
      this.displayButtonPanel.style.display = '';
      if (!this.displayCamera)
        this.displayCamera = 'demo';
    }
    if (this.uiOverlay === 'mobile_orientation') {
      if (!this.displayCamera)
        this.displayCamera = 'deviceOrientation';
    }

    document.body.classList.remove('mobile_portrait');
    document.body.classList.remove('console_follow');
    document.body.classList.remove('mobile_follow');
    document.body.classList.remove('mobile_orientation');

    document.body.classList.add(this.uiOverlay);

    let selIndex = this.canvasHelper.cameraSelect.selectedIndex;
    let cameraName = "unknownnotvalid";
    if (selIndex !== -1)
      cameraName = this.canvasHelper.cameraSelect.item(selIndex).innerHTML;
    if (this.displayCamera !== cameraName)
      this._displayCameraFeatures();
  }
  async _cameraShown() {
    this.productData = await new gCSVImport(gAPPP.loadedWID).initProducts();
    this.products = this.productData.products;
    this.productsBySKU = this.productData.productsBySKU;

    this.canvasHelper.cameraSelect.selectedIndex = 2;
    this.canvasHelper.noTestError = true;
    this.canvasHelper.cameraChangeHandler();
    this.canvasHelper.playAnimation();

    let option = document.createElement("option");
    option.text = 'Options';
    option.value = 'Options';
    this.workplacesSelect.add(option);

    option = document.createElement("option");
    option.text = 'About';
    option.value = 'About';
    this.workplacesSelect.add(option);

    this.sceneIndex = this.workplacesSelect.selectedIndex;
    this.productsDisplayUpdate();

    this._displayCameraFeatures();
    this.addDemoPanelOptions();
    if (this.rootBlock.blockRawData && this.rootBlock.blockRawData.displayUI) {
      if (this.ui_select)
        this.ui_select.value = this.rootBlock.blockRawData.displayUI;
      this.displayUIDefault = this.rootBlock.blockRawData.displayUI;
    }

    if (this.rootBlock.blockRawData && this.rootBlock.blockRawData.supportVR) {
      setTimeout(() => gAPPP.activeContext.setupXRSupport(), 1000);
    }

    this.updateUIDisplay();
    this._audioFeatures();
    this.context.scene.onPointerObservable.add(evt => {
      if (evt.type === BABYLON.PointerEventTypes.POINTERDOWN) {
        let pickInfo = this.context.scene.pick(this.context.scene.pointerX, this.context.scene.pointerY, null, null, this.context.camera);
        if (!pickInfo.pickedMesh)
          return;
        let productBlock = this.getProductDataFromBlock(pickInfo.pickedMesh.blockWrapper);
        if (productBlock)
          this.basketAddItem(true, productBlock.blockRenderData.itemId);
      }
    });

    this.basketUpdateTotal();

    setTimeout(() => document.querySelector('.loading-screen').style.display = 'none', 50);

    this.updateDocTitle();
    return Promise.resolve();
  }
  getProductDataFromBlock(blk) {
    if (!blk)
      return null;

    if (blk.blockRenderData.itemId)
      return blk;

    if (!blk.parent)
      return null;

    return this.getProductDataFromBlock(blk.parent);
  }
  _displayCameraFeatures() {
    if (this.rootBlock.blockRawData && this.rootBlock.blockRawData.displayCamera) {
      this.displayCamera = this.rootBlock.blockRawData.displayCamera;
    }
    let urlParams = new URLSearchParams(window.location.search);
    let displayCamera = urlParams.get('displayCamera');
    if (displayCamera)
      this.displayCamera = displayCamera;

    if (this.displayCamera) {
      setTimeout(() => {
        let options = this.canvasHelper.cameraSelect;
        for (let c = 0; c < options.length; c++) {
          if (options.item(c).innerHTML === this.displayCamera) {
            this.canvasHelper.cameraSelect.selectedIndex = c;
            this.canvasHelper.cameraChangeHandler();
            break;
          }
        }
      }, 50);
    } else {
      setTimeout(() => this.canvasHelper.cameraChangeHandler(), 50);
    }
  }
  url(rawUrl) {
    if (rawUrl.substring(0, 3) === 'sb:') {
      rawUrl = gAPPP.cdnPrefix + 'textures/' + rawUrl.substring(3);
    }
    return rawUrl;
  }

  _audioFeatures() {
    if (this.rootBlock.blockRawData && this.rootBlock.blockRawData.audioURL) {
      let audio = document.createElement('audio');
      audio.setAttribute('id', 'audiofileplayback');
      audio.setAttribute('crossorigin', 'anonymous');
      this.audio = audio;
      document.body.appendChild(audio);

      let url = this.rootBlock.blockRawData.audioURL;
      if (url.substring(0, 3) === 'sb:') {
        url = gAPPP.cdnPrefix + 'textures/' + url.substring(3);
      }
      audio.src = url;
      audio.setAttribute('style', 'display:none;position:absolute;top:0;left:0;z-index:10000');
      audio.setAttribute('controls', '');
      audio.loop = true;

    } else {
      this.mute_header_button.style.display = 'none';
    }
  }
  profileUpdate() {
    super.profileUpdate();
    let wsId = gAPPP.loadedWID;

    let basketData = gAPPP.a.profile['basketData' + wsId];

    if (basketData) {
      this.basketSKUs = basketData.basketSKUs;
      this.skuOrder = basketData.skuOrder;
    } else {
      this.basketSKUs = {};
      this.skuOrder = [];
    }
    this.basketUpdateTotal();
  }
  basketAddItem(event, sku = null) {
    if (!sku) {
      let btn = event.currentTarget;
      sku = btn.sku;
    }

    if (!sku)
      return;

    let skuIndex = this.skuOrder.indexOf(sku);
    if (skuIndex === -1) {
      this.skuOrder.push(sku);
      skuIndex = this.skuOrder.length - 1;
    }
    this.basketAddItemBlock(sku, skuIndex);

    return;
  }
  basketRemoveItem(event) {
    let btn = event.currentTarget;
    let sku = btn.sku;
    let skuIndex = this.skuOrder.indexOf(sku);

    if (skuIndex === -1)
      return;

    this.skuOrder.splice(skuIndex, 1);

    delete this.basketSKUs[sku];

    let basketData = {
      basketSKUs: this.basketSKUs,
      skuOrder: this.skuOrder
    };

    let wsId = gAPPP.loadedWID;
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'basketData' + wsId,
      newValue: basketData
    }]);

    this.basketRemoveItemBlock(sku);
  }
  basketCheckout() {
    let wsId = gAPPP.loadedWID;
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'basketData' + wsId,
      newValue: null
    }]);
    this.basketRemoveAllItems();
  }
  async basketUpdateTotal() {
    this.receiptDisplayPanel.innerHTML = '';
    let gTotal = 0.0;
    let promises = [];
    if (!this.products)
      return Promise.resolve();

    for (let c = this.skuOrder.length - 1; c >= 0; c--) {
      let sku = this.skuOrder[c];
      let count = this.basketSKUs[sku];
      let product = this.productsBySKU[sku];

      if (count === 0)
        continue;

      if (!product)
        continue;

      let total = count * product.price;
      let l1 = product.title + ' $' + total.toFixed(2);
      let l2 = count.toString() + ' @ ' + product.priceText;
      gTotal += total;
      let url = product.itemImage;
      if (url.substring(0, 3) === 'sb:') {
        url = gAPPP.cdnPrefix + 'textures/' + url.substring(3);
      }
      let template = `<div class="cart-item">
        <button class="cart-item-remove btn-sb-icon"><i class="material-icons">delete</i></button>
        <img src="${url}" crossorigin="anonymous" class="button-list-image">
        <div class="cart-item-description">${l1}</div>
        <br>
        <div class="cart-item-detail">${l2}</div>
      </div>`;

      let cartItem = document.createElement('div');
      cartItem.innerHTML = template;
      cartItem = cartItem.children[0];
      this.receiptDisplayPanel.appendChild(cartItem);
      let removeDom = cartItem.querySelector('.cart-item-remove');
      removeDom.sku = sku;
      removeDom.addEventListener('click', e => this.basketRemoveItem(e));
    }

    this.cartItemTotal.innerHTML = '$' + gTotal.toFixed(2);

    for (let prodCtr = 0; prodCtr < this.products.length; prodCtr++) {
      let p = this.products[prodCtr];
      if (!p.itemId)
        continue;
      let itemShownIndex = this.skuOrder.indexOf(p.itemId);
      if (itemShownIndex === -1) {
        //  await this.basketRemoveItemBlock(p.itemId);
      }

      let ppp = new Promise((resolve) => {
        setTimeout(() => resolve(), 1);
      });
      await ppp;
    }

    return;
  }
  basketClearButtons() {
    for (let c = 0, l = this.itemButtons.length; c < l; c++) {
      this.itemButtons[c].innerHTML = '&nbsp;';
    }
  }
  __shakePosition(meshGL) {
    let x = meshGL.position.x;
    let y = meshGL.position.y;
    let z = meshGL.position.z;

    meshGL.position.x += 1.0;
    meshGL.position.y += 1.0;
    meshGL.position.z += 1.0;
    meshGL.position.rx += .5;
    meshGL.position.ry += .5;
    meshGL.position.rz += .5;


    setTimeout(() => {
      meshGL.position.x -= 2.0;
      meshGL.position.rx -= 1;
    }, 50);

    setTimeout(() => {
      meshGL.position.z -= 2.0;
      meshGL.position.rz -= 1;
    }, 100);

    setTimeout(() => {
      meshGL.position.x += 1.0;
      meshGL.position.rx += .5;
      meshGL.position.y -= 1.0;
      meshGL.position.z += 1.0;
      meshGL.position.rz += .5;
    }, 150);
  }
  async basketAddItemBlock(sku, index) {
    let pos = new gCSVImport(gAPPP.loadedWID).basketPosition(index);
    let product = this.productsBySKU[sku];
    if (!product)
      return Promise.resolve();

    let basketBlock = product.block;

    let bcart = this.productData.sceneBlock.title + '_basketcart';
    let basketCart = this.rootBlock._findBestTargetObject(`block:${bcart}`);
    let sceneProduct = this.rootBlock._findBestTargetObject(`block:${product.childName}`);
    let existingItemBlock = basketCart._findBestTargetObject(`block:${basketBlock}`);

    if (!existingItemBlock)
      return Promise.resolve();

    this.__shakePosition(sceneProduct.sceneObject);

    return true;
  }
  async basketRemoveItemBlock(sku) {
    let product = this.productsBySKU[sku];
    let itemId = product.itemId;
    let basketBlock = product.block;
    let rootKey = this.rootBlock.blockKey;

    let bcart = this.productData.sceneBlock.title + '_basketcart';
    let basketCart = await new gCSVImport(gAPPP.loadedWID).findMatchBlocks('block', bcart, rootKey);
    let basketItems = await new gCSVImport(gAPPP.loadedWID).findMatchBlocks('block', basketBlock, basketCart[0].blockKey, 'sku', itemId);

    let promises = [];
    for (let c = 0, l = basketItems.length; c < l; c++) {
      let existingItemBlock = basketItems[c];
      let frames = gAPPP.a.modelSets['frame'].queryCache('parentKey', existingItemBlock.BCKey);
      let frameIds = [];
      for (let i in frames)
        frameIds.push(i);

      let existingValues = gAPPP.a.modelSets['frame'].fireDataValuesByKey[frameIds[0]];
      if (existingValues) {
        if (existingValues.positionY === '-1')
          continue;
      }

      promises.push(gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionX',
        newValue: ''
      }, {
        field: 'positionY',
        newValue: '-100'
      }, {
        field: 'positionZ',
        newValue: ''
      }, {
        field: 'scalingX',
        newValue: ".001"
      }, {
        field: 'scalingY',
        newValue: ".001"
      }, {
        field: 'scalingZ',
        newValue: ".001"
      }], frameIds[0]));
    }

    return Promise.all(promises);
  }
  basketRemoveAllItems() {
    for (let c = 0, l = this.products.length; c < l; c++)
      if (this.products[c].itemId)
        this.basketRemoveItemBlock(this.products[c].itemId);
  }

  sceneSelect() {
    let projCode = this.workplacesSelect.value;

    if (projCode === 'About') {
      let anchor = document.createElement('a');
      anchor.setAttribute('href', '/about');
      anchor.setAttribute('target', '_blank');
      document.body.appendChild(anchor)
      anchor.click();
      document.body.removeChild(anchor);
      this.workplacesSelect.selectedIndex = this.sceneIndex;
      return;
    }

    if (projCode === 'Options') {
      this.workplacesSelect.selectedIndex = this.sceneIndex;
      if (this.optionsShown) {
        this.optionsShown = false;
        this.canvasActions.classList.remove('canvas-actions-shown');
      } else {
        this.optionsShown = true;
        this.canvasActions.classList.add('canvas-actions-shown');
      }

      return;
    }

    this.sceneIndex = this.workplacesSelect.selectedIndex;
    this.selectProject();
  }
  _updateQueryString(newWid) {

    let name = gAPPP.mV.workplacesSelect.selectedOptions[0].innerHTML;

    let queryString = `?name=${encodeURIComponent(name)}`;

    let url = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;

    if (url !== this.url) {
      window.history.pushState({
        path: url
      }, '', url);
      this.url = url;
    }

    return;
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
  productsDisplayUpdate() {
    let productShown = [];
    let currentElapsed = this.canvasHelper.timeE;

    if (this.updateDisplay)
      return;

    this.updateDisplay = true;
    for (let c = 0; c < this.products.length; c++) {
      let product = this.products[c];
      let started = false;
      if (product.startShowTime <= currentElapsed)
        started = true;

      let ended = true;
      if (currentElapsed <= product.endShowTime)
        ended = false;

      productShown.push(started && !ended);
    }
    this.productsShown = productShown;

    this._productsUpdateButtons();

    this.updateDisplay = false;

    try {
      if (this.canvasHelper.playState !== 1) {
        if (this.audio && !this.audio.paused)
          this.audio.pause();
        this.mute_header_button.innerHTML = '<i class="material-icons">music_off</i>';
        this.mute_header_button.classList.remove('app-inverted');
      } else {
        if (this.audio) {
          if (this.canvasHelperPaused !== this.canvasHelper.timeE) {
            if (Math.abs(this.audio.currentTime - this.canvasHelper.timeE) > .2)
              this.audio.currentTime = Math.max(0, this.canvasHelper.timeE + .1);
            this.canvasHelperPaused = this.canvasHelper.timeE;
          }
        }
      }
    } catch (audioError) {
      console.log(audioError);
    }

    clearTimeout(this.updateProductsTimeout);
    this.updateProductsTimeout = setTimeout(() => {
      this.productsDisplayUpdate();
    }, 100);
  }
  _productsUpdateButtons() {
    let btnsShown = [
      false, false, false, false
    ];

    for (let c = 0, l = this.productsShown.length; c < l; c++) {
      if (this.productsShown[c]) {
        let product = this.products[c];
        if (!this.products[c].itemId)
          continue;
        let btn = this.itemButtons[product.colorIndex];
        let symHtml = this.itemSymbols[product.colorIndex];
        let url = product.itemImage;
        if (url.substring(0, 3) === 'sb:') {
          url = gAPPP.cdnPrefix + 'textures/' + url.substring(3);
        }
        let btnHtml = symHtml + `<img src="${url}" crossorigin="anonymous" class="button-list-image">` +
          '<span class="expanded">' + product.title + '<br></span><span>' + product.desc.toString() + '</span>';

        if (btn.innerHTMLStash !== btnHtml) {
          btn.innerHTMLStash = btnHtml;
          btn.innerHTML = btnHtml;
        }
        btn.sku = product.itemId;
        btn.style.visibility = 'visible';
        btnsShown[product.colorIndex] = true;
      }
    }

    for (let d = 0, dl = btnsShown.length; d < dl; d++)
      if (!btnsShown[d]) {
        this.itemButtons[d].style.visibility = 'hidden';
        this.itemButtons[d].sku = '';
      }
  }
  _canvasPanelTemplate() {
    return `<canvas class="popup-canvas"></canvas>
    <div class="video-overlay">
      <video></video>
    </div>
    <div class="canvas-actions" style="display:none;">
      <div class="canvas-play-bar">
        <div class="scene-options-panel" style="display:none;">
          <div class="scene-fields-container">
          </div>
        </div>
        <br>
        <button class="btn-sb-icon scene-options" style="clear:both;"><i class="material-icons">settings_brightness</i></button>
        <div class="camera-options-panel" style="display:inline-block;">
          <div class="fields-container" style="float:left"></div>
        </div>
      </div>
    </div>`;
  }
  layoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;">
      <div id="renderLoadingCanvas" style="display:none;">Loading Taproom!</div>
      <div class="form_canvas_wrapper"></div>

      <div class="display_header_bar">
        <div class="display_header_row">
          <button class="cart_panel_button btn-sb-icon app-transparent cart-item-total" style="display:none">$0.00</button>
          <button class="btn-sb-icon app-transparent help_popup_button" style="float:right;"><i class="material-icons-outlined">help</i></button>
          <button class="btn-sb-icon app-transparent mute_header_button" style="float:right;"><i class="material-icons-outlined">music_off</i></button>
          <button class="btn-sb-icon app-transparent demo_panel_button expanded_option"><i class="material-icons-outlined">info</i></button>
          <button class="btn-sb-icon app-transparent movie_panel_button expanded_option"><i class="material-icons-outlined">movie</i></button>
          <div style="clear:both"></div>
        </div>
        <div class="display_header_slideout">
          <div class="movie_panel">
            <button class="btn-sb-icon play-button app-transparent"><i class="material-icons">play_arrow</i></button>
            <button class="btn-sb-icon pause-button app-transparent"><i class="material-icons">pause</i></button>
            <button class="btn-sb-icon stop-button app-transparent"><i class="material-icons">stop</i></button>
            <button class="btn-sb-icon video-button app-transparent"><i class="material-icons">fiber_manual_record</i></button>
            <button class="btn-sb-icon download-button app-transparent" style="margin-bottom:.25em"><i class="material-icons">file_download</i></button>
            <button class="btn-sb-icon show-hide-log app-transparent"><i class="material-icons">info_outline</i></button>
            <div class="render-log-wrapper" style="display:none;">
              <button class="btn-sb-icon log-clear app-transparent"><i class="material-icons">clear_all</i></button>
              <textarea class="render-log-panel app-transparent" spellcheck="false"></textarea>
              <div class="fields-container" style="display:none;"></div>
            </div>
            <br>
            <div style="position:relative;clear:both;">
              <div class="run-length-label"></div>
              <input class="animate-range" type="range" step="any" value="0" min="0" max="100" />
            </div>
            <div style="float:left;position:relative;">
              <div class="camera-slider-label">Radius</div>
              <input class="camera-select-range-slider" type="range" step="any" min="1" max="300" />
            </div>
            <div style="display:none;position:relative;margin-top:.5em">
              <div class="camera-slider-label">FOV</div>
              <input class="camera-select-range-fov-slider" type="range" step=".01" min="-1" max="2.5" value=".8" />
            </div>
            <div style="display:inline-block;position:relative;margin-top:.5em;">
              <div class="camera-slider-label">Height</div>
              <input class="camera-select-range-height-slider" type="range" step=".25" min="-15" max="40" />
            </div>
            <div class="movie-panel-fields-container"></div>
          </div>
          <div class="profile_panel">
            <button class="profile_clear_button btn-sb-icon app-transparent" style="float:left;">Reset Profile</button>
            <div class="fields-container" style="clear:both;"></div>
          </div>
          <div class="demo_panel">
            <div class="demo_panel_contents app-panel app-transparent">
              <select class="ui_select" name="controls">
                &nbsp;
                <option value="mobile_orientation">Mobile Orientation</option>
                <option value="mobile_follow" selected>Mobile Follow</option>
                <option value="console_follow">Console Follow</option>
                <option value="mobile_portrait">Mobile Portrait</option>
              </select>
              <br>
              <button id="enable_vr_canvas_btn">Enable VR</button>
              <a style="line-height:1.5em;font-size:1.5em;" href="/retail/" target="_blank">About...</a>
              <br>
              <select id="workspaces-select"></select><div class="fields-container"></div>
            </div>
          </div>
          <div class="cart_panel">
            <div class="cart-contents app-panel app-transparent">
            </div>
            <div class="fields-container"></div>
            <button class="btn-sb-icon app-transparent cart-submit"><i class="material-icons-outlined">shopping_cart</i>Checkout</button>
          </div>
        </div>
      </div>
      <div class="bottom_options_panel">
        <div class="nontouch_button_options">
          <button class="choice-button-one">&nbsp;</button>
          <button class="choice-button-two">&nbsp;</button>
          <button class="choice-button-three">&nbsp;</button>
          <button class="choice-button-four">&nbsp;</button>
        </div>
        <div class="mobile_orientation_options collapsed">
          <div class="sub_button_bar">
            <div class="mobile_orientation_sub_options"></div>
          </div>
          <div class="mobile_orientation_base_options">
            <button class="btn-sb-icon app-transparent arrow_upward"><i class="material-icons">arrow_upward</i></button>
          </div>
          <button class="btn-sb-icon app-transparent expand_less app-inverted"><i class="material-icons">expand_more</i></button>
          <button class="btn-sb-icon app-transparent expand_more"><i class="material-icons">edit</i></button>
          <button class="btn-sb-icon app-transparent profile_panel_button expanded_option"><i class="material-icons-outlined">person</i></button>
          <br>
          <select class="image360bkgupload"></select>
          <br>
          <select class="camera-select" style="width:auto;float:none;"></select>
        </div>
      </div>
      <div class="second_light_bar" style="position:absolute;right:0;bottom:0"><i class="material-icons flare_icon">flare</i><div class="fields-container"></div></div>
    </div>`;
  }
  selectItem(newKey, newWindow) {

  }
  initBlockAddPanel() {
    this.raw_macro_panel = this.dialog.querySelector('.raw_macro_panel');
/*
    this.generate = new cMacro(this.raw_macro_panel, 'block', gAPPP);
    this.generate.addCallback = async (id, blockName) => {
      if (blockName === undefined) {
        alert('no block name');
        return;
      }
      let parent = this.productData.sceneBlock.title + '_chatWrapper';
      let x = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile.chatStartX, 0.0);
      let y = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile.chatStartY, 10.0);
      let z = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile.chatStartZ, 0.0);
      let rx = gAPPP.a.profile.chatStartrX;
      let ry = gAPPP.a.profile.chatStartrY;
      let rz = gAPPP.a.profile.chatStartrZ;
      let sx = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile.chatStartsX, 5);
      let sy = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile.chatStartsY, 5);
      let sz = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile.chatStartsZ, 5);

      let csvRow = {
        asset: 'blockchild',
        name: blockName,
        childtype: 'block',
        x,
        y,
        z,
        rx,
        ry,
        rz,
        sx,
        sy,
        sz,
        parent
      };

      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'chatStartY',
        newValue: (y + 10.0).toString()
      }]);

      if (this.generate.lastRowAdded && this.generate.lastRowAdded.runlength)
        csvRow.frametime = this.generate.lastRowAdded.runlength;

      let blockResult = await (new gCSVImport(gAPPP.loadedWID)).addCSVRow(csvRow);

      this.generate.lastRowAdded = null;
    };

    let sel = this.dialog.querySelector('.block_wizard_type_select');
    sel.innerHTML = `<option selected>Text and Shape</option>
     <option>Animated Line</option>
     <option>Connector Line</option><option>Web Font</option>`;
    this.generate.blockHelperChange();
    */


    this.circuitmaterialselect = this.dialog.querySelector('.circuitmaterialselect');
    this.circuitmaterialchangeselect = this.dialog.querySelector('.circuitmaterialchangeselect');
    this.circuitmaterialchangeselect.addEventListener('input', e => this.circuitMaterialUpdate());

    this.materialspower = this.dialog.querySelector('.materialspower');
    this.materialscaleu = this.dialog.querySelector('.materialscaleu');
    this.materialscalev = this.dialog.querySelector('.materialscalev');
    this.materialspower.addEventListener('input', e => this.circuitMaterialUpdate());
    this.materialscaleu.addEventListener('input', e => this.circuitMaterialUpdate());
    this.materialscalev.addEventListener('input', e => this.circuitMaterialUpdate());

    let circuitMaterials = gAPPP.a.modelSets['material'].queryCacheContains('title', 'circuit_');
    let matListHtml = '';
    for (let i in circuitMaterials)
      matListHtml += `<option>${circuitMaterials[i].title}</option>`;
    this.circuitmaterialselect.innerHTML = matListHtml;

    let html = '<option>Set to ...</option>';
    //html += this.generate._materialGetHTMLOptionList();
    //html = html.replace(/sb:matpack\//gi, '');
    this.circuitmaterialchangeselect.innerHTML = html;
  }
  circuitMaterialUpdate() {
    let textureD = this.circuitmaterialchangeselect.value;
    let t_title = this.circuitmaterialselect.value;
    if (this.circuitmaterialchangeselect.selectedIndex < 1)
      return;
    let texture = textureD.slice(0, -6);
    let textureURL = textureD;
    let speculartexture = texture + '_S.jpg';
    let bumptexture = texture + '_N.jpg';
    let hasAlpha = false;
    if (textureD.indexOf('.png') !== -1 || textureD.indexOf('.svg') !== -1) {
      hasAlpha = true;
    }

    let specularPower = this.materialspower.value;
    let vScale = this.materialscalev.value;
    let uScale = this.materialscaleu.value;

    let tid = gAPPP.a.modelSets['texture'].getIdByFieldLookup('title', t_title + '_texture');
    let bid = gAPPP.a.modelSets['texture'].getIdByFieldLookup('title', t_title + '_Ntexture');
    let sid = gAPPP.a.modelSets['texture'].getIdByFieldLookup('title', t_title + '_Stexture');

    if (tid) {
      gAPPP.a.modelSets['texture'].commitUpdateList([{
        field: 'url',
        newValue: textureURL
      }, {
        field: 'uScale',
        newValue: uScale
      }, {
        field: 'vScale',
        newValue: vScale
      }, {
        field: 'hasAlpha',
        newValue: hasAlpha
      }], tid);
    }

    if (sid) {
      gAPPP.a.modelSets['texture'].commitUpdateList([{
        field: 'url',
        newValue: speculartexture
      }, {
        field: 'uScale',
        newValue: uScale
      }, {
        field: 'vScale',
        newValue: vScale
      }], sid);
    }

    if (bid) {
      gAPPP.a.modelSets['texture'].commitUpdateList([{
        field: 'url',
        newValue: bumptexture
      }, {
        field: 'uScale',
        newValue: uScale
      }, {
        field: 'vScale',
        newValue: vScale
      }], sid);
    }

    let mid = gAPPP.a.modelSets['material'].getIdByFieldLookup('title', t_title);
    if (mid) {
      gAPPP.a.modelSets['material'].commitUpdateList([{
        field: 'specularPower',
        newValue: specularPower
      }], mid);
    }
  }
  closeHeaderBands(canvasClick) {
    if (canvasClick)
      return;

    for (let i in this.bandButtons) {
      this.bandButtons[i].expanded = true;
      this.bandButtons[i].toggle();
    }

    this.display_header_row.classList.add('expanded_header');
  }
  getSceneFields() {
    return [{
      title: 'Font',
      fireSetField: 'fontFamily',
      group: 'main',
      dataListId: 'fontfamilydatalist',
      type: 'font',
      floatLeft: true
    }, {
      title: 'Background',
      fireSetField: 'canvasColor',
      type: 'color',
      group: 'main',
      rangeMin: '0',
      rangeMax: '1',
      rangeStep: '.005',
      floatLeft: true,
      clearLeft: true,
      displayType: 'shortVector'
    }, {
      title: 'Size',
      fireSetField: 'fontSize',
      group: 'main',
      displayType: 'number',
      groupClass: 'font-size-main-view',
      floatLeft: true
    }, {
      title: 'Display Name',
      fireSetField: 'displayName',
      group: 'displayName',
      floatLeft: true
    }, {
      title: 'Camera Updates',
      fireSetField: 'cameraUpdates',
      group: 'cameraTrack',
      type: 'boolean',
      floatLeft: true,
      clearLeft: true
    }, {
      title: 'Camera Saves',
      fireSetField: 'cameraSaves',
      group: 'cameraTrack',
      type: 'boolean',
      floatLeft: true,
      clearLeft: true
    }];
  }
  getBrightnessFields() {
    return [{
      title: 'Light',
      fireSetField: 'lightIntensity',
      displayType: 'number',
      group: 'group2',
      groupClass: 'light-intensity-user-panel'
    }];
  }
  updateDocTitle() {}
  applicationDataUpdate() {
    console.log('app data update');
  }
}
