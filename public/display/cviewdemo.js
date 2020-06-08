class cViewDemo extends bView {
  constructor() {
    super('Demo', null, null, true);
    this.bandButtons = [];

    let anims = gAPPP.animationList;
    this.projectsMap = {};
    anims.forEach(anim => this.projectsMap[anim['wid']] = anim);

    this.canvasHelper.cameraShownCallback = () => this._cameraShown();

    this.displayButtonPanel = document.querySelector('.user-options-panel');
    this.receiptDisplayPanel = document.querySelector('.cart-contents');

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

    window.addEventListener('deviceorientation', event => {
      this.orientationInited = true;
      this.alpha = event.alpha ? event.alpha.toFixed(0) : 'none';
      this.beta = event.beta ? event.beta.toFixed(1) : 'none';
      this.gamma = event.gamma ? event.gamma.toFixed(2) : 'none';

      if (this.orientation_details_div) {
        if (this.alpha !== 'none')
          this.orientation_details_div.innerHTML = this.alpha + ' : ' + this.beta + ' <br>';
      }
    });
  }
  initHeaderBar() {
    this.display_header_bar = this.dialog.querySelector('.display_header_bar');

    this.movie_panel_button = this.dialog.querySelector('.movie_panel_button');
    this.movie_panel = this.dialog.querySelector('.movie_panel');
    this.movieFields = [];
    this.movie_panel_fc = this.movie_panel.querySelector('.fields-container');
    this.movie_panel_ctl = new cBandProfileOptions(this.movie_panel_button, this.movieFields,
      this.movie_panel_fc, this.movie_panel);
    this.movie_panel_ctl.fireFields.values = gAPPP.a.profile;
    this.movie_panel_ctl.panelShownClass = 'profile-panel-shown';
    this.movie_panel_ctl.activate();
    this.bandButtons.push(this.movie_panel_ctl);
    this.canvasHelper.renderTools.panelDisplayCSS = 'block';
    this.movie_panel_ctl.closeOthersCallback = () => this.closeHeaderBands();

    this.volume_panel_button = this.dialog.querySelector('.volume_panel_button');
    this.volume_panel = this.dialog.querySelector('.volume_panel');
    this.volumeFields = this.getSceneFields();
    this.volume_panel_fc = this.volume_panel.querySelector('.fields-container');
    this.volume_panel_ctl = new cBandProfileOptions(this.volume_panel_button, this.volumeFields,
      this.volume_panel_fc, this.volume_panel);
    this.volume_panel_ctl.fireFields.values = gAPPP.a.profile;
    this.volume_panel_ctl.panelShownClass = 'profile-panel-shown';
    this.volume_panel_ctl.activate();
    this.bandButtons.push(this.volume_panel_ctl);
    this.volume_panel_ctl.closeOthersCallback = () => this.closeHeaderBands();

    this.profile_panel_button = this.dialog.querySelector('.profile_panel_button');
    this.profile_panel = this.dialog.querySelector('.profile_panel');
    this.profileFields = sDataDefinition.bindingFieldsCloned('displayProfileFields');
    this.profile_panel_fc = this.profile_panel.querySelector('.fields-container');
    this.profile_panel_ctl = new cBandProfileOptions(this.profile_panel_button, this.profileFields,
      this.profile_panel_fc, this.profile_panel);
    this.profile_panel_ctl.fireFields.values = gAPPP.a.profile;
    this.profile_panel_ctl.panelShownClass = 'profile-panel-shown';
    this.profile_panel_ctl.activate();
    this.bandButtons.push(this.profile_panel_ctl);
    this.profile_panel_ctl.closeOthersCallback = () => this.closeHeaderBands();

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

    this.cart_panel_button = this.dialog.querySelector('.cart_panel_button');
    this.cart_panel = this.dialog.querySelector('.cart_panel');
    this.cart_panel_fc = this.demo_panel.querySelector('.fields-container');
    this.cart_panel_ctl = new cBandProfileOptions(this.cart_panel_button, [],
      this.cart_panel_fc, this.cart_panel);
    this.cart_panel_ctl.fireFields.values = gAPPP.a.profile;
    this.cart_panel_ctl.panelShownClass = 'profile-panel-shown';
    this.cart_panel_ctl.activate();
    this.bandButtons.push(this.cart_panel_ctl);
    this.cart_panel_ctl.closeOthersCallback = () => this.closeHeaderBands();

    this.mute_header_button = this.dialog.querySelector('.mute_header_button');
    this.mute_header_button.addEventListener('click', async e => {
      this.audio.currentTime = Math.max(0, this.canvasHelper.timeE);
      if (this.audio.paused) {
        let noError = true;
        try {
          await this.audio.play();
        } catch (e) {
          noError = false;
        }
        if (noError) {
          this.mute_header_button.innerHTML = '<i class="material-icons">volume_up</i>';
          this.mute_header_button.classList.remove('app-inverted');
        }
      } else {
        this.mute_header_button.innerHTML = '<i class="material-icons">volume_off</i>';
        this.mute_header_button.classList.add('app-inverted');
        this.audio.pause();
      }
    });
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
    if (!this.projectList)
      return;
    if (!this.projectList[gAPPP.loadedWID])
      return;

    let tags = this.projectList[gAPPP.loadedWID].tags;
    if (tags === undefined)
      return;

    if (tags.indexOf('demopanel') !== -1) {
      let pageDesc = this.projectsMap[gAPPP.loadedWID];
      if (!pageDesc)
        return;

      if (!this.demoOptionDiv) {
        this.demoOptionDiv = this.dialog.querySelector('.demo_panel_contents');
      }
      let html = `<select class="ui_select" name="controls">
        <option value="demo_ui" selected>Console UI</option>
        <option value="cart_ui">Mobile</option>
        <option value="anim_ui">Animation</option>
        <option value="edit_ui">Options</option>
      </select><br>`;
      html +=
        `<div class="nav_options"></div><div class="orientation_details_div"></div>`;

      html += ``;
      this.demoOptionDiv.innerHTML = html;
      this.ui_select = this.demoOptionDiv.querySelector('.ui_select');
      this.orientation_details_div = this.demoOptionDiv.querySelector('.orientation_details_div');

      this.ui_select.addEventListener('input', e => this.updateUIDisplay(e));
      this.updateUIDisplay();
      this.updateDemoPanel();
    }
  }
  updateURL() {
    let searchParams = new URLSearchParams(window.location.search);
    if (this.displayCamera)
      searchParams.set("displayCamera", this.displayCamera);
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
  updateDemoPanel() {
    let pageDesc = this.projectsMap[gAPPP.loadedWID];
    if (!pageDesc)
      return;

    let d = this.demoOptionDiv.querySelector('.nav_options');
    let html = '';

    let shelves = this.__findProjectID({
      label: pageDesc.label,
      song: pageDesc.song,
      circuit: 'shelves'
    });
    let isle = this.__findProjectID({
      label: pageDesc.label,
      song: pageDesc.song,
      circuit: 'isle'
    });
    let carousel = this.__findProjectID({
      label: pageDesc.label,
      song: pageDesc.song,
      circuit: 'carousel'
    });
    let tables = this.__findProjectID({
      label: pageDesc.label,
      song: pageDesc.song,
      circuit: 'tables'
    });
    let island = this.__findProjectID({
      label: pageDesc.label,
      song: pageDesc.song,
      circuit: 'island'
    });

    if (pageDesc.circuit === 'carousel') {
      html += `Carousel <a href="?wid=${shelves}${this._optionsURL()}">Shelves</a> <a href="?wid=${isle}${this._optionsURL()}">Isle</a><br> <a href="?wid=${tables}${this._optionsURL()}">Tables</a> <a href="?wid=${island}${this._optionsURL()}">Platform</a><br>`;
    } else if (pageDesc.circuit === 'isle') {
      html += `<a href="?wid=${carousel}${this._optionsURL()}">Carousel</a> <a href="?wid=${shelves}${this._optionsURL()}">Shelves</a> Isle<br> <a href="?wid=${tables}${this._optionsURL()}">Tables</a> <a href="?wid=${island}${this._optionsURL()}">Platform</a><br>`;
    } else if (pageDesc.circuit === 'tables') {
      html += `<a href="?wid=${carousel}${this._optionsURL()}">Carousel</a> <a href="?wid=${shelves}${this._optionsURL()}">Shelves</a> <a href="?wid=${isle}${this._optionsURL()}">Isle</a><br> Tables <a href="?wid=${island}${this._optionsURL()}">Platform</a><br>`;
    } else if (pageDesc.circuit === 'island') {
      html += `<a href="?wid=${carousel}${this._optionsURL()}">Carousel</a> <a href="?wid=${shelves}${this._optionsURL()}">Shelves</a> <a href="?wid=${isle}${this._optionsURL()}">Isle</a><br> <a href="?wid=${tables}${this._optionsURL()}">Tables</a> Platform<br>`;
    } else {
      html += `<a href="?wid=${carousel}${this._optionsURL()}">Carousel</a> Shelves <a href="?wid=${isle}${this._optionsURL()}">Isle</a><br> <a href="?wid=${tables}${this._optionsURL()}">Tables</a> <a href="?wid=${island}${this._optionsURL()}">Platform</a><br>`;
    }
    let flat = this.__findProjectID({
      label: 'flat',
      song: pageDesc.song,
      circuit: pageDesc.circuit
    });
    let raised = this.__findProjectID({
      label: 'raised',
      song: pageDesc.song,
      circuit: pageDesc.circuit
    });
    let min = this.__findProjectID({
      label: 'min',
      song: pageDesc.song,
      circuit: pageDesc.circuit
    });
    if (pageDesc.label === 'flat') {
      html += `<a href="?wid=${min}${this._optionsURL()}">Min</a> Flat <a href="?wid=${raised}${this._optionsURL()}">Raised</a><br>`;
    } else if (pageDesc.label === 'min') {
      html += `Min <a href="?wid=${flat}${this._optionsURL()}">Flat</a> <a href="?wid=${raised}${this._optionsURL()}">Raised</a><br>`;
    } else {
      html += `<a href="?wid=${min}${this._optionsURL()}">Min</a> <a href="?wid=${flat}${this._optionsURL()}">Flat</a> Raised<br>`;
    }

    let elephant = this.__findProjectID({
      label: pageDesc.label,
      song: 'elephant',
      circuit: pageDesc.circuit
    });
    let cantina = this.__findProjectID({
      label: pageDesc.label,
      song: 'cantina',
      circuit: pageDesc.circuit
    });
    let starwars = this.__findProjectID({
      label: pageDesc.label,
      song: 'starwars',
      circuit: pageDesc.circuit
    });
    let mute = this.__findProjectID({
      label: pageDesc.label,
      song: 'mute',
      circuit: pageDesc.circuit
    });
    if (pageDesc.song === 'starwars') {
      html += `Star Wars <a href="?wid=${cantina}${this._optionsURL()}">Cantina</a> <a href="?wid=${elephant}${this._optionsURL()}">Elephant</a> <a href="?wid=${mute}${this._optionsURL()}">Mute</a><br>`;
    } else if (pageDesc.song === 'cantina') {
      html += `<a href="?wid=${starwars}${this._optionsURL()}">Star Wars</a> Cantina <a href="?wid=${elephant}${this._optionsURL()}">Elephant</a> <a href="?wid=${mute}${this._optionsURL()}">Mute</a><br>`;
    } else if (pageDesc.song === 'mute') {
      html += `<a href="?wid=${starwars}${this._optionsURL()}">Star Wars</a> <a href="?wid=${cantina}${this._optionsURL()}">Cantina</a> <a href="?wid=${elephant}${this._optionsURL()}">Elephant</a> Mute<br>`;
    } else {
      html += `<a href="?wid=${starwars}${this._optionsURL()}">Star Wars</a> <a href="?wid=${cantina}${this._optionsURL()}">Cantina</a> Elephant <a href="?wid=${mute}${this._optionsURL()}">Mute</a><br>`;
    }
    d.innerHTML = html;
  }
  updateUIDisplay(evt) {
    let ui_class = this.ui_select.value;

    let urlParams = new URLSearchParams(window.location.search);
    let uiOverlay = urlParams.get('uiOverlay');
    this.uiOverlay = uiOverlay;
    if (uiOverlay)
      ui_class = uiOverlay;

    if (evt) {
      this.updateDemoPanel();
      this.updateURL();
      this.displayCamera = '';
    }

    this.canvasActions.style.display = 'none';
    this.displayButtonPanel.style.display = 'none';
    if (ui_class === 'anim_ui') {
      if (!this.displayCamera)
        this.displayCamera = 'arcRotateCamera';
    }
    if (ui_class === 'cart_ui') {
      this.displayButtonPanel.style.display = '';
      if (!this.displayCamera)
        this.displayCamera = 'demo';
    }
    if (ui_class === 'edit_ui') {
      if (!this.displayCamera)
        this.displayCamera = 'deviceOrientation';
    }

    let camera = this.displayCamera;
    if (camera === 'demo') {
      this.canvasHelper.cameraSelect.selectedIndex = 2;
    }
    if (camera === 'arcRotateCamera') {
      this.canvasHelper.cameraSelect.selectedIndex = 3;
    }
    if (camera === 'deviceOrientation') {
      this.canvasHelper.cameraSelect.selectedIndex = 4;
    }
    this.canvasHelper.noTestError = true;
    this.canvasHelper.cameraChangeHandler();
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
    //  this._sceneDataPanel();
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

    setTimeout(() => document.querySelector('.loading-screen').style.display = 'none', 500);
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
    this.displayCamera = 'demo';
    this.sceneDefaultCamera = '';
    if (this.rootBlock.blockRawData && this.rootBlock.blockRawData.displayCamera) {
      this.displayCamera = this.rootBlock.blockRawData.displayCamera;
      this.sceneDefaultCamera = this.displayCamera;
    }
    let urlParams = new URLSearchParams(window.location.search);
    let displayCamera = urlParams.get('displayCamera');
    this.displayCamera = displayCamera;
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
      }, 100);
    }
  }
  _sceneDataPanel() {
    if (this.rootBlock.blockRawData && this.rootBlock.blockRawData.displayCamera) {
      let editInfoBlocks = gAPPP.a.modelSets['block'].queryCache('blockFlag', 'displayfieldedits');

      this.sceneOptionsSelect = document.createElement('select');
      this.scenePanelDiv.appendChild(this.sceneOptionsSelect);
      this.sceneOptionsEdit = document.createElement('div');
      this.scenePanelDiv.appendChild(this.sceneOptionsEdit);
      document.body.appendChild(this.scenePanelDiv);

      let listHTML = '';
      this.sceneFieldEditBlocks = [];

      let checked = " selected";
      for (let id in editInfoBlocks) {
        let data = editInfoBlocks[id].genericBlockData;
        let parts = data.split('||');
        let mainLabel = parts[0];
        let tab = parts[1];
        let name = parts[2];
        let asset = parts[3];
        let fieldList = [];
        if (name === 'FollowCamera')
          continue;
        for (let c = 4, l = parts.length; c < l; c++) {
          let subParts = parts[c].split(':');
          let field = subParts[0];
          let type = subParts[1];

          fieldList.push({
            field,
            type
          });
        }

        this.sceneFieldEditBlocks.push({
          mainLabel,
          tab,
          name,
          asset,
          fieldList
        });

        listHTML += `<option${checked} value="${this.sceneFieldEditBlocks.length - 1}">${mainLabel}</option>`;
        checked = '';
      }

      this.sceneOptionsSelect.innerHTML = listHTML;
      this.sceneOptionsSelect.addEventListener('input', e => this.sceneOptionListChange());

      this.sceneOptionListChange();
    }
  }
  url(rawUrl) {
    if (rawUrl.substring(0, 3) === 'sb:') {
      rawUrl = gAPPP.cdnPrefix + 'textures/' + rawUrl.substring(3);
    }
    return rawUrl;
  }
  __sceneOptionTextureName(asset, name, field, type) {
    let textureName = '';
    if (asset === 'shape' || asset === 'mesh') {
      this.replacedFieldName = field;
      return name + 'material';
    }

    if (type === 'image') {
      if (asset === 'sceneblock') {
        let desc = field.replace('image', '') + 'panel';
        return name + '_' + desc;
      }
    }

    let origField = field;
    field = field.replace('leftwall', '');
    field = field.replace('rightwall', '');
    field = field.replace('backwall', '');
    field = field.replace('frontwall', '');
    field = field.replace('floor', '');
    field = field.replace('ceilingwall', '');

    if (origField !== field) {
      let panelName = origField.replace(field, '');
      let desc = panelName + 'panel';
      textureName = name + '_' + desc;
    }

    this.replacedFieldName = field;
    return textureName;
  }
  sceneOptionListChange() {
    let index = this.sceneOptionsSelect.selectedIndex;
    if (index < 0)
      return;
    let fieldData = this.sceneFieldEditBlocks[index];

    let fieldHtml = '<input type="file" class="sotexturepathuploadfile" style="display:none;" />';
    let name = fieldData.name;
    let asset = fieldData.asset;

    let __getSceneOptionsValue = (tab, name, asset, field = null, type) => {
      if (tab === 'layout')
        tab = 'scene';
      let textureName = this.__sceneOptionTextureName(asset, name, field, type);

      if (textureName && type === 'image') {
        let textures = gAPPP.a.modelSets['texture'].queryCache('title', textureName);
        let tids = Object.keys(textures);
        if (tids.length > 0) {
          let url = textures[tids[0]].url;
          if (url)
            return url;
        }
      }

      if (textureName && type === 'num') {
        let textures = gAPPP.a.modelSets['texture'].queryCache('title', textureName);
        let tids = Object.keys(textures);
        if (tids.length > 0) {
          let key = '';
          switch (this.replacedFieldName) {
            case 'scaleu':
              key = 'uScale';
              break;
            case 'scalev':
              key = 'vScale';
              break;
            case 'offsetu':
              key = 'uOffset';
              break;
            case 'offsetv':
              key = 'vOffset';
              break;
          }

          if (key)
            return textures[tids[0]][key];
        }
      }


      return '';
    }

    for (let c = 0, l = fieldData.fieldList.length; c < l; c++) {
      let type = fieldData.fieldList[c].type;
      let field = fieldData.fieldList[c].field;

      if (type === 'num') {
        let v = __getSceneOptionsValue(fieldData.tab, name, asset, field, type);
        fieldHtml += `<label class="csv_scene_field_text_wrapper">
          ${field}<input data-field="${field}" type="text" value="${v}" data-tab="${fieldData.tab}"
          data-type="${type}" data-name="${name}" data-asset="${asset}" />
        </label>`;
      }

      if (type === 'image') {
        let v = __getSceneOptionsValue(fieldData.tab, name, asset, field, type);
        fieldHtml += `<label class="csv_scene_field_upload_wrapper">${field}
          <input data-field="${field}" type="text" value="${v}" data-tab="${fieldData.tab}" id="scene_edit_field_${c}_${field}"
          data-type="${type}" data-name="${name}" data-imageid="scene_edit_image_${c}_${field}" data-asset="${asset}" list="sbstoreimageslist" style="width:15em;" />
          <br>
          <img id="scene_edit_image_${c}_${field}" crossorigin="anonymous" src="${this.url(v)}" class="scene_edit_image" />
        </label>
        <button data-fieldid="scene_edit_field_${c}_${field}" class="btn-sb-icon sceneoptionsupload">
          <i class="material-icons">cloud_upload</i></button><br>`;
      }

      if (type === 'childname') {
        let firstChildInfo = gAPPP.a.modelSets['blockchild'].getValuesByFieldLookup('blockFlag', 'basketblockchild');
        let v = firstChildInfo.childName;
        fieldHtml += `<label class="csv_scene_field_text_wrapper">
        ${field}<input data-field="${field}" type="text" value="${v}" data-tab="${fieldData.tab}"
        data-type="${type}" data-name="${name}" data-asset="${asset}" data-list="basketblocktemplatelist" />
      </label>`;
      }

      if (type === 'listskybox') {
        let v = this.productData.sceneBlock.skybox;
        fieldHtml += `<label class="csv_scene_field_text_wrapper">
        ${field}<input data-field="${field}" type="text" value="${v}" data-tab="${fieldData.tab}"
        data-type="${type}" data-name="${name}" data-asset="${asset}" list="skyboxlist" />
      </label>`;
      }

    }

    this.sceneOptionsEdit.innerHTML = fieldHtml;
    this.soUploadImageFile = this.sceneOptionsEdit.querySelector('.sotexturepathuploadfile');
    this.soUploadImageFile.addEventListener('change', e => this.layoutSceneDataUploadImage(e));
    let inputs = this.sceneOptionsEdit.querySelectorAll('input[type="text"]');
    inputs.forEach(i => i.addEventListener('input', e => this.sceneOptionDataChanged(i, e)));
    let uploadButtons = this.sceneOptionsEdit.querySelectorAll('button.sceneoptionsupload');
    uploadButtons.forEach(i => i.addEventListener('click', e => {
      this.soUploadImageFile.btnCTL = i;
      this.soUploadImageFile.editCTL = this.sceneOptionsEdit.querySelector('#' + i.dataset.fieldid);
      this.soUploadImageFile.click();
    }));

    return;
  }
  async layoutSceneDataUploadImage() {
    let fileBlob = this.soUploadImageFile.files[0];

    if (!fileBlob)
      return;

    let fireSet = gAPPP.a.modelSets['block'];
    let key = gAPPP.loadedWID + '/scenedatafiles';
    let uploadResult = await fireSet.setBlob(key, fileBlob, fileBlob.name);
    this.soUploadImageFile.editCTL.value = uploadResult.downloadURL;
    this.sceneOptionDataChanged(this.soUploadImageFile.editCTL);
    return;
  }

  async sceneOptionDataChanged(ctl, e) {
    let data = ctl.dataset;
    let tab = data.tab,
      name = data.name,
      asset = data.asset,
      field = data.field,
      type = data.type,
      imageid = data.imageid,
      value = ctl.value;

    let textureName = this.__sceneOptionTextureName(asset, name, field);
    field = this.replacedFieldName;

    if (type === 'image') {
      document.getElementById(imageid).setAttribute('src', this.url(value));

      if (textureName) {
        let tid = gAPPP.a.modelSets['texture'].getIdByFieldLookup('title', textureName);
        let csvImport = new gCSVImport(gAPPP.loadedWID);
        await csvImport.dbSetRecordFields('texture', {
          'url': value
        }, tid);
      }
    }

    if (type === 'childname') {
      let bcid = gAPPP.a.modelSets['blockchild'].getIdByFieldLookup('blockFlag', 'basketblockchild');
      let csvImport = new gCSVImport(gAPPP.loadedWID);
      await csvImport.dbSetRecordFields('blockchild', {
        'childName': value
      }, bcid);
    }

    if (type === 'listskybox') {
      let csvImport = new gCSVImport(gAPPP.loadedWID);
      await csvImport.dbSetRecordFields('block', {
        'skybox': value
      }, this.productData.sceneId);
    }

    if (field === 'scaleu' || field === 'scalev' || field === 'voffset' || field === 'uoffset') {
      if (textureName) {
        let fieldUpdate = 'uScale';
        if (field === 'scalev')
          fieldUpdate = 'vScale';
        if (field === 'uoffset')
          fieldUpdate = 'uOffset';
        if (field === 'voffset')
          fieldUpdate = 'vOffset';
        let tid = gAPPP.a.modelSets['texture'].getIdByFieldLookup('title', textureName);
        let csvImport = new gCSVImport(gAPPP.loadedWID);
        await csvImport.dbSetRecordFields('texture', {
          [fieldUpdate]: value
        }, tid);
      }
    }

    return;
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
    this.basketUpdateTotal().then(() => {});
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

    if (!this.basketSKUs[sku])
      this.basketSKUs[sku] = 1.0;
    else
      this.basketSKUs[sku] += 1.0;

    let basketData = {
      basketSKUs: this.basketSKUs,
      skuOrder: this.skuOrder
    };

    let wsId = gAPPP.loadedWID;
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'basketData' + wsId,
      newValue: basketData
    }]);
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
      let l2 = count.toString() + ' @ ' + product.desc;
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

    let basketCart = this.rootBlock._findBestTargetObject(`block:basketcart`);
    let sceneProduct = this.rootBlock._findBestTargetObject(`block:${product.childName}`);
    let existingItemBlock = basketCart._findBestTargetObject(`block:${basketBlock}`);

    if (!existingItemBlock)
      return Promise.resolve();

    let basketPos = basketCart.sceneObject.getAbsolutePosition();
    let productPos = sceneProduct.sceneObject.getAbsolutePosition();
    let basketRot = basketCart.sceneObject.rotation;
    let productRot = sceneProduct.sceneObject.rotation;
    let rawOffset = {
      x: basketPos.x - productPos.x,
      y: basketPos.y - productPos.y,
      z: basketPos.z - productPos.z
    };
    let bRot = basketCart.sceneObject.rotation;

    bRot.y = bRot.y + (6 * Math.PI);
    bRot.y = bRot.y % (2 * Math.PI);

    let cos = Math.cos(-bRot.y);
    let sin = Math.sin(-bRot.y);

    this.__shakePosition(sceneProduct.sceneObject);

    let offset = {
      x: -1 * (rawOffset.x * cos + rawOffset.z * sin),
      y: -1 * rawOffset.y,
      z: (rawOffset.x * sin + rawOffset.z * cos)
    };


    let frames = existingItemBlock.framesHelper.rawFrames;
    let frameIds = [];
    for (let i in frames)
      frameIds.push(i);

    if (frameIds.length < 4) {
      //  alert('error');
      return;
    }

    let existingValues = gAPPP.a.modelSets['frame'].fireDataValuesByKey[frameIds[0]];
    if (bRot.y < Math.round(Math.floor(Math.PI * 1000 / 2)) / 1000) {
      offset.z = -offset.z;
      console.log(1);
    } else if (bRot.y < Math.round(Math.floor(0.9 * Math.PI * 1000)) / 1000) {} else if (bRot.y < Math.round(Math.floor(1.4 * Math.PI * 1000)) / 1000) {
      offset.z = -offset.z;
    } else {}
    gAPPP.a.modelSets['frame'].commitUpdateList([{
      field: 'rotationY',
      newValue: ((basketRot.y + productRot.y - Math.PI)).toFixed(2)
    }, {
      field: 'positionX',
      newValue: offset.x
    }, {
      field: 'positionY',
      newValue: offset.y
    }, {
      field: 'positionZ',
      newValue: offset.z
    }, {
      field: 'scalingX',
      newValue: "5"
    }, {
      field: 'scalingY',
      newValue: "5"
    }, {
      field: 'scalingZ',
      newValue: "5"
    }], frameIds[0]);

    gAPPP.a.modelSets['frame'].commitUpdateList([{
      field: 'frameTime',
      newValue: (this.canvasHelper.timeE - .1).toFixed(3) + 's'
    }, {
      field: 'rotationY',
      newValue: ""
    }, {
      field: 'positionX',
      newValue: ''
    }, {
      field: 'positionY',
      newValue: ''
    }, {
      field: 'positionZ',
      newValue: ''
    }, {
      field: 'scalingX',
      newValue: ""
    }, {
      field: 'scalingY',
      newValue: ""
    }, {
      field: 'scalingZ',
      newValue: ""
    }], frameIds[1]);

    gAPPP.a.modelSets['frame'].commitUpdateList([{
      field: 'frameTime',
      newValue: (this.canvasHelper.timeE + .4).toFixed(3) + 's'
    }, {
      field: 'rotationY',
      newValue: ((basketRot.y + productRot.y - Math.PI)).toFixed(2)
    }, {
      field: 'positionX',
      newValue: offset.x
    }, {
      field: 'positionY',
      newValue: offset.y
    }, {
      field: 'positionZ',
      newValue: offset.z
    }, {
      field: 'scalingX',
      newValue: "5"
    }, {
      field: 'scalingY',
      newValue: "5"
    }, {
      field: 'scalingZ',
      newValue: "5"
    }], frameIds[2]);

    gAPPP.a.modelSets['frame'].commitUpdateList([{
      field: 'frameTime',
      newValue: (this.canvasHelper.timeE + 2).toFixed(3) + 's'
    }, {
      field: 'rotationY',
      newValue: "0"
    }, {
      field: 'positionX',
      newValue: pos.x.toString()
    }, {
      field: 'positionY',
      newValue: pos.y.toString()
    }, {
      field: 'positionZ',
      newValue: pos.z.toString()
    }, {
      field: 'scalingX',
      newValue: "1"
    }, {
      field: 'scalingY',
      newValue: "1"
    }, {
      field: 'scalingZ',
      newValue: "1"
    }], frameIds[3]);

    gAPPP.a.modelSets['frame'].commitUpdateList([{
      field: 'frameTime',
      newValue: (this.canvasHelper.timeLength).toFixed() + 's'
    }, {
      field: 'positionX',
      newValue: pos.x.toString()
    }, {
      field: 'positionY',
      newValue: pos.y.toString()
    }, {
      field: 'positionZ',
      newValue: pos.z.toString()
    }, {
      field: 'scalingX',
      newValue: "1"
    }, {
      field: 'scalingY',
      newValue: "1"
    }, {
      field: 'scalingZ',
      newValue: "1"
    }], frameIds[4]);

    setTimeout(async () => {
      gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'rotationY',
        newValue: "0"
      }, {
        field: 'positionX',
        newValue: pos.x.toString()
      }, {
        field: 'positionY',
        newValue: pos.y.toString()
      }, {
        field: 'positionZ',
        newValue: pos.z.toString()
      }, {
        field: 'scalingX',
        newValue: "1"
      }, {
        field: 'scalingY',
        newValue: "1"
      }, {
        field: 'scalingZ',
        newValue: "1"
      }], frameIds[0]);
    }, 500);

    clearTimeout(this.productPickUpdateTimeouts[sku]);
    this.productPickUpdateTimeouts[sku] = setTimeout(async () => {

      gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'rotationY',
        newValue: "0"
      }, {
        field: 'positionX',
        newValue: pos.x.toString()
      }, {
        field: 'positionY',
        newValue: pos.y.toString()
      }, {
        field: 'positionZ',
        newValue: pos.z.toString()
      }, {
        field: 'scalingX',
        newValue: "1"
      }, {
        field: 'scalingY',
        newValue: "1"
      }, {
        field: 'scalingZ',
        newValue: "1"
      }], frameIds[2]);


    }, 2000);

    return Promise.resolve();
  }
  async basketRemoveItemBlock(sku) {
    let product = this.productsBySKU[sku];
    let itemId = product.itemId;
    let basketBlock = product.block;
    let rootKey = this.rootBlock.blockKey;

    let basketCart = await new gCSVImport(gAPPP.loadedWID).findMatchBlocks('block', 'basketcart', rootKey);
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
        newValue: '-1'
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

      promises.push(gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionX',
        newValue: ''
      }, {
        field: 'positionY',
        newValue: '-1'
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
      }], frameIds[1]));

      promises.push(gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionX',
        newValue: ''
      }, {
        field: 'positionY',
        newValue: '-1'
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
      }], frameIds[2]));


      promises.push(gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionX',
        newValue: ''
      }, {
        field: 'positionY',
        newValue: '-1'
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
      }], frameIds[3]));

      promises.push(gAPPP.a.modelSets['frame'].commitUpdateList([{
        field: 'positionX',
        newValue: ''
      }, {
        field: 'positionY',
        newValue: '-1'
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
      }], frameIds[4]));
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
      anchor.setAttribute('href', '/display/about.html');
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
        if (!this.audio.paused)
          this.audio.pause();
        muteButton.innerHTML = '<i class="material-icons">volume_off</i>';
        muteButton.classList.add('app-inverted');
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
        let url = product.itemImage;
        if (url.substring(0, 3) === 'sb:') {
          url = gAPPP.cdnPrefix + 'textures/' + url.substring(3);
        }
        let btnHtml = `<img src="${url}" crossorigin="anonymous" class="button-list-image">` +
          '<span class="expanded">' + product.title + '<br></span><span>' + product.desc.toString() + '</span>';

        if (btn.innerHTMLStash !== btnHtml) {
          btn.innerHTMLStash = btnHtml;
          btn.innerHTML = btnHtml;
        }
        btn.sku = product.itemId;
        btn.style.display = 'inline-block';
        btnsShown[product.colorIndex] = true;
      }
    }

    for (let d = 0, dl = btnsShown.length; d < dl; d++)
      if (!btnsShown[d]) {
        this.itemButtons[d].style.display = 'none';
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
      <div id="renderLoadingCanvas" style="display:none;"></div>
      <div class="form_canvas_wrapper"></div>

      <div class="display_header_bar">
        <div class="display_header_row" style="flex:0">
          <button class="btn-sb-icon app-transparent choice-button-clear cart-submit"><i class="material-icons">send</i></button>
          <button class="cart_panel_button btn-sb-icon app-transparent cart-item-total">$0.00</button>
          <button class="btn-sb-icon app-transparent movie_panel_button"><i class="material-icons">movie</i></button>
          <button class="btn-sb-icon app-transparent volume_panel_button"><i class="material-icons">settings_brightness</i></button>
          <button class="btn-sb-icon app-transparent mute_header_button app-inverted"><i class="material-icons">volume_off</i></button>
          <button class="btn-sb-icon app-transparent profile_panel_button" style="clear:left;"><i class="material-icons">person</i></button>
          <button class="btn-sb-icon app-transparent demo_panel_button"><i class="material-icons">info</i></button>
          <div style="clear:both"></div>
        </div>
        <div class="display_header_slideout" style="flex:1">
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
            <select class="camera-select"></select>
            <div style="display:inline-block;position:relative;">
              <div class="camera-slider-label">Radius</div>
              <input class="camera-select-range-slider" type="range" step="any" min="1" max="300" />
            </div>
            <div style="display:none;position:relative;">
              <div class="camera-slider-label">FOV</div>
              <input class="camera-select-range-fov-slider" type="range" step=".01" min="-1" max="2.5" value=".8" />
            </div>
            <div style="display:inline-block;position:relative;">
              <div class="camera-slider-label">Height</div>
              <input class="camera-select-range-height-slider" type="range" step=".25" min="-15" max="40" />
            </div>
            <div class="fields-container"></div>
          </div>
          <div class="volume_panel"><div class="fields-container"></div></div>
          <div class="profile_panel"><div class="fields-container"></div></div>
          <div class="demo_panel"><div class="demo_panel_contents app-panel app-transparent"></div><div class="fields-container"></div></div>
          <div class="cart_panel">
            <select id="workspaces-select"></select>
            <div class="cart-contents app-panel app-transparent">
            </div>
            <div class="fields-container"></div>
          </div>
        </div>

      </div>

      <div class="user-options-panel">
        <button class="choice-button-one" style="display:none;">&nbsp;</button>
        <button class="choice-button-two" style="display:none;">&nbsp;</button>
        <button class="choice-button-three" style="display:none;">&nbsp;</button>
        <button class="choice-button-four" style="display:none;">&nbsp;</button>
      </div>
    </div>`;
  }
  closeHeaderBands(canvasClick) {
    if (canvasClick)
      return;

    for (let i in this.bandButtons) {
      this.bandButtons[i].expanded = true;
      this.bandButtons[i].toggle();
    }
  }
  getSceneFields() {
    return [{
      title: 'Light',
      fireSetField: 'lightIntensity',
      helperType: 'singleSlider',
      rangeMin: '0',
      rangeMax: '2',
      rangeStep: '.01',
      displayType: 'number',
      group: 'group2',
      groupClass: 'light-intensity-user-panel'
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
    }, {
      title: 'Wireframe',
      fireSetField: 'showForceWireframe',
      type: 'boolean',
      group: 'cameraTrack',
      floatLeft: true,
      clearLeft: true,
    }];
  }
}
