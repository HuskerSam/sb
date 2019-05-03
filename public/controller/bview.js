class bView {
  constructor(layoutMode, tag, key = null, play = false, childKey) {
    this.dialogs = {};
    this.playAnimation = play;
    this.expandedAll = true;
    this.tag = tag;
    this.key = key;
    this.childKey = childKey;
    this.layoutMode = layoutMode;
    this.canvasFBRecordTypes = ['blockchild', 'block', 'mesh', 'shape', 'material', 'texture', 'frame'];
    this.initDom();

    this.dialog.context = this.context;
    this.show(null);
  }
  async _updateGoogleFonts() {
    let editInfoBlocks = gAPPP.a.modelSets['block'].queryCache('blockFlag', 'googlefont');
    for (let id in editInfoBlocks) {
      let fontName = editInfoBlocks[id].genericBlockData;
      let newLink = document.createElement('link');
      fontName = fontName.replace(/ /g, '+');

      if (!this.fontsAdded[fontName]) {
        this.fontsAdded[fontName] = true;
        newLink.setAttribute('href', `https://fonts.googleapis.com/css?family=${fontName}`);
        newLink.setAttribute('rel', 'stylesheet');
        document.head.append(newLink);
      }
    }

    return Promise.resolve();
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
    this.initDataUI();
    this.registerFirebaseModels();
  }
  initDataUI() {}
  registerFirebaseModels() {
    this.canvasFBRecordTypes.forEach(recType => gAPPP.a.modelSets[recType].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange(recType, values, type, fireData)));
    gAPPP.a.modelSets['userProfile'].childListeners.push(
      (values, type, fireData) => this.profileUpdate(values, type, fireData));
  }
  initCanvas() {
    let canvasTemplate = this._canvasPanelTemplate();
    this.canvasWrapper = this.dialog.querySelector('.form_canvas_wrapper');
    this.canvasWrapper.innerHTML = canvasTemplate;

    this.canvas = this.dialog.querySelector('.popup-canvas');
    this.context = new wContext(this.canvas);
    this.canvasActions = this.dialog.querySelector('.canvas-actions');
    this.canvasActions.style.display = '';
    this.loadedSceneURL = '';
    this.lastNoBump = gAPPP.a.profile.noBumpMaps;

    this.canvasHelper = new cPanelCanvas(this);
    this.context.canvasHelper = this.canvasHelper;
    this.canvasHelper.hide();
    this.canvasHelper.saveAnimState = true;
    this.canvasHelper.cameraShownCallback = () => this.canvasReady();
  }
  async canvasReady() {
    if (this.cameraShown)
      return;
    this.cameraShown = true;

    if (!this.playAnimation)
      return Promise.resolve();
    await this.canvasReadyPostTimeout();

    return Promise.resolve();
  }
  async canvasReadyPostTimeout() {
    this.canvasHelper.noTestError = true;
    this.canvasHelper.cameraChangeHandler();

    try {
      this.canvasHelper.playAnimation();
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
    <div class="canvas-play-bar">
      <div class="scene-options-panel" style="display:none;">
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
      <br>
      <button class="btn-sb-icon scene-options" style="clear:both;"><i class="material-icons">settings_brightness</i></button>
      <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary play-button"><i class="material-icons">play_arrow</i></button>
      <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--colored pause-button"><i class="material-icons">pause</i></button>
      <div class="run-length-label"></div>
      <input class="animate-range" type="range" step="any" value="0" min="0" max="100" />

      <div class="lightbar-fields-container"></div>
      <div class="camera-options-panel" style="display:inline-block;">
        <select class="camera-select" style=""></select>
        <div id="fov-camera-bar">
          <div class="camera-slider-label">FOV</div>
          <input class="camera-select-range-fov-slider" type="range" step=".01" min="-1" max="2.5" value=".8" />
        </div>
        <div style="display:inline-block;">
          <div class="camera-slider-label"><i class="material-icons" style="transform:rotate(90deg)">straighten</i></div>
          <input class="camera-select-range-height-slider" type="range" step=".25" min="-15" max="40" />
        </div>
        <br>
        <div style="display:inline-block;">
          <div class="camera-slider-label"><i class="material-icons">straighten</i></div>
          <input class="camera-select-range-slider" type="range" step="any" min="1" max="300" />
        </div>
        <div class="fields-container" style="float:left"></div>
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
    if (!this.rootBlock)
      return;
    if (this.lastNoBump !== gAPPP.a.profile.noBumpMaps) {
      this.lastNoBump = gAPPP.a.profile.noBumpMaps;
      this.rootBlock.setData();
    }

    if (this.canvasHelper)
      this.canvasHelper.userProfileChange();
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (!tag)
      return;
    if (this.rootBlock)
      this.rootBlock.handleDataUpdate(tag, values, type, fireData);
    this.canvasHelper.testError();
  }
  closeHeaderBands() {}
  async refreshProjectList() {
    let projectListData = await firebase.database().ref('projectTitles').once('value');
    let projectList = projectListData.val();

    this.updateProjectList(projectList, gAPPP.a.profile.selectedWorkspace);
    return Promise.resolve();
  }
  updateProjectList(records, selectedWorkspace = null) {
    if (!this.workplacesSelect)
      return;

    let html = '';

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
      if (orderedRecords[c].code)
        code = orderedRecords[c].code;
      let o = `<option value=${orderedRecords[c].id}>${orderedRecords[c].title}</option>`;

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

    if (this.workplacesSelectEditName) {
      this.workplacesSelectEditName.value = records[val].title;
      let code = '';
      if (records[val].code)
        code = records[val].code;
      this.workplacesSelectEditCode.value = code;
      gAPPP.workspaceCode = code;
    }

    if (this.workplacesSelect.selectedIndex === -1) {
      this.workplacesSelect.selectedIndex = 0;
      this.selectProject();
    }
  }
  _updateQueryString(wId) {}
  selectProject() {
    this._updateQueryString(gAPPP.mV.workplacesSelect.value);
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'selectedWorkspace',
        newValue: gAPPP.mV.workplacesSelect.value
      }])
      .then(() => {
        setTimeout(() => location.reload(), 1);
      })
      .catch(e => {
        console.log(e);
      });
  }
  async _addProject(newTitle, newCode, key, reload = true) {
    if (!key)
      key = gAPPP.a.modelSets['projectTitles'].getKey();
    await firebase.database().ref('projectTitles/' + key).set({
      title: newTitle,
      code: newCode
    });
    await firebase.database().ref('project/' + key).set({
      title: newTitle
    });

    if (reload) {
      this._updateQueryString(gAPPP.mV.workplacesSelect.value);
      await gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'selectedWorkspace',
        newValue: key
      }]);
      setTimeout(() => location.reload(), 100);
    }
  }
  splitLayout() {
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
    }
    if (['None', 'Full'].indexOf(this.layoutMode) !== -1) {
      this.form_panel_view_dom = document.querySelector('.form_panel_view_dom');
      this.form_canvas_wrapper = document.querySelector('.form_canvas_wrapper');
      this.dialog.style.display = 'block';
      this.codeModeFromFull = this.dialog.querySelector('.none-layout-mode-flip');
      this.codeModeFromFull.style.display = 'inline-block';
      this.codeModeFromFull.addEventListener('click', e => {
        gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'formLayoutMode',
          newValue: 'Top'
        }]).then(() => {
          setTimeout(() => location.reload(), 1);
        })
      });
      if (this.layoutMode === 'None') {
        this.form_canvas_wrapper.style.display = 'none';
        this.dialog.querySelector('#main-view-wrapper').style.display = 'flex';
      }

      if (this.layoutMode === 'Full') {
        this.form_panel_view_dom.style.display = 'none';
      }
    }
    if (!this.layoutMode)
      this.layoutMode = '';
    this.dialog.classList.add('bview-layoutmode-' + this.layoutMode.toLowerCase());
  }
  layoutTemplate() {
    if (['Left', 'Right', 'Top', 'Bottom', 'Full', 'None'].indexOf(this.layoutMode) !== -1)
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
    this.fireFields.helpers.expandAll();
    this.detailsShown = true;
  }
  collapseAll() {
    this.fireFields.helpers.collapseAll();
    this.detailsShown = false;
  }
  addProject() {
    let newTitle = this.addProjectName.value.trim();
    if (newTitle.length === 0) {
      alert('need a name for workspace');
      return;
    }
    let newCode = this.addProjectCode.value.trim();

    this._addProject(newTitle, newCode);
  }
  deleteProject() {
    if (this.workplacesSelect.value === 'default') {
      alert('Please select a workspace to delete other then default');
      return;
    }
    if (confirm(`Are you sure you want to delete the project: ${this.workplacesSelect.selectedOptions[0].innerText}?`))
      if (confirm('Really?  Really sure?  this won\'t come back...')) {
        gAPPP.a.modelSets['projectTitles'].removeByKey(this.workplacesSelect.value);
        gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'selectedWorkspace',
          newValue: 'default'
        }]);
      }
  }
  profilePanelTemplate() {
    return `<div id="record_field_list">
      <form autocomplete="off" onsubmit="return false;"></form>
    </div>
    <label><span>Name </span><input id="edit-workspace-name" /></label>
    <label><span> Z Code </span><input id="edit-workspace-code" style="width:5em;" />
    <button id="remove-workspace-button" class="btn-sb-icon"><i class="material-icons">delete</i></button>
    </label>
    <br>
    <label><span>New Workspace </span><input id="new-workspace-name" /></label><label><span> Z Code </span><input id="new-workspace-code" style="width:5em;" /></label>
    <button id="add-workspace-button" class="btn-sb-icon" style="font-size:1.2em;"><i class="material-icons">add</i></button>
    </label>
    <div class="user-info"></div>
    <button id="user-profile-dialog-reset-button" style="font-size:1.1em;" class="btn-sb-icon"><i class="material-icons">account_circle</i> Reset Profile </button>
    <button id="sign-out-button" style="font-size:1.1em;" class="btn-sb-icon"><i class="material-icons">account_box</i> Sign out </button>
    <div class="fields-container" style="clear:both;"></div>`;
  }
  profilePanelRegister() {
    this.signOutBtn = document.querySelector('#sign-out-button');
    if (this.signOutBtn)
      this.signOutBtn.addEventListener('click', e => gAPPP.a.signOut(), false);

    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelectEditName = document.querySelector('#edit-workspace-name');
    this.workplacesSelectEditCode = document.querySelector('#edit-workspace-code');
    this.workplacesRemoveButton = document.querySelector('#remove-workspace-button');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());
    this.workplacesSelectEditName.addEventListener('input', e => this.updateWorkspaceNameCode());
    this.workplacesSelectEditCode.addEventListener('input', e => this.updateWorkspaceNameCode());
    this.addProjectButton = document.querySelector('#add-workspace-button');
    this.addProjectButton.addEventListener('click', e => this.addProject());
    this.addProjectName = document.querySelector('#new-workspace-name');
    this.addProjectCode = document.querySelector('#new-workspace-code');
    this.workplacesRemoveButton.addEventListener('click', e => this.deleteProject());
    this.dialog.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e => gAPPP.a.resetProfile());

    this.userProfileName = this.dialog.querySelector('.user-info');
    this.fontToolsContainer = this.dialog.querySelector('#profile-header-panel');
    this.fontFields = sDataDefinition.bindingFieldsCloned('fontFamilyProfile');
    this.fontFieldsContainer = this.fontToolsContainer.querySelector('.fields-container');
    this.fontTools = new cBandProfileOptions(null, this.fontFields, this.fontFieldsContainer, this.fontFieldsContainer);
    this.fontTools.fireFields.values = gAPPP.a.profile;
    this.fontTools.activate();

    this.profile_description_panel_btn = document.getElementById('profile_description_panel_btn');
    this.profile_description_panel_btn.addEventListener('click', e => this.profilePanelToggle());
  }
  profilePanelToggle() {
    if (this.profilePanelShown) {
      this.profilePanelShown = false;
      this.profile_description_panel_btn.classList.remove('button-expanded');
      document.getElementById('profile-header-panel').classList.remove('expanded');
    } else {
      this.profilePanelShown = true;
      this.profile_description_panel_btn.classList.add('button-expanded');
      document.getElementById('profile-header-panel').classList.add('expanded');
    }
  }
  updateWorkspaceNameCode() {
    let name = this.workplacesSelectEditName.value.trim();
    let code = this.workplacesSelectEditCode.value.trim();

    if (name.length < 1)
      return;

    gAPPP.a.modelSets['projectTitles'].commitUpdateList([{
      field: 'title',
      newValue: name
    }, {
      field: 'code',
      newValue: code
    }], this.workplacesSelect.value);
  }
}
