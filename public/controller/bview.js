class bView {
  constructor(layoutMode, tag, key = null, play = false, childKey, subview, geoOptions) {
    this.playAnimation = play;
    this.expandedAll = true;
    this.tag = tag;
    this.key = key;
    this.childKey = childKey;
    this.layoutMode = layoutMode;
    this.subView = subview;
    this.geoOptions = geoOptions;
    this.templateBasePath = 'https://s3-us-west-2.amazonaws.com/hcwebflow/templates/';
    this.canvasFBRecordTypes = ['blockchild', 'block', 'mesh', 'shape', 'material', 'texture', 'frame'];
    this.detailsShown = gAPPP.a.profile.applicationDetailsShown;
    this.initDom();
    this.dialog.context = this.context;
    this.show(null);
  }
  initDom() {
    if (this.context)
      this.context.deactivate();

    if (!this.layoutMode)
      this.layoutMode = 'Left';


    this.dialog = document.querySelector('#firebase-app-main-page');
    document.body.removeChild(this.dialog);
    this.dialog = null;

    let div = document.createElement('div');
    div.innerHTML = this.layoutTemplate();
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
    this.dialog = document.querySelector('#firebase-app-main-page');

    this.initCanvas();
    this.splitLayout();
    this.initUI();
    this.registerFirebaseModels();
  }
  initUI() {}
  registerFirebaseModels() {
    this.canvasFBRecordTypes.forEach(recType => {
      if (gAPPP.a.modelSets[recType])
        gAPPP.a.modelSets[recType].childListeners.push(
          (values, type, fireData) => this._updateContextWithDataChange(recType, values, type, fireData));
    });
    if (gAPPP.a.modelSets['userProfile'])
      gAPPP.a.modelSets['userProfile'].childListeners.push(
        (values, type, fireData) => this.profileUpdate(values, type, fireData));
  }
  initCanvas() {
    let canvasTemplate = this._canvasPanelTemplate();
    this.canvasWrapper = this.dialog.querySelector('.form_canvas_wrapper');
    this.canvasWrapper.innerHTML = canvasTemplate;

    this.canvas = this.dialog.querySelector('.popup-canvas');
    this.context = new wContext(this.canvas, this.geoOptions);
    this.canvasActions = this.dialog.querySelector('.canvas-actions');
    this.canvasActions.style.display = '';
    this.loadedSceneURL = '';

    this.canvasHelper = new cPanelCanvas(this);
    this.context.canvasHelper = this.canvasHelper;
    this.canvasHelper.hide();
    this.canvasHelper.saveAnimState = true;
    this.canvasHelper.cameraShownCallback = () => this.canvasReady();
  }
  async canvasReady() {
    if (!this.playAnimation)
      return Promise.resolve();
    await this.canvasReadyPostTimeout();

    return Promise.resolve();
  }
  async canvasReadyPostTimeout() {
    this.canvasHelper.noTestError = true;

    try {
      this.canvasHelper.playAnimation();
      setTimeout(() => this.canvasHelper.cameraChangeHandler(), 100);
    } catch (e) {
      console.log('play anim error', e);
    }

    return Promise.resolve();
  }
  _canvasPanelTemplate() {
    return `<canvas class="popup-canvas"></canvas>
  <div class="video-overlay"><video></video></div>
  <div class="help-overlay"></div>
  <div class="canvas-actions">
    <button class="btn-sb-icon scene-options"><i class="material-icons">settings_brightness</i></button>
    <div class="scene-options-panel app-panel" style="display:none;">
      <div class="scene-fields-container"></div>
      <div class="render-log-wrapper" style="display:none;">
        <button class="btn-sb-icon log-clear"><i class="material-icons">clear_all</i></button>
        <textarea class="render-log-panel" spellcheck="false"></textarea>
        <div class="fields-container" style="display:none;"></div>
      </div>
      <br>
      <button class="btn-sb-icon stop-button"><i class="material-icons">stop</i></button>
      <button class="btn-sb-icon video-button"><i class="material-icons">fiber_manual_record</i></button>
      <button class="btn-sb-icon download-button"><i class="material-icons">file_download</i></button>
      <button class="btn-sb-icon show-hide-log"><i class="material-icons">info_outline</i></button>
    </div>
    <div class="canvas-play-bar">
      <button class="btn-sb-icon play-button"><i class="material-icons">play_arrow</i></button>
      <button class="btn-sb-icon pause-button"><i class="material-icons">pause</i></button>
      <div class="run-length-label"></div>
      <input class="animate-range" type="range" step="any" value="0" min="0" max="100" />

      <div class="lightbar-fields-container"></div>
      <div class="camera-options-panel">
        <select class="camera-select"></select>
        <div>
          <div class="camera-slider-label"><i class="material-icons" style="transform:rotate(90deg)">straighten</i></div>
          <input class="camera-select-range-height-slider" type="range" step=".25" min="-15" max="40" />
        </div>
        <div>
          <div class="camera-slider-label">FOV</div>
          <input class="camera-select-range-fov-slider" type="range" step=".01" min="-1" max="2.5" value=".8" />
        </div>
        <div>
          <div class="camera-slider-label"><i class="material-icons">straighten</i></div>
          <input class="camera-select-range-slider" type="range" step="any" min="1" max="300" />
        </div>
        <div class="fields-container"></div>
        <div id="extra-options-camera-area"></div>
      </div>
    </div>
  </div>
  <button class="none-layout-mode-flip btn-sb-icon" style="display:none;"><i class="material-icons">code</i></button>`;
  }
  __loadBlock(profileKey, blockData) {
    this.canvasHelper.logClear();
    let startTime = Date.now();

    let b = new wBlock(this.context);
    //document.title = blockData.title;
    b.staticType = 'block';
    b.staticLoad = true;
    b.blockKey = profileKey;
    b.isContainer = true;
    this.context.setActiveBlock(b);
    this.scene = this.context.scene;
    this.rootBlock = b;
    this.canvasHelper.__updateVideoCallback();
    this.key = profileKey;
    this.rootBlock.setData(blockData);
    setTimeout(() => {
      this.canvasHelper.show();
      this._updateContextWithDataChange();
      gAPPP.activeContext.activeBlock.setData();
      this.profileUpdate();
      this.context.scene.switchActiveCamera(this.context.camera, this.context.canvas);
    }, 50);

    this.canvasHelper.logMessage('load: ' + (Date.now() - startTime).toString() + 'ms');
    this.canvasHelper.reportEngineDetails();
  }
  show(scene) {
    this.context.activate(scene);
    if (this.canvasHelper) {
      this.canvasHelper.show();
    }
  }
  __updateSceneBlockBand(profileKey) {}
  _updateSelectedBlock(profileKey) {
    if (gAPPP.activeContext !== this.context)
      return;

    if (!profileKey) {
      this.key = '';
      this.canvasHelper.show();
      return;
    }

    if (this.key !== profileKey) {
      this.show(null);
      this.canvasHelper.hide();
      let blockData = gAPPP.a.modelSets['block'].getCache(profileKey);
      if (blockData) {
        this.__updateSceneBlockBand(profileKey);

        if (blockData.url)
          this.context.loadSceneURL(blockData.url).then(result => {
            this.__loadBlock(profileKey, blockData);
          });
        else
          this.__loadBlock(profileKey, blockData);
      } else {
        this.key = '';
        this.canvasHelper.show();
      }
    }
  }
  profileUpdate(values, type, fireData) {
    gAPPP._updateApplicationStyle();
    if (!this.rootBlock)
      return;

    if (this.canvasHelper)
      this.canvasHelper.userProfileChange();
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.rootBlock)
      this.rootBlock.handleDataUpdate(tag, values, type, fireData);
    this.canvasHelper.testError();
  }
  closeHeaderBands() {}
  async refreshProjectList() {
    let projectListData = await firebase.database().ref('projectTitles').once('value');
    let projectList = projectListData.val();

    this.updateProjectList(projectList, gAPPP.loadedWID);
    return Promise.resolve();
  }
  updateProjectList(rawRecordList, selectedWorkspace = null) {
    this.projectList = rawRecordList;
    if (!this.workplacesSelect)
      return;

    let html = '';
    let records = {};

    if (gAPPP.filterActiveWorkspaces) {
      for (let i in rawRecordList) {
        let r = rawRecordList[i];
        let tagList = (r.tags) ? r.tags.split(',') : [];
        if (tagList.indexOf('active') !== -1)
          records[i] = r;
      }
    } else {
      records = rawRecordList;
    }


    let orderedRecords = [];
    for (let i in records) {
      records[i].id = i;
      orderedRecords.push(records[i]);
    }
    orderedRecords.sort((a, b) => {
      if (a.title > b.title) return -1;
      if (a.title < b.title) return 1;

      return 0;
    });

    for (let c = 0, l = orderedRecords.length; c < l; c++) {
      let code = '';
      if (orderedRecords[c].tags)
        code = orderedRecords[c].tags;
      let o = `<option value="${orderedRecords[c].id}">${orderedRecords[c].title}</option>`;

      if (orderedRecords[c].id === 'default')
        html += o;
      else
        html = o + html;
    }
    let val = selectedWorkspace;
    if (val === null)
      val = this.workplacesSelect.value;
    this.workplacesSelect.innerHTML = html;
    this.workplacesSelect.value = val;

    if (!records || !records[val])
      return;
    gAPPP.lastWorkspaceName = records[val].title;
    gAPPP.lastWorkspaceCode = records[val].tags;

    if (this.workplacesSelectEditName) {
      this.workplacesSelectEditName.value = records[val].title;
      let code = '';
      if (records[val].tags)
        code = records[val].tags;
      this.workplacesSelectEditCode.value = code;
      gAPPP.workspaceCode = code;
    }

    if (this.workplacesSelect.selectedIndex === -1) {
      this.workplacesSelect.selectedIndex = 0;
      this.selectProject();
    }
  }
  _updateQueryString(newWid) {
    let queryString = `?wid=${newWid}`;

    let url = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;

    if (url !== this.url) {
      window.history.pushState({
        path: url
      }, '', url);
      this.url = url;
    }

    return;
  }
  async selectProject() {
    this._updateQueryString(gAPPP.mV.workplacesSelect.value);
    await gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'selectedWorkspace',
      newValue: gAPPP.mV.workplacesSelect.value
    }]);

    setTimeout(() => location.reload(), 1);

    return;
  }
  async _addProject(newTitle, key = false, reload = true, tags) {
    let csvImport = new gCSVImport();
    key = await csvImport.addProject(newTitle, key, tags);

    if (reload) {
      this._updateQueryString(key);
      await gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'selectedWorkspace',
        newValue: key
      }]);
      setTimeout(() => location.reload(), 100);
    }

    return key;
  }
  splitLayout() {
    this.mainViewWrapper = this.dialog.querySelector('#main-view-wrapper');
    if (['Left', 'Right', 'Top', 'Bottom'].indexOf(this.layoutMode) !== -1) {
      this.form_panel_view_dom = document.querySelector('.form_panel_view_dom');
      this.form_canvas_wrapper = document.querySelector('.form_canvas_wrapper');

      let l = this.form_canvas_wrapper;
      let r = this.form_panel_view_dom;
      if (this.layoutMode === 'Right' || this.layoutMode === 'Bottom') {
        l = this.form_panel_view_dom;
        r = this.form_canvas_wrapper;
        l.parentNode.insertBefore(l, r);
      }

      let splitOrientation = 'horizontal';
      if (this.layoutMode === 'Top' || this.layoutMode === 'Bottom') {
        splitOrientation = 'vertical';
        this.dialog.style.display = 'block';
      } else {
        this.form_panel_view_dom.parentNode.style.display = 'flex';
        this.dialog.style.display = 'flex';
      }
      this.splitInstance = window.Split([l, r], {
        sizes: [40, 60],
        gutterSize: 20,
        direction: splitOrientation,
        onDragEnd: () => gAPPP.resize(),
        onDrag: () => gAPPP.resize()
      });
    } else if (['Edit', 'View'].indexOf(this.layoutMode) !== -1) {
      this.form_panel_view_dom = document.querySelector('.form_panel_view_dom');
      this.form_canvas_wrapper = document.querySelector('.form_canvas_wrapper');
      this.dialog.style.display = 'block';
      this.codeModeFromView = this.dialog.querySelector('.none-layout-mode-flip');
      this.codeModeFromView.style.display = 'inline-block';
      this.codeModeFromView.addEventListener('click', e => {
        gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'formLayoutMode',
          newValue: 'Top'
        }]).then(() => {
          setTimeout(() => location.reload(), 1);
        })
      });
      if (this.layoutMode === 'Edit') {
        this.form_canvas_wrapper.style.display = 'none';
        this.mainViewWrapper.style.display = 'flex';
      }

      if (this.layoutMode === 'View') {
        this.form_panel_view_dom.style.display = 'none';
      }
    } else if (this.layoutMode === 'Demo') {
      this.dialog.style.display = 'block';
    }
    if (!this.layoutMode)
      this.layoutMode = '';
    this.dialog.classList.add('bview-layoutmode-' + this.layoutMode.toLowerCase());
  }
  layoutTemplate() {
    if (['Left', 'Right', 'Top', 'Bottom', 'View', 'Edit'].indexOf(this.layoutMode) !== -1)
      return this.splitLayoutTemplate();

    return `<div id="firebase-app-main-page" style="display:none;">
  <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
  <div id="main-view-wrapper">
    <div class="form_canvas_wrapper"></div>
  </div>
</div>`;
  }
  splitLayoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;flex-direction:column;">
    <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
      <div id="main-view-wrapper">
        <div class="form_canvas_wrapper"></div>
        <div class="form_panel_view_dom">
          <div class="fields-container"></div>
        </div>
      </div>
    </div>`;
  }
  _headerTemplate() {}
  expandAll() {
    if (this.fireFields)
      this.fireFields.helpers.expandAll();
    this.detailsShown = true;

    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'applicationDetailsShown',
      newValue: this.detailsShown
    }]);
  }
  collapseAll() {
    if (this.fireFields)
      this.fireFields.helpers.collapseAll();
    this.detailsShown = false;

    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'applicationDetailsShown',
      newValue: this.detailsShown
    }]);
  }
  deleteProject() {
    if (this.workplacesSelect.value === 'default') {
      alert('Please select a workspace to delete other then default');
      return;
    }
    if (confirm(`Are you sure you want to delete the project: ${this.workplacesSelect.selectedOptions[0].innerText}?`))
      if (confirm('Really?  Really sure?  this won\'t come back...')) {
        gAPPP.a.modelSets['projectTitles'].removeByKey(this.workplacesSelect.value);
        this.workplacesSelect.selectedIndex = 0;
        this.selectProject();
      }
  }
  profilePanelTemplate() {
    return `<div id="record_field_list">
      <form autocomplete="off" onsubmit="return false;"></form>
    </div>
    <button id="sign-out-button" style="float:right;"><i class="material-icons">account_box</i> Sign out </button>
    <button id="user-profile-dialog-reset-button" style="float:right;"><i class="material-icons">account_circle</i> Reset Profile </button>
    <select id="view_layout_select" style="float:right;">
      <option>View</option>
      <option>Top</option>
      <option>Left</option>
      <option>Bottom</option>
      <option>Right</option>
      <option>Edit</option>
    </select>
    <div class="fields-container" style="float:right;clear:right;"></div>
    <div style="clear:both;display:inline-block;float:right;">
      <img src='' class="user-profile-image" />
      <div class="user-profile-info"></div>
    </div>`;
  }
  openNewWindow(tag, key, wid = null) {
    let url = this.genQueryString(wid, tag, key);
    let a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('target', '_blank');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  async showLayoutPositions() {
    this.positionFrags = this.layoutPositionFrags();
    if (this.layoutPositionsShown) {
      this.layoutPositionsShown = false;
      this.workspace_show_layout_positions.innerHTML = '<i class="material-icons">grid_on</i>';

      this.canvasHelper.cameraSelect.selectedIndex = 2;
      this.canvasHelper.noTestError = true;
      this.canvasHelper.cameraChangeHandler();

      for (let positionCounter = 0; positionCounter < this.positionFrags.length; positionCounter++) {
        gAPPP.activeContext.setGhostBlock('layoutPositions' + positionCounter.toString(), null);
      }
    } else {
      this.layoutPositionsShown = true;
      this.workspace_show_layout_positions.innerHTML = '<i class="material-icons">grid_off</i>';

      this.canvasHelper.cameraSelect.selectedIndex = 0;
      this.canvasHelper.noTestError = true;
      this.canvasHelper.cameraChangeHandler();

      for (let positionCounter = 0; positionCounter < this.positionFrags.length; positionCounter++) {
        let block = new wBlock(gAPPP.activeContext, null);
        let p = new Promise((resolve) => {
          setTimeout(() => resolve(), 1);
        });
        await p;


        block.__createTextMesh('layoutPositions' + positionCounter.toString() + 'SceneObject', {
          text: (positionCounter + 1).toString(),
          depth: .2,
          size: 100,
          stroke: false,
          fontFamily: 'Courier',
          fontStyle: undefined,
          fontWeight: undefined
        });

        let positionParts = this.positionFrags[positionCounter].split(',');
        block.sceneObject.position.x = GLOBALUTIL.getNumberOrDefault(positionParts[0], 0);
        block.sceneObject.position.y = GLOBALUTIL.getNumberOrDefault(positionParts[1], 0);
        block.sceneObject.position.z = GLOBALUTIL.getNumberOrDefault(positionParts[2], 0);

        let rx = positionParts[3];
        let ry = positionParts[4];
        let rz = positionParts[5];
        rx = GLOBALUTIL.angleDeg(rx, 0);
        ry = GLOBALUTIL.angleDeg(ry, 0);
        rz = GLOBALUTIL.angleDeg(rz, 0);

        block.sceneObject.rotation.z = Math.PI / 2 - rz;
        block.sceneObject.rotation.y = ry;
        block.sceneObject.rotation.x = Math.PI + rx;

        block.sceneObject.scaling.x = 2;
        block.sceneObject.scaling.y = 1;
        block.sceneObject.scaling.z = 5;

        let material = new BABYLON.StandardMaterial(`layoutPositions${positionCounter}SceneMaterial`, gAPPP.activeContext.scene);

        let rgb = positionCounter % 3;
        if (rgb === 1)
          material.diffuseColor = new BABYLON.Color3(2, 0, 0);
        else if (rgb === 2)
          material.diffuseColor = new BABYLON.Color3(0, 2, 0);
        else
          material.diffuseColor = new BABYLON.Color3(0, 0, 2);


        gAPPP.activeContext.__setMaterialOnObj(block.sceneObject, material);
        gAPPP.activeContext.setGhostBlock('layoutPositions' + positionCounter.toString(), block);
      }
    }
  }
  layoutPositionFrags() {
    let positionInfo = gAPPP.a.modelSets['block'].getValuesByFieldLookup('blockFlag', 'displaypositions');
    let positionFrags = [];
    if (positionInfo && positionInfo.genericBlockData) {
      let arr = positionInfo.genericBlockData.split('|');

      for (let c = 0, l = arr.length; c < l - 5; c += 6) {
        let frag = arr[c] + ',' + arr[c + 1] + ',' + arr[c + 2] + ',' + arr[c + 3] + ',' + arr[c + 4] + ',' + arr[c + 5];
        positionFrags.push(frag);
      }
    }
    return positionFrags;
  }
  updateDocTitle() {
    if (this.rootBlock.blockRawData && this.rootBlock.blockRawData.title) {
      document.title = this.rootBlock.blockRawData.title;
    }

  }
}
