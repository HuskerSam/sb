class bView {
  constructor() {
    this.dialog = document.querySelector('#firebase-app-main-page');
    this.dialogs = {};

    let canvasTemplate = document.getElementById('canvas-d3-player-template').innerHTML;
    this.dialog.querySelector('.popup-canvas-wrapper').innerHTML = canvasTemplate;

    this.canvas = this.dialog.querySelector('.popup-canvas');
    this.context = new wContext(this.canvas, true);
    this.dialog.context = this.context;
    this.show(null);

    this.canvasActions = this.dialog.querySelector('.canvas-actions');
    this.canvasActions.style.display = '';

    this.key = null;
    this.loadedSceneURL = '';
    this.lastNoBump = gAPPP.a.profile.noBumpMaps;

    gAPPP.a.modelSets['blockchild'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('blockchild', values, type, fireData));
    gAPPP.a.modelSets['block'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('block', values, type, fireData));
    gAPPP.a.modelSets['mesh'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('mesh', values, type, fireData));
    gAPPP.a.modelSets['shape'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('shape', values, type, fireData));
    gAPPP.a.modelSets['material'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('material', values, type, fireData));
    gAPPP.a.modelSets['texture'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('texture', values, type, fireData));
    gAPPP.a.modelSets['frame'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('frame', values, type, fireData));
    gAPPP.a.modelSets['userProfile'].childListeners.push(
      (values, type, fireData) => this._userProfileChange(values, type, fireData));

    this.canvasHelper = new cPanelCanvas(this);
    this.context.canvasHelper = this.canvasHelper;
    this.canvasHelper.hide();
    this.canvasHelper.saveAnimState = true;
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
      this._userProfileChange();
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
  _userProfileChange(values, type, fireData) {
    if (!this.rootBlock)
      return;
    if (this.lastNoBump !== gAPPP.a.profile.noBumpMaps) {
      this.lastNoBump = gAPPP.a.profile.noBumpMaps;
      this.rootBlock.setData();
    }
    if (!gAPPP.a.profile.cameraUpdates)
      return;

    let pS = gAPPP.a.profile['playState' + this.rootBlock.blockKey];
    let pT = gAPPP.a.profile['playStateAnimTime' + this.rootBlock.blockKey];
    let pO = gAPPP.a.profile['playStateOffset' + this.rootBlock.blockKey];

    if (pS !== this.canvasHelper.playState || pT !== this.canvasHelper.lastSliderValue || pO !== this.canvasHelper.lastOffset) {
      this.canvasHelper._playState = pS;
      this.canvasHelper.__updatePlayState();
    }
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (!tag)
      return;
    if (this.rootBlock)
      this.rootBlock.handleDataUpdate(tag, values, type, fireData);
    this.canvasHelper.testError();
  }
  closeHeaderBands() {}
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
  selectProject() {
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
  _addProject(newTitle, newCode) {
    let key = gAPPP.a.modelSets['projectTitles'].getKey();
    firebase.database().ref('projectTitles/' + key).set({
      title: newTitle,
      code: newCode
    });
    firebase.database().ref('project/' + key).set({
      title: newTitle
    });
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'selectedWorkspace',
      newValue: key
    }]);
    setTimeout(() => location.reload(), 100);
  }
}
