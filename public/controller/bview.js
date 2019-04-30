class bView {
  constructor(layoutMode, tag, key, play = false) {
    this.dialogs = {};
    this.playAnimation = play;
    this.tag = tag;
    this.key = key;
    this.canvasFBRecordTypes = ['blockchild', 'block', 'mesh', 'shape', 'material', 'texture', 'frame'];
    this.initDom();

    this.dialog.context = this.context;
    this.key = null;
    this.show(null);
  }
  initDom() {
    if (this.context)
      this.context.deactivate();

    this.dialog = document.querySelector('#firebase-app-main-page');
    document.body.removeChild(this.dialog);
    this.dialog = null;

    let div = document.createElement('div');
    div.innerHTML = this.layoutTemplate();
    div = div.firstChild;
    document.body.insertBefore(div, document.body.firstChild);
    this.dialog = document.querySelector('#firebase-app-main-page');

    this.signOutBtn = document.querySelector('#sign-out-button');
    if (this.signOutBtn)
      this.signOutBtn.addEventListener('click', e => gAPPP.a.signOut(), false);

    this.initCanvas();
    this.initHeader();
    this.splitLayout();
    this.initDataUI();
    this.registerFirebaseModels();
    this.dialog.style.display = '';
  }
  initDataUI() {}
  initHeader() {}
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
    this.context = new wContext(this.canvas, true);
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
    return document.getElementById('canvas-d3-player-template').innerHTML;
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
      this.layoutMode = gAPPP.a.profile.formLayoutMode;
      if (this.layoutMode === 'Right' || this.layoutMode === 'Bottom') {
        l = this.form_panel_view_dom;
        r = this.form_canvas_wrapper;
        l.parentNode.insertBefore(l, r);
      }

      let splitOrientation = 'horizontal';
      if (this.layoutMode === 'Top' || this.layoutMode === 'Bottom') {
        splitOrientation = 'vertical';
        this.form_canvas_wrapper.parentNode.style.display = 'block';
      }
      this.splitInstance = window.Split([l, r], {
        sizes: [40, 60],
        gutterSize: 20,
        direction: splitOrientation,
        onDragEnd: () => gAPPP.resize(),
        onDrag: () => gAPPP.resize()
      });
    }
  }
  layoutTemplate() {
    this.layoutMode = gAPPP.a.profile.formLayoutMode;
    if (['Left', 'Right', 'Top', 'Bottom'].indexOf(this.layoutMode) !== -1)
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
}
