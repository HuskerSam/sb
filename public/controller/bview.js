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
    document.title = blockData.title;
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
    if (this.rootBlock)
      this.rootBlock.setData();
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

    if (pS !== this.canvasHelper.playState || pT !== this.canvasHelper.lastSliderValue) {
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
}
