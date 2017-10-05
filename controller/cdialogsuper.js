class cDialogSuper {
  constructor(dialogQuerySelector, tag, dialog) {
    let me = this;

    this.tag = tag;
    this.key = null;
    this.fields = sStatic.bindingFieldsCloned(this.tag);
    this.fireSet = gAPPP.a.modelSets[this.tag];
    this.fireFields = null;
    this.uiJSON = 'N/A';
    this.sC = new cBoundScene();

    this.dialogQuerySelector = dialogQuerySelector;
    if (!dialog)
      this.dialog = document.querySelector(this.dialogQuerySelector);
    else
      this.dialog = dialog;

    this.fieldsContainer = this.dialog.querySelector('.fields-container');
    if (this.fields) {
      let domClassPrefix = this.tag + '-fields-';
      this.fireFields = new cBoundFields(this.fields, domClassPrefix, this.fieldsContainer, this);
      this.fireSet.childListeners.push((values, type, fireData) => me.fireFields._handleDataChange(values, type, fireData));
    }

    this.okBtn = this.dialog.querySelector('.save-details');
    this.cancelBtn = this.dialog.querySelector('.close-details');
    this.progressBar = this.dialog.querySelector('.popup-progress-bar');
    this.okBtn = this.dialog.querySelector('.save-details');
    this.rotateBtn = this.dialog.querySelector('.rotate-details');
    this.tabContent = this.dialog.querySelector('.tab-content');
    this.popupButtons = this.dialog.querySelector('.popup-buttons');

    if (this.cancelBtn)
      this.cancelBtn.addEventListener('click', () => me.close(), false);
    if (this.okBtn)
      this.okBtn.addEventListener('click', () => me.save(), false);
    if (this.rotateBtn)
      this.rotateBtn.addEventListener('click', () => me.rotateView(), false);
    $(this.dialog).on('hidden.bs.modal', () => me.close()); //force cleanup if closed via escape

    this.canvas = this.dialog.querySelector('.popup-canvas');
    if (this.canvas)
      this.sceneTools = new cSceneToolsBand(this.tag, this.canvas, this.sC);

    this.rotateState = 'vertical';
  }
  splitView() {
    if (!this.splitViewAlive)
      return;
    if (this.splitInstance)
      this.splitInstance.destroy();

    let t = this.dialog.querySelector('.popup-canvas');
    let b = this.dialog.querySelector('.fields-container');
    let mb = this.dialog.querySelector('.popup-main-body');

    if (this.rotateState === 'horizontal') {
      t.classList.add('vertical-split-display');
      b.classList.add('vertical-split-display');
    } else {
      t.classList.remove('vertical-split-display');
      b.classList.remove('vertical-split-display');
    }

    let me = this;
    this.splitInstance = window.Split([t, b], {
      sizes: [50, 50],
      direction: this.rotateState,
      onDragEnd: () => me.splitDragEnd(),
      onDrag: () => me.splitDragEnd()
    });

    gAPPP.renderEngine.engine.resize();
  }
  rotateView() {
    if (this.rotateState === 'vertical') {
      this.rotateState = 'horizontal';
    } else {
      this.rotateState = 'vertical';
    }
    this.splitView();
  }
  splitDragEnd() {
    gAPPP.renderEngine.engine.resize();
  }
  close() {
    if (this.fireFields)
      this.fireFields.active = false;
    if (this.sceneTools)
      this.sceneTools.fireFields.active = false;
    if (this.fireFields.renderImageUpdateNeeded) {
      this.fireFields.renderImageUpdateNeeded = false;
      this._renderImageUpdate();
    }
    $(this.dialog).modal('hide');
    gAPPP.renderEngine.renderDefault();
  }
  _renderImageUpdate() {}
  _startLoad() {
    this._hideDom(this.popupButtons);
    this._hideDom(this.tabContent);
    this._hideDom(this.fieldsContainer);
    this._showDom(this.progressBar);
  }
  _showDom(element) {
    if (element)
      element.style.display = 'block';
  }
  _hideDom(element) {
    if (element)
      element.style.display = 'none';
  }
  save() {
    this.close();
  }
  _endLoad() {
    this._showDom(this.popupButtons);
    this._showDom(this.tabContent);
    this._showDom(this.fieldsContainer);
    this._hideDom(this.progressBar);

    gAPPP.renderEngine.engine.resize();

    this.splitView();
  }
  show() {
    let me = this;
    this._startLoad();
    if (this.canvas)
      gAPPP.renderEngine.setCanvas(this.canvas);

    $(this.dialog).modal('show');

    this._focus();

    if (this.initScene) {
      return this._initScene();
    }

    this._finishShow(null);
  }
  _initScene() {
    let me = this;
    let sceneDetails = sBabylonUtility.createDefaultScene();
    this.sC.set(sceneDetails);
    this.sC.activate();
    this.sC.loadScene(this.tag, this.fireFields.values).then(r => me._finishShow(r));
  }
  _focus() {
    if (this.cancelBtn)
      this.cancelBtn.focus();
    else if (this.okBtn)
      this.okBtn.focus();
  }
  _finishShow(uiObject) {
    this.uiObject = uiObject;

    if (this.fireFields){
      this.fireFields.loadedURL = this.fireFields.values['url'];
      let sceneReloadRequired = this.fireFields.paint(this.uiObject);
    }
    if (this.sceneTools)
      this.sceneTools.fireFields.paint({
        type: 'sceneTools',
        uiObject: this.uiObject,
        scene: this.uiObject.scene,
        sceneController: this.sC
      });
    this._endLoad();
    this._focus();
  }
}
