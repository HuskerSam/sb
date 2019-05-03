class cView extends bView {
  constructor(layoutMode, tag, key, childKey) {
    super(layoutMode, tag, key, false, childKey);
    this.canvasHelper.initExtraOptions();

    this.refreshProjectList().then(() => {});
    this._updateGoogleFonts().then(() => {});

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

    this.userProfileName = this.dialog.querySelector('.user-info');
    this.fontToolsContainer = this.dialog.querySelector('#profile-header-panel');
    this.fontFields = sDataDefinition.bindingFieldsCloned('fontFamilyProfile');
    this.fontFieldsContainer = this.fontToolsContainer.querySelector('.fields-container');
    this.fontTools = new cBandProfileOptions(null, this.fontFields, this.fontFieldsContainer, this.fontFieldsContainer);
    this.fontTools.fireFields.values = gAPPP.a.profile;
    this.fontTools.activate();

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
  initDataUI() {
    this.dataview_record_tag = this.dialog.querySelector('#dataview_record_tag');
    this.dataview_record_key = this.dialog.querySelector('#dataview_record_key');
    this.dataview_record_tag.value = this.tag;

    this.dataview_record_tag.addEventListener('change', e => this.updateRecordList());
    this.dataview_record_key.addEventListener('change', e => this.updateSelectedRecord().then(() => {}));
    this.blockChildrenSelect = this.dialog.querySelector('.main-band-children-select');
    this.addChildButton = this.dialog.querySelector('.main-band-add-child');
    this.addChildButton.addEventListener('click', e => this.addChild());
    this.removeChildButton = this.dialog.querySelector('.main-band-delete-child');
    this.removeChildButton.addEventListener('click', e => this.removeChild(e));
    this.mainbandsubviewselect = this.dialog.querySelector('.main-band-sub-view-select');
    this.addFrameButton = this.dialog.querySelector('.add_frame_button');
    this.addFrameButton.addEventListener('click', e => this.__addFrameHandler());
    this.deleteAssetButton = this.dialog.querySelector('.delete-asset-button');
    this.deleteAssetButton.addEventListener('click', e => this.deleteAsset());
    this.snapshotAssetButton = this.dialog.querySelector('.snapshot-asset-button');
    this.snapshotAssetButton.addEventListener('click', e => this.renderPreview());
    this.addAssetButton = this.dialog.querySelector('.add-asset-button');
    this.addAssetButton.addEventListener('click', e => this.addAsset());

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
    this.dataViewContainer.innerHTML = this.__dataviewTemplate();
    this.fieldsContainer = this.form_panel_view_dom.querySelector('.asset-fields-container');
    this.dataFieldsInited = false;

    this.blockChildrenSelect.style.display = 'none';
    this.addChildButton.style.display = 'none';
    this.mainbandsubviewselect.style.display = 'none';
    this.removeChildButton.style.display = 'none';

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
      this.blockChildrenSelect.style.display = '';
      this.addChildButton.style.display = '';
      this.mainbandsubviewselect.style.display = '';
    } else {}
  }
  initBlockDataFields() {
    this.framesPanel = this.dataViewContainer.querySelector('.frames-panel');
    this.framesBand = new cBandFrames(this.framesPanel, this);
    this.sceneFields = sDataDefinition.bindingFieldsCloned('sceneFields');
    this.sceneFieldsPanel = this.dataViewContainer.querySelector('.scene-fields-panel');
    this.sceneFireFields = new cPanelData(this.sceneFields, this.sceneFieldsPanel, this);
    this.fireSet.childListeners.push((values, type, fireData) => this.sceneFireFields._handleDataChange(values, type, fireData));
    this.sceneFireFields.updateContextObject = false;
    this.fireFields.updateContextObject = false;

    this.refreshExportButton = this.dialog.querySelector('.refresh-export-frames-button');
    this.refreshExportButton.addEventListener('click', e => this.refreshExportText());
    this.importButton = this.dialog.querySelector('.import-frames-button');
    this.importButton.addEventListener('click', e => this.importFramesFromText());
    this.dialog.querySelector('.canvas-actions .download-button').style.display = 'inline-block';
    this.ieTextArea = this.dialog.querySelector('.frames-textarea-export');

    this.exportFramesDetailsPanel = this.dialog.querySelector('.export-frames-details-panel');
    this.nodedetailspanel = this.dialog.querySelector('.node-details-panel');
    this.mainbandsubviewselect.addEventListener('change', e => this.updateSubViewDisplay());
    this.updateSubViewDisplay();

    this.childEditPanel = this.dataViewContainer.querySelector('.cblock-child-details-panel');
    this.childBand = new cBandSelect(this.blockChildrenSelect, this, this.childEditPanel);
    this.childEditPanel.parentNode.insertBefore(this.fieldsContainer, this.childEditPanel.parentNode.firstChild);
  }
  updateSubViewDisplay() {
    let view = this.mainbandsubviewselect.value;
    this.addFrameButton.style.display = (this.tag === 'block') ? 'inline-block' : 'none';
    this.framesPanel.style.display = (view === 'frame') ? 'block' : 'none';
    this.nodedetailspanel.style.display = (view === 'node') ? 'block' : 'none';
    this.exportFramesDetailsPanel.style.display = (view === 'import') ? 'block' : 'none';
    this.removeChildButton.style.display = (this.tag === 'block' && this.childKey) ? 'inline-block' : 'none';
  }
  deleteAsset() {
    if (!this.tag)
      return;
    if (!this.key)
      return;
    if (!confirm('Are you sure you want to delete this ' + this.tag + '?'))
      return;
    gAPPP.a.modelSets[this.tag].removeByKey(this.key);
  }
  addAsset() {
    this.dialog.context.createObject(this.tag, 'new ' + this.tag).then(results => {
      dataview_record_key.value = results.key;
      return this.updateSelectedRecord();
    });
  }
  __addFrameHandler() {
    this.mainbandsubviewselect.value = 'frame';
    this.updateSubViewDisplay();
    this.framesBand.addFrame(this.framesBand.__getKey());
  }
  updateRecordList(newKey = null) {
    this.tag = this.dataview_record_tag.value;
    this.key = newKey;
    let options = '<option value=""></option>';

    if (this.tag) {
      options = `<option values="" selected>Select or Add ${this.dataview_record_tag.selectedOptions[0].label}</option>`;
      let fS = gAPPP.a.modelSets[this.tag].fireDataValuesByKey;
      for (let i in fS)
        options += `<option value="${i}">${fS[i].title} (${i})</option>`;
      this.addAssetButton.style.display = 'inline-block';

    } else {
      this.addAssetButton.style.display = 'none';
      this.deleteAssetButton.style.display = 'none';
      this.snapshotAssetButton.style.display = 'none';
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
      this.dataview_record_key.selectedIndex = 0;
      this.initDataFields();
      this._updateQueryString();
      if (this.addFrameButton)
        this.addFrameButton.style.display = 'none';
      if (this.removeChildButton)
        this.removeChildButton.style.display = (this.tag === 'block' && this.childKey) ? 'inline-block' : 'none';
      this.deleteAssetButton.style.display = 'none';
      this.snapshotAssetButton.style.display = 'none';
      this.form_canvas_wrapper.classList.add('show-help');
      return this.showDefaultDataView();
    }
    this.form_canvas_wrapper.classList.remove('show-help');
    this.deleteAssetButton.style.display = 'inline-block';
    this.snapshotAssetButton.style.display = 'inline-block';

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
      this.setChildKey(this.childKey);
      this.childBand.updateSelectDom();
      if (this.blockChildrenSelect.selectedIndex === -1) {
        this.childKey = '';
        this.blockChildrenSelect.value = '';
      }

      this.updateSubViewDisplay();
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
    this.context.scene.switchActiveCamera(this.context.camera, this.context.canvas);
  }
  _updateQueryString(newWid) {
    let urlParams = new URLSearchParams(window.location.search);
    let queryString = `?wid=${gAPPP.a.profile.selectedWorkspace}`;
    if (newWid) {
      queryString = `?wid=${newWid}`;
    } else {
      if (this.tag === urlParams.get('tag') && this.key === urlParams.get('key') && this.childKey === urlParams.get('childkey'))
        return;

      if (this.tag) {
        queryString += `&tag=${this.tag}`;
        if (this.key)
          queryString += `&key=${this.key}`;
        if (this.childKey)
          queryString += `&childkey=${this.childKey}`;
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
          <div id="profile-header-panel">${this.profilePanelTemplate()}</div>
          <div class="header_wrapper" style="line-height: 3em;">
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
            <select id="dataview_record_key" style="max-width:calc(100% - 12.5em);"></select>
            <button class="snapshot-asset-button btn-sb-icon"><i class="material-icons">add_a_photo</i></button>
            <button class="delete-asset-button btn-sb-icon"><i class="material-icons">remove</i></button>
            <button class="add-asset-button btn-sb-icon"><i class="material-icons">add</i></button>
            <div style="display:inline-block;">
              <select class="main-band-children-select" style="display:none;"></select>
              <button class="main-band-delete-child btn-sb-icon"><i class="material-icons">remove</i></button>
              <button class="main-band-add-child btn-sb-icon"><i class="material-icons">add</i></button>
              <select class="main-band-sub-view-select" style="display:none;">
                <option value="frame" selected>Frames</option>
                <option value="node">Node Details</option>
                <option value="import">Import/Export</option>
              </select>
              <button class="add_frame_button btn-sb-icon" style="display:none;"><i class="material-icons">playlist_add</i></button>
            </div>
          </div>
          <div class="data-view-container">
          </div>
        </div>
      </div>
    </div>
    <datalist id="framecommandoptionslist">
      <option>Set</option>
      <option>GSet</option>
      <option>Animation</option>
      <option>Video</option>
      <option>Audio</option>
      <option>Function</option>
      <option>Camera</option>
    </datalist>
    <datalist id="framecommandfieldslist">
      <option>videoURL</option>
      <option>videoHeight</option>
      <option>videoWidth</option>
      <option>fogType</option>
      <option>fogDensity</option>
      <option>skybox</option>
      <option>groundMaterial</option>
      <option>material</option>
      <option>play</option>
      <option>pause</option>
      <option>stop</option>
      <option>position</option>
      <option>target</option>
    </datalist>
    <datalist id="blockchildtypelist">
      <option>block</option>
      <option>mesh</option>
      <option>shape</option>
      <option>light</option>
      <option>camera</option>
    </datalist>
    <datalist id="htmlvideosourcelist">
      <option>video/webm</option>
      <option>video/mp4</option>
      <option>video/ogg</option>
    </datalist>
    <datalist id="fogtypelist">
      <option>none</option>
      <option>EXP</option>
      <option>EXP2</option>
      <option>LINEAR</option>
    </datalist>
    <datalist id="lightsourceslist">
      <option>Point</option>
      <option>Directional</option>
      <option>Spot</option>
      <option>Hemispheric</option>
    </datalist>
    <datalist id="camerasourceslist">
      <option>UniversalCamera</option>
      <option>ArcRotate</option>
      <option>FollowCamera</option>
    </datalist>
    <datalist id="fontfamilydatalist"></datalist>
    <datalist id="skyboxlist"></datalist>
    <datalist id="sbmesheslist"></datalist>
    <datalist id="followblocktargetoptionslist"></datalist>`;
  }
  __dataviewTemplate() {
    return `<div class="asset-fields-container"></div>
      <div class="frames-panel" style='display:none;'></div>
      <div class="node-details-panel" style="display:none">
        <div class="cblock-child-details-panel"></div>
        <div class="scene-fields-panel">
          <hr>
        </div>
      </div>
      <div class="export-frames-details-panel" style='display:none'>
        <button class="btn-sb-icon refresh-export-frames-button">Refresh</button>
        &nbsp;
        <button class="btn-sb-icon import-frames-button">Import</button>
        <br>
        <textarea class="frames-textarea-export" rows="1" cols="6" style="width: 100%; height: 5em"></textarea>
      </div>`;
  }
  async canvasReady() {
    return this.updateRecordList(this.key);
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.tag === 'block') {
      if (this.rootBlock) {
        this.rootBlock.handleDataUpdate(tag, values, type, fireData);
        this.childBand.updateSelectDom();
        if (tag === 'blockchild')
          this._updateFollowTargetListOptions();
        if (tag === 'blockchild')
          this.rootBlock.updateCamera();
      }
    }

    super._updateContextWithDataChange(tag, values, type, fireData);
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
  addChild() {
    let objectData = sDataDefinition.getDefaultDataCloned('blockchild');
    objectData.parentKey = this.key;
    gAPPP.a.modelSets['blockchild'].createWithBlobString(objectData).then(r => {
      this.childBand.setKey(r.key);
      setTimeout(() => {
        this.childBand.setKey(r.key);
      }, 100);
    });
    this.mainbandsubviewselect.value = 'node';
    this.updateSubViewDisplay();
  }
  removeChild(e) {
    this.childBand.deleteChildBlock(this.childKey, e);
  }
  setChildKey(key) {
    this.childKey = key;
    if (!this.childEditPanel)
      return;
    this.childEditPanel.style.display = 'none';
    this._updateQueryString();

    this.removeChildButton.style.display = (this.tag === 'block' && this.childKey) ? 'inline-block' : 'none';

    if (!this.childKey) {
      this.form_panel_view_dom.classList.add('root-block-display');
      this.form_panel_view_dom.classList.remove('child-block-display');
      this.context.setActiveBlock(this.rootBlock);
    } else {
      this.form_panel_view_dom.classList.remove('root-block-display');
      this.form_panel_view_dom.classList.add('child-block-display');
      this.childEditPanel.style.display = 'block';

      if (this.rootBlock) {
        let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
        if (block)
          this.context.setActiveBlock(block);
        else
          this.context.setActiveBlock(this.rootBlock);
      }
    }

    if (this.framesBand)
      this.framesBand.refreshUIFromCache();
  }
  _handleActiveObjectUpdate(e) {}
  expandAll() {
    super.expandAll();
    this.detailsShown = true;
    if (this.tag === 'block') {
      this.setChildKey(this.childKey);
      this.framesBand._updateFrameHelpersUI();
    }
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
  showDefaultDataView() {
    this.helpViewer = this.dialog.querySelector('.help-overlay');
    if (!this.tag) {
      fetch('/doc/assethelp.html')
        .then(res => res.text())
        .then(html => this.fieldsContainer.innerHTML = html);

      fetch(`/doc/workspacehelp.html`)
        .then(res => res.text())
        .then(html => this.helpViewer.innerHTML = html);

      return;
    }
    this.recordViewer = new cBandIcons(this.tag, this);

    fetch(`/doc/${this.tag}help.html`)
      .then(res => res.text())
      .then(html => this.helpViewer.innerHTML = html);

  }
  renderPreview() {
    if (this.context)
      if (this.tag && this.key)
        this.context.renderPreview(this.tag, this.key);
  }
}
