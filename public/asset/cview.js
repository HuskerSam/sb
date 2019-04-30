class cView extends bView {
  constructor(layoutMode, tag, key) {
    super(layoutMode, tag, key);
    this.canvasHelper.initExtraOptions();

    document.querySelector('.user-name').innerHTML = gAPPP.a.currentUser.email;

    this.refreshProjectList().then(() => {});
    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());

    this.profile_description_panel_btn = document.getElementById('profile_description_panel_btn');
    this.profile_description_panel_btn.addEventListener('click', e => this.toggleProfilePanel());
  }
  toggleProfilePanel() {
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
  _canvasPanelTemplate() {
    return `<canvas class="popup-canvas"></canvas>
  <div class="video-overlay">
    <video></video>
  </div>
  <div class="canvas-actions">
    <div class="canvas-play-bar">
      <div class="scene-options-panel" style="display:none;">
        <div class="scene-fields-container">
        </div>
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
  </div>`;
  }
  _headerTemplate() {
    return `<div id="profile-header-panel">
  <select id="profile_current_role">
    <option>Employee</option>
    <option>Contractor</option>
    <option>Manager</option>
    <option>Owner</option>
    <option>Administrator</option>
  </select>
  &nbsp;
  <span class="user-name"></span>
  &nbsp;
  <button id="sign-out-button" style="font-size:1.1em;" class="btn-sb-icon"><i class="material-icons">account_box</i> Sign out </button>
</div>
<button id="profile_description_panel_btn" style="float:right;" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">person</i></button>
<select id="view_layout_select" style="float:right;">
  <option>Full</option>
  <option>Top</option>
  <option>Left</option>
  <option>Bottom</option>
  <option>Right</option>
  <option>None</option>
</select>
<div id="record_field_list">
  <form autocomplete="off" onsubmit="return false;"></form>
</div>`;
  }
  initHeader() {
    let div = document.createElement('div');
    div.classList.add('header-wrapper');
    div.innerHTML = this._headerTemplate();

    this.canvasWrapper.insertBefore(div, this.canvasWrapper.firstChild);
    this.signOutBtn = document.querySelector('#sign-out-button');
    if (this.signOutBtn)
      this.signOutBtn.addEventListener('click', e => gAPPP.a.signOut(), false);

    this.view_layout_select = document.getElementById('view_layout_select');
    this.view_layout_select.addEventListener('change', e => {
      this.layoutMode = this.view_layout_select.value;
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'formLayoutMode',
        newValue: this.layoutMode
      }]).then(() => {
        setTimeout(() => location.reload(), 1);
      })
    });
    this.layoutMode = gAPPP.a.profile.formLayoutMode;
    this.view_layout_select.value = this.layoutMode;
  }
  initDataFields() {
    if (this.fireSetCallback)
      this.fireSet.removeListener(this.fireSetCallback);
    this.fieldsContainer = this.dialog.querySelector('.fields-container');
    this.dataViewContainer = this.fieldsContainer;
    this.fieldsContainer.innerHTML = '';

    if (!this.tag)
      return;

    this.fields = sDataDefinition.bindingFieldsCloned(this.tag);
    this.fireSet = gAPPP.a.modelSets[this.tag];

    this.fireFields = new cPanelData(this.fields, this.fieldsContainer, this);
    this.fireFields.updateContextObject = true;

    this.fireSetCallback = (values, type, fireData) => this.fireFields._handleDataChange(values, type, fireData);
    this.fireSet.childListeners.push(this.fireSetCallback);

    if (this.tag === 'block'){
      this.initBlockDataFields();
    } else {
    }
  }
  initBlockDataFields() {
    let editPanel = document.createElement('div');
    editPanel.setAttribute('class', 'cblock-editor-wrapper');
    editPanel.innerHTML = this._cBlockEditorTemplate();
    this.fieldsContainer.parentNode.appendChild(editPanel);
    let fieldsPanel = editPanel.querySelector('.cblock-details-panel');
    editPanel.parentNode.insertBefore(editPanel, this.fieldsContainer);
    this.dataViewContainer = editPanel;

    this.editMainPanel = editPanel;
    this.childKey = null;

    this.rootElementDom = this.dataViewContainer.querySelector('.main-band-details-element');
    this.rootElementDom.addEventListener('click', e => this.childBand.setKey(null));
    this.childBandDom = this.dataViewContainer.querySelector('.main-band-flex-children');
    this.childEditPanel = this.dataViewContainer.querySelector('.cblock-child-details-panel');
    this.childBand = new cBandChildren(this.childBandDom, this, this.childEditPanel);

    this.framesPanel = this.dataViewContainer.querySelector('.frames-panel');
    this.framesPanelHeader = this.dataViewContainer.querySelector('.frames-header-fields-panel');
    this.framesBand = new cBandFrames(this.framesPanel, this, this.framesPanelHeader);
    this.sceneFields = sDataDefinition.bindingFieldsCloned('sceneFields');
    this.sceneFireFields = new cPanelData(this.sceneFields, this.framesPanelHeader, this);
    this.fireSet.childListeners.push((values, type, fireData) => this.sceneFireFields._handleDataChange(values, type, fireData));
    this.sceneFireFields.updateContextObject = false;
    this.fireFields.updateContextObject = false;
    let clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    this.framesPanelHeader.appendChild(clearDiv);
    this.blockShowHideBtn = this.editMainPanel.querySelector('.block-scene-details-button');
    this.blockShowHideBtn.addEventListener('click', () => this.showHideSceneDetails());

    this.addChildButton = this.dataViewContainer.querySelector('.main-band-add-child');
    this.addChildButton.addEventListener('click', e => this.addChild());

    this.exportFramesDetailsPanel = this.dialog.querySelector('.export-frames-details-panel');
    this.exportFramesButton = this.dialog.querySelector('.ie-frames-details');
    this.exportFramesButton.addEventListener('click', e => this.toggleFramesIEDisplay());
    this.iePanelShown = false;

    this.refreshExportButton = this.dialog.querySelector('.refresh-export-frames-button');
    this.refreshExportButton.addEventListener('click', e => this.refreshExportText());
    this.importButton = this.dialog.querySelector('.import-frames-button');
    this.importButton.addEventListener('click', e => this.importFramesFromText());
    this.dialog.querySelector('.canvas-actions .download-button').style.display = 'inline-block';
    this.ieTextArea = this.dialog.querySelector('.frames-textarea-export');
  }
  _cBlockEditorTemplate() {
    return `<div class="main-band-wrapper">
    <div class="main-band-first-row">
      <button class="main-band-details-element"></button>
      <button class="main-band-add-child btn-sb-icon"><i class="material-icons">add</i></button>
      <div class="main-band-flex-children"></div>
    </div>
    <div class="cblock-details-panel">
      <button class="block-scene-details-button btn-sb-icon"><i class="material-icons">dashboard</i></button>
      <a class="block-id-display-span" target="_blank">Publish Link</a>
    </div>
    <div class="cblock-child-details-panel"></div>
    <button class="btn-sb-icon ie-frames-details"><i class="material-icons">import_export</i></button>
    <div style="clear:both;"></div>
  </div>
  <div>
    <div class="export-frames-details-panel" style="display:none;">
      <div style="float:left;">
        <button class="btn-sb-icon refresh-export-frames-button">Refresh</button>
        &nbsp;
        <button class="btn-sb-icon import-frames-button">Import</button>
        &nbsp;
      </div>
      <textarea class="frames-textarea-export" rows="1" cols="6" style="float:left;flex:1;overflow:scroll;white-space:pre"></textarea>
      <div style="clear:both"></div>
    </div>
  </div>
  <div class="frames-panel">
    <div class="frames-header-fields-panel" style="display:none;">
    </div>
  </div>`;
  }
  initDataUI() {
    this.dataview_record_type = this.dialog.querySelector('#dataview_record_type');
    this.dataview_record_list = this.dialog.querySelector('#dataview_record_list');

    this.dataview_record_type.addEventListener('change', e => this.updateRecordList());
    this.dataview_record_list.addEventListener('change', e => this.updateSelectedRecord().then(() => {}));
  }
  updateRecordList() {
    this.tag = this.dataview_record_type.value;
    let options = '';
    let fS = gAPPP.a.modelSets[this.tag].fireDataValuesByKey;
    for (let i in fS)
      options += `<option value="${i}">${fS[i].title} (${i})</option>`;

    this.dataview_record_list.innerHTML = options;

    this.initDataFields();
    this.updateSelectedRecord().then(() => {});
  }
  async updateSelectedRecord() {
    if (this.dataview_record_list.selectedIndex === -1) {
      this.key = '';
    } else {
      this.key = this.dataview_record_list.value;
      this.fireFields.values = this.fireSet.fireDataByKey[this.key].val();
    }

    //load saved scene if exists
    if (this.tag === 'block') {
      if (this.fireFields.values.url)
        await this.context.loadSceneURL(this.fireFields.values.url);
    }
    let b = new wBlock(this.context);
    b.staticType = this.tag;
    b.staticLoad = true;

    if (this.tag === 'block' && this.key) {
      b.blockKey = this.key;
      b.isContainer = true;
    }

    this.context.activate(null);
    this.context.setActiveBlock(b);
    this.rootBlock = b;
    this.canvasHelper.__updateVideoCallback();
    b.setData(this.fireFields.values);

    let result = null;
    if (this.tag === 'mesh')
      result = await this.rootBlock.loadMesh();

    if (this.tag === 'block') {
      this.rootElementDom.innerHTML = this.rootBlock.getBlockDimDesc();
      this.dialog.querySelector('.block-id-display-span').setAttribute('href', this.rootBlock.publishURL);

      this.childBand.refreshUIFromCache();
      this.childBand.setKey(null);
    }

    this.rootBlock = this.context.activeBlock;
    if (this.canvasHelper)
      this.canvasHelper.logClear();

    this.fireFields.loadedURL = this.fireFields.values['url'];
    let sceneReloadRequired = this.fireFields.paint();
    this.fireFields.helpers.resetUI();
    this.fireFields.helpers.expandAll();
    /*
        if (this.sceneFireFields) {
          this.sceneFireFields.paint();
          this.sceneFireFields.helpers.resetUI();
        }
    */
    //  this._endLoad();
    //  this._showFocus();
    //  this.expandAll();

    this.context.scene.switchActiveCamera(this.context.camera, this.context.canvas);
  }
  splitLayoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;flex-direction:column;">
      <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
      <div id="main-view-wrapper">
        <div class="form_canvas_wrapper"></div>
        <div class="form_panel_view_dom">
        <select id="workspaces-select"></select>
        <select id="dataview_record_type">
          <option value="shape">Shape</option>
          <option value="mesh">Mesh</option>
          <option value="material">Material</option>
          <option value="texture">Texture</option>
          <option value="block">Block</option>
        </select>
        <select id="dataview_record_list"></select>
        <div class="fields-container"></div>
      </div>
    </div>
  </div>`;
  }
  show(scene) {
    this.context.activate(scene);
    this.canvasHelper.show();
  }
  async canvasReady() {
    return this.updateRecordList();
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.tag === 'block') {
      if (this.rootBlock) {
        this.rootBlock.handleDataUpdate(tag, values, type, fireData);
        this.rootElementDom.innerHTML = this.rootBlock.getBlockDimDesc();
        if (tag === 'blockchild')
          this._updateFollowTargetListOptions();
        if (tag === 'blockchild')
          this.rootBlock.updateCamera();
      }
    } else {
      super._updateContextWithDataChange(tag, values, type, fireData);
    }
  }
  setChildKey(key) {
    this.childKey = key;
    this.childEditPanel.style.display = 'none';
    this.fieldsContainer.style.display = 'none';

    if (this.childKey === null) {
      this.editMainPanel.classList.add('root-block-display');
      this.editMainPanel.classList.remove('child-block-display');
      this.rootElementDom.classList.add('selected');

      if (this.detailsShown)
        this.fieldsContainer.style.display = 'block';
      this.context.setActiveBlock(this.rootBlock);
    } else {
      this.editMainPanel.classList.remove('root-block-display');
      this.editMainPanel.classList.add('child-block-display');
      this.rootElementDom.classList.remove('selected');
      if (this.detailsShown)
        this.childEditPanel.style.display = 'block';

      let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
      if (block)
        this.context.setActiveBlock(block);
      else
        this.context.setActiveBlock(this.rootBlock);
    }

    this.framesBand.refreshUIFromCache();
  }
}
