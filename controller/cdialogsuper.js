class cDialogSuper {
  constructor(dialogQuerySelector, tag) {
    let me = this;

    this.tag = tag;
    this.key = null;
    this.fields = sStatic.bindingFields[this.tag];
    this.fireSet = gAPPP.a.modelSets[this.tag];
    this.fireFields = null;
    this.uiJSON = 'N/A';
    this.sC = new cBoundScene();

    this.dialogQuerySelector = dialogQuerySelector;
    this.dialog = document.querySelector(this.dialogQuerySelector);
    this.fieldsContainer = this.dialog.querySelector('.fields-container');
    if (this.fields) {
      let domClassPrefix = this.tag + '-fields-';
      this.fireFields = new cBoundFields(this.fields, domClassPrefix, this.fieldsContainer, this);
    }

    this.okBtn = this.dialog.querySelector('.save-details');
    this.cancelBtn = this.dialog.querySelector('.close-details');
    this.popupContent = this.dialog.querySelector('.popup-content');
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
    this.dialog.addEventListener('hidden.bs.modal', () => me.close(), false); //force cleanup if closed via escape

    this.canvas = this.dialog.querySelector('.popup-canvas');
    if (this.canvas)
      this.sceneTools = new cSceneToolsBand(this.canvas, this.sC);

    this.rotateState = 'vertical';
  }
  splitView() {
    if (!this.splitViewAlive)
      return;
    if (this.splitInstance)
      this.splitInstance.destroy();

      let t = this.dialog.querySelector('.popup-canvas');
      let b = this.dialog.querySelector('.popup-details');
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
    for (let i in this.editors)
      this.editors[i].resize();

    gAPPP.renderEngine.engine.resize();
  }
  close() {
    if (this.fireFields)
      this.fireFields.active = false;
    $(this.dialog).modal('hide');
    gAPPP.renderEngine.renderDefault();
  }
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
    let me = this;
    this.commit().then((result) => {
      me._endLoad();
      me.close();
    });
  }
  _endLoad() {
    this._showDom(this.popupButtons);
    this._showDom(this.tabContent);
    this._showDom(this.fieldsContainer);
    this._hideDom(this.progressBar);

    this.splitView();
  }
  scrape() {

  }
  paint() {

  }
  commit() {
    return new Promise((resolve, reject) => resolve());
  }
  show() {
    let me = this;
    this._startLoad();
    if (this.canvas)
      gAPPP.renderEngine.setCanvas(this.canvas);
    this.initEditors();
    this.paint();

    $(this.dialog).modal('show');

    this._focus();

    if (this.initScene) {
      let sceneDetails = sBabylonUtility.createDefaultScene();
      this.sC.set(sceneDetails);
      this.sC.activate();
      this.sC.loadScene(this.tag, this.fireData.val()).then(r => me._finishShow(r));
      return;
    }

    this._finishShow(null);
  }
  _focus() {
    if (this.cancelBtn)
      this.cancelBtn.focus();
    else if (this.okBtn)
      this.okBtn.focus();
  }
  initEditors() {
    if (this.editors !== null)
      return;

    this.editors = [];
    if (this.fireEditorId)
      if (this.dialog.querySelector('#' + fireEditorId)) {
        this.fireEditor = sUtility.editor(fireEditorId);
        this.fireEditor.$blockScrolling = Infinity;
        this.editors.push(this.fireEditor);
      }
  }
  _finishShow(uiObject) {
    this.uiObject = uiObject;
    if (this.fireEditor) {
      this.fireEditor.setValue(JSON.stringify(this.fireFields.values));
      sUtility.beautify(this.fireEditor);
    }

    if (this.fireFields)
      this.fireFields.paint(this.uiObject);
    this._endLoad();
    this._focus();
  }
}
