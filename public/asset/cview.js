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
  __initHeader() {
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

    this.view_layout_select.value = this.layoutMode;
  }
  initDataFields() {
    if (this.fireSetCallback)
      this.fireSet.removeListener(this.fireSetCallback);
    this.dataViewContainer = this.form_panel_view_dom.querySelector('.data-view-container');
    this.fieldsContainer = document.createElement('div');
    this.fieldsContainer.classList.add('asset-field-container');
    this.dataViewContainer.innerHTML = '';
    this.dataViewContainer.appendChild(this.fieldsContainer);
    this.dataFieldsInited = false;

    if (!this.tag)
      return;
    if (!this.key)
      return;

    this.dataFieldsInited = true;

    this.fields = sDataDefinition.bindingFieldsCloned(this.tag);
    this.fireSet = gAPPP.a.modelSets[this.tag];

    this.fireFields = new cPanelData(this.fields, this.fieldsContainer, this);
    this.fireFields.updateContextObject = true;

    let clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    this.fieldsContainer.appendChild(clearDiv);

    this.fireSetCallback = (values, type, fireData) => this.fireFields._handleDataChange(values, type, fireData);
    this.fireSet.childListeners.push(this.fireSetCallback);

    if (this.tag === 'block') {
      this.initBlockDataFields();
    } else {

    }

  }
  initBlockDataFields() {
    let editPanel = document.createElement('div');
    editPanel.setAttribute('class', 'cblock-editor-wrapper');
    editPanel.innerHTML = this._cBlockEditorTemplate();
    this.dataViewContainer.appendChild(editPanel);
    window.componentHandler.upgradeAllRegistered();

    this.editMainPanel = editPanel;
    this.childKey = null;

    this.blockChildrenSelect = this.dataViewContainer.querySelector('.main-band-children-select');

    this.childEditPanel = this.dataViewContainer.querySelector('.cblock-child-details-panel');
    this.childBand = new cBandChildren(this.blockChildrenSelect, this, this.childEditPanel);

    this.framesPanel = this.dataViewContainer.querySelector('.frames-panel');
    this.framesBand = new cBandFrames(this.framesPanel, this);
    this.sceneFields = sDataDefinition.bindingFieldsCloned('sceneFields');
    this.sceneFieldsPanel = this.dataViewContainer.querySelector('.scene-fields-panel');
    this.sceneFireFields = new cPanelData(this.sceneFields, this.sceneFieldsPanel, this);
    this.fireSet.childListeners.push((values, type, fireData) => this.sceneFireFields._handleDataChange(values, type, fireData));
    this.sceneFireFields.updateContextObject = false;
    this.fireFields.updateContextObject = false;
    this.sceneFieldsPanel.parentNode.insertBefore(this.fieldsContainer, this.sceneFieldsPanel.parentNode.firstChild);

    this.addChildButton = this.dataViewContainer.querySelector('.main-band-add-child');
    this.addChildButton.addEventListener('click', e => this.addChild());

    this.exportFramesDetailsPanel = this.dialog.querySelector('.export-frames-details-panel');

    this.refreshExportButton = this.dialog.querySelector('.refresh-export-frames-button');
    this.refreshExportButton.addEventListener('click', e => this.refreshExportText());
    this.importButton = this.dialog.querySelector('.import-frames-button');
    this.importButton.addEventListener('click', e => this.importFramesFromText());
    this.dialog.querySelector('.canvas-actions .download-button').style.display = 'inline-block';
    this.ieTextArea = this.dialog.querySelector('.frames-textarea-export');
  }
  initDataUI() {
    this.__initHeader();
    this.dataview_record_tag = this.dialog.querySelector('#dataview_record_tag');
    this.dataview_record_key = this.dialog.querySelector('#dataview_record_key');
    this.dataview_record_tag.value = this.tag;

    this.dataview_record_tag.addEventListener('change', e => this.updateRecordList());
    this.dataview_record_key.addEventListener('change', e => this.updateSelectedRecord().then(() => {}));
  }
  updateRecordList(newKey = null) {
    this.tag = this.dataview_record_tag.value;
    this.key = newKey;
    let options = '<option value=""></option>';

    if (this.tag) {
      let fS = gAPPP.a.modelSets[this.tag].fireDataValuesByKey;
      for (let i in fS)
        options += `<option value="${i}">${fS[i].title} (${i})</option>`;
    }

    this.dataview_record_key.innerHTML = options;
    this.dataview_record_key.value = this.key;

    this.initDataFields();
    this.updateSelectedRecord().then(() => {});
  }
  async updateSelectedRecord() {
    if (this.dataview_record_key.selectedIndex <= 0) {
      this.context.activate(null);
      this.key = '';
      this.initDataFields();
      this._updateQueryString();
      return;
    }

    this.key = this.dataview_record_key.value;
    if (!this.dataFieldsInited)
      this.initDataFields();
    this.fireFields.values = this.fireSet.fireDataByKey[this.key].val();
    this._updateQueryString();

    //load saved scene if exists
    if (this.tag === 'block') {
      if (this.fireFields.values.url)
        await this.context.loadSceneURL(this.fireFields.values.url);

      this.sceneFireFields.values = this.fireSet.fireDataByKey[this.key].val();
      this._updateFollowTargetListOptions();
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
      //this.rootElementDom.innerHTML = this.rootBlock.getBlockDimDesc();

      this.childBand.refreshUIFromCache();
      this.childBand.setKey(null);
    }

    this.rootBlock = this.context.activeBlock;
    if (this.canvasHelper)
      this.canvasHelper.logClear();

    this.fireFields.loadedURL = this.fireFields.values['url'];
    let sceneReloadRequired = this.fireFields.paint();
    this.fireFields.helpers.resetUI();
    this.expandAll();

    if (this.sceneFireFields) {
      this.sceneFireFields.paint();
      this.sceneFireFields.helpers.resetUI();
    }

    //  this._endLoad();
    //  this._showFocus();
    //  this.expandAll();

    this.context.scene.switchActiveCamera(this.context.camera, this.context.canvas);
  }
  _updateQueryString(newWid) {
    let urlParams = new URLSearchParams(window.location.search);
    let queryString = `?wid=${gAPPP.a.profile.selectedWorkspace}`;
    if (newWid) {
      queryString = `?wid=${newWid}`;
    } else {
      if (this.tag === urlParams.get('tag') && this.key === urlParams.get('key'))
        return;

      if (this.tag) {
        queryString += `&tag=${this.tag}`;
        if (this.key)
          queryString += `&key=${this.key}`;
      }
    }

    let newURL = window.location.protocol + "//" + window.location.host + window.location.pathname + queryString;
    window.history.pushState({
      path: newURL
    }, '', newURL);
  }
  splitLayoutTemplate() {
    return `<div id="firebase-app-main-page" style="display:none;flex-direction:column;">
      <div id="renderLoadingCanvas" style="display:none;"><br><br>Working...</div>
      <div id="main-view-wrapper">
        <div class="form_canvas_wrapper"></div>
        <div class="form_panel_view_dom">
          <div class="header_wrapper" style="line-height: 3em;">
            <div id="profile-header-panel">
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
              <br>
              <div id="record_field_list">
                <form autocomplete="off" onsubmit="return false;"></form>
              </div>
            </div>
            <b>&nbsp;Workspace</b>
            <select id="workspaces-select"></select>
            <button id="profile_description_panel_btn" style="float:right;" class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab mdl-button--primary"><i class="material-icons">person</i></button>
            <select id="view_layout_select" style="float:right;">
              <option>Full</option>
              <option>Top</option>
              <option>Left</option>
              <option>Bottom</option>
              <option>Right</option>
              <option>None</option>
            </select>
            <br>
            <select id="dataview_record_tag">
              <option value=""></option>
              <option value="shape">Shape</option>
              <option value="mesh">Mesh</option>
              <option value="material">Material</option>
              <option value="texture">Texture</option>
              <option value="block">Block</option>
            </select>
            <select id="dataview_record_key" style="max-width:98%;"></select>
          </div>
          <div class="data-view-container"></div>
        </div>
      </div>
    </div>`;
  }
  show(scene) {
    this.context.activate(scene);
    this.canvasHelper.show();
  }
  async canvasReady() {
    return this.updateRecordList(this.key);
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.tag === 'block') {
      if (this.rootBlock) {
        this.rootBlock.handleDataUpdate(tag, values, type, fireData);
        //this.rootElementDom.innerHTML = this.rootBlock.getBlockDimDesc();
        if (tag === 'blockchild')
          this._updateFollowTargetListOptions();
        if (tag === 'blockchild')
          this.rootBlock.updateCamera();
      }
    }

    super._updateContextWithDataChange(tag, values, type, fireData);
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
  _cBlockEditorTemplate() {
    return `<select class="main-band-children-select"></select>
      <button class="main-band-add-child btn-sb-icon"><i class="material-icons">add</i> child</button>
      &nbsp;
      <select class="main-band-sub-view-select">
        <option>Frames</option>
        <option>Node Details</option>
        <option>Import/Export</option>
      </select>
      <br>
      <div class="frames-panel"></div>
      <div class="node-details-panel">
        <div class="cblock-child-details-panel"></div>
        <div class="scene-fields-panel">
          <hr>
        </div>
      </div>
      <div class="export-frames-details-panel">
        <button class="btn-sb-icon refresh-export-frames-button">Refresh</button>
        &nbsp;
        <button class="btn-sb-icon import-frames-button">Import</button>
        <br>
        <textarea class="frames-textarea-export" rows="1" cols="6" style="width: 100%; height: 5em"></textarea>
      </div>`;
  }
  refreshExportText() {
    let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
    if (!block)
      block = this.rootBlock;
    let outFrames = [];
    for (let i in block.framesHelper.rawFrames)
      outFrames.push(block.framesHelper.rawFrames[i]);

    this.ieTextArea.value = JSON.stringify(outFrames).replace(/},/g, '},\n');
  }
  importFramesFromText() {
    let obj;
    let rawJSON = this.ieTextArea.value;
    try {
      obj = JSON.parse(rawJSON);
    } catch (e) {
      console.log('frames import error (JSON.parse)', e);
      alert('Error parsing JSON, refer to console for more details: ' + e.toString());
      return;
    }

    if (!Array.isArray(obj)) {
      alert('Frames need to be in an array');
    }

    let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
    if (!block)
      block = this.rootBlock;

    block.framesHelper.importFrames(obj);
  }
  get activeAnimation() {
    return this.rootBlock.framesHelper.activeAnimation;
  }
  addChild() {
    let objectData = sDataDefinition.getDefaultDataCloned('blockchild');
    objectData.parentKey = this.key;
    gAPPP.a.modelSets['blockchild'].createWithBlobString(objectData).then(r => {
      this.childBand.setKey(r.key);
      setTimeout(() => {
        this.childBand.setKey(r.key);
      }, 100);
    });
  }
  setChildKey(key) {
    this.childKey = key;
    this.childEditPanel.style.display = 'none';

    if (this.childKey === null) {
      this.editMainPanel.classList.add('root-block-display');
      this.editMainPanel.classList.remove('child-block-display');
      this.context.setActiveBlock(this.rootBlock);
    } else {
      this.editMainPanel.classList.remove('root-block-display');
      this.editMainPanel.classList.add('child-block-display');
      this.childEditPanel.style.display = 'block';

      let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
      if (block)
        this.context.setActiveBlock(block);
      else
        this.context.setActiveBlock(this.rootBlock);
    }

    this.framesBand.refreshUIFromCache();
  }
  _handleActiveObjectUpdate(e) {}
  expandAll() {
    super.expandAll();
    this.detailsShown = true;
  }
  collapseAll() {
    super.collapseAll();
    this.detailsShown = false;
    if (this.tag === 'block') {
      this.setChildKey(this.childKey);
      this.framesBand._updateFrameHelpersUI();
    }
  }
  _updateFollowTargetListOptions() {
    let optionText = '';
    let options = [];
    if (this.rootBlock)
      options = this.rootBlock.generateTargetFollowList();
    for (let i = 0; i < options.length; i++)
      optionText += '<option>' + options[i] + '</option>';

    if (!this.followblocktargetoptionslist) {
      this.followblocktargetoptionslist = document.createElement('datalist');
      this.followblocktargetoptionslist.id = 'followblocktargetoptionslist';
      document.body.appendChild(this.followblocktargetoptionslist);
    }
    this.followblocktargetoptionslist.innerHTML = optionText;
  }
}
