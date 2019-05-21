class bView {
  constructor(layoutMode, tag, key = null, play = false, childKey, subview) {
    this.playAnimation = play;
    this.expandedAll = true;
    this.tag = tag;
    this.key = key;
    this.childKey = childKey;
    this.layoutMode = layoutMode;
    this.subView = subview;
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
        <div>
          <div class="camera-slider-label">FOV</div>
          <input class="camera-select-range-fov-slider" type="range" step=".01" min="-1" max="2.5" value=".8" />
        </div>
        <div>
          <div class="camera-slider-label"><i class="material-icons" style="transform:rotate(90deg)">straighten</i></div>
          <input class="camera-select-range-height-slider" type="range" step=".25" min="-15" max="40" />
        </div>
        <br>
        <select class="camera-select"></select>
        <div>
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
    gAPPP.lastWorkspaceCode = records[val].code;

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
  async selectProject() {
    this._updateQueryString(gAPPP.mV.workplacesSelect.value);
    await gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'selectedWorkspace',
        newValue: gAPPP.mV.workplacesSelect.value
      }]);

    setTimeout(() => location.reload(), 1);

    return;
  }
  async _addProject(newTitle, key = false, reload = true, newCode) {
    if (!key)
      key = gAPPP.a.modelSets['projectTitles'].getKey();
    if (!newCode)
      newCode = newTitle;
    await firebase.database().ref('projectTitles/' + key).set({
      title: newTitle,
      code: newCode
    });
    await firebase.database().ref('project/' + key).set({
      title: newTitle
    });

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
  profilePanelRegister() {
    this.signOutBtn = document.querySelector('#sign-out-button');
    if (this.signOutBtn)
      this.signOutBtn.addEventListener('click', e => gAPPP.a.signOut(), false);

    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());

    this.dialog.querySelector('#user-profile-dialog-reset-button').addEventListener('click', e => gAPPP.a.resetProfile());

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
      this.profile_description_panel_btn.classList.remove('app-inverted');
      this.form_panel_view_dom.classList.remove('header-expanded');
    } else {
      this.profilePanelShown = true;
      this.profile_description_panel_btn.classList.add('app-inverted');
      this.form_panel_view_dom.classList.add('header-expanded');
    }
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
  __uploadImageFile() {
    let fileBlob = this.uploadImageFile.files[0];

    if (!fileBlob)
      return;

    this.uploadImageEditField.parentElement.MaterialTextfield.change('Uploading...');

    let fireSet = gAPPP.a.modelSets['block'];
    let key = this.productData.sceneId + '/productfiles';
    fireSet.setBlob(key, fileBlob, fileBlob.name).then(uploadResult => {
      this.uploadImageEditField.parentElement.MaterialTextfield.change(uploadResult.downloadURL);
    });
  }
  async FromLayoutremoveWorkspace() {
    let sel = this.remove_workspace_select_template;
    if (sel.selectedIndex === 0)
      return;
    if (confirm(`Delete animation ${sel.options[sel.selectedIndex].text}?`)) {
      let changeWorkspace = (sel.value === gAPPP.a.profile.selectedWorkspace);

      let removeResult = await new gCSVImport().dbRemove('project', sel.value);
      if (!changeWorkspace) this.loadTemplateLists();

      if (changeWorkspace) {
        let newIndex = 1;
        let newId = 'none';
        if (sel.options.length > 2) {
          if (sel.selectedIndex === 1)
            newIndex = 2;
          newId = sel.options[newIndex].value;
        }

        await gAPPP.a.modelSets['userProfile'].commitUpdateList([{
          field: 'selectedWorkspace',
          newValue: newId
        }]);

        setTimeout(() => location.reload(), 1);
      }
    }
    return Promise.resolve();
  }
}
