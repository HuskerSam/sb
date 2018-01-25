class cDialogSuper {
  constructor(dialog, tag, dataViewContainer = null, fieldsContainer = null) {
    this.tag = tag;
    this.key = null;
    this.fields = sDataDefinition.bindingFieldsCloned(this.tag);
    this.fireSet = gAPPP.a.modelSets[this.tag];
    this.fireFields = null;
    this.uiJSON = 'N/A';
    this.dialog = dialog;

    if (fieldsContainer)
      this.fieldsContainer = fieldsContainer;
    else
      this.fieldsContainer = this.dialog.querySelector('.fields-container');

    if (dataViewContainer)
      this.dataViewContainer = dataViewContainer;
    else
      this.dataViewContainer = this.fieldsContainer;

    if (this.fields) {
      this.fireFields = new cPanelData(this.fields, this.fieldsContainer, this);
      this.fireSet.childListeners.push((values, type, fireData) => this.fireFields._handleDataChange(values, type, fireData));
    }

    this.okBtn = this.dialog.querySelector('.save-details');
    this.cancelBtn = this.dialog.querySelector('.close-details');
    this.progressBar = this.dialog.querySelector('.popup-progress-bar');
    this.okBtn = this.dialog.querySelector('.save-details');
    this.rotateBtn = this.dialog.querySelector('.rotate-details');
    this.popupButtons = this.dialog.querySelector('.popup-buttons');

    if (this.cancelBtn)
      this.cancelBtn.addEventListener('click', () => this.close(), false);
    if (this.okBtn)
      this.okBtn.addEventListener('click', () => this.save(), false);
    if (this.rotateBtn)
      this.rotateBtn.addEventListener('click', () => this._rotateView(), false);
  //  $(this.dialog).on('hidden.bs.modal', () => this.close()); //force cleanup if closed via escape
//    $(this.dialog).on('shown.bs.modal', () => this._showFocus());

    this.canvas = this.dialog.querySelector('.popup-canvas');
    if (this.canvas)
      this.context = new wContext(this.canvas);
  }
  expandAll() {
    this.fireFields.helpers.expandAll();
  }
  collapseAll() {
    this.fireFields.helpers.collapseAll();
  }
  close() {
    if (this.fireFields)
      this.fireFields.active = false;
    if (this.fireSet.renderImageUpdateNeeded) {
      this.fireSet.renderImageUpdateNeeded = false;
      if (this.context)
        this.context.renderPreview(this.tag, this.key);
    }
    this.dialog.close();

    if (this.canvasHelper) {
      this.canvasHelper.sceneTools.expanded = true;
      this.canvasHelper.sceneTools.toggle();
    }
    gAPPP.mV.show();
  }
  save() {
    this.close();
  }
  show() {
    this._startLoad();
    this.dialog.showModal();

    this.rotateState = gAPPP.a.profile.editFormRotateState;
    if (!this.rotateState)
      this.rotateState = 'vertical';

    this._showFocus();

    if (this.initScene) {
      this.context.activate(null);

      if (this.tag === 'mesh') {
        let b = new wBlock(this.context);
        b.staticLoad = true;
        b.staticType = 'mesh';
        this.context.setActiveBlock(b);
        this.context.activeBlock.setData(this.fireFields.values);
        this.context.activeBlock.loadMesh().then(
          mesh => this._finishShow(),
          err => this._finishShow());
        return;
      }
      if (this.tag === 'shape') {
        let b = new wBlock(this.context);
        b.staticType = 'shape';
        b.staticLoad = true;
        b.setData(this.fireFields.values);
        this.context.setActiveBlock(b);
        this._finishShow();
        return;
      }
      if (this.tag === 'block') {
        let b = new wBlock(this.context);
        b.staticType = 'block';
        b.staticLoad = true;
        b.blockKey = this.key;
        b.isContainer = true;
        b.setData(this.fireFields.values);
        this.context.setActiveBlock(b);
        this.rootBlock = b;

        this._finishShow();
        return;
      }
      if (this.tag === 'material') {
        let b = new wBlock(this.context);
        b.staticType = 'material';
        b.staticLoad = true;
        b.setData(this.fireFields.values);
        this.context.setActiveBlock(b);
        this._finishShow();
        return;
      }
      if (this.tag === 'texture') {
        let b = new wBlock(this.context);
        b.staticType = 'texture';
        b.staticLoad = true;
        b.setData(this.fireFields.values);
        this.context.setActiveBlock(b);
        this._finishShow();
        return;
      }

      if (this.tag === 'scene') {
        this.context.loadSceneURL(this.fireFields.values['url']).then(
          r => this._finishShow(),
          e => this._finishShow());
        return;
      }

      this._finishShow();
    } else
      this._finishShow();
  }
  _endLoad() {
    this._showDom(this.popupButtons);
    this._showDom(this.dataViewContainer);
    this._hideDom(this.progressBar);

    this._splitView();
  }
  _finishShow() {
    if (this.fireFields) {
      this.fireFields.loadedURL = this.fireFields.values['url'];
      let sceneReloadRequired = this.fireFields.paint();
      this.fireFields.helpers.resetUI();
    }

    this._endLoad();
    this._showFocus();
  }
  _hideDom(element) {
    if (element)
      element.style.display = 'none';
  }
  _rotateView() {
    if (this.rotateState === 'vertical') {
      this.rotateState = 'horizontal';
    } else {
      this.rotateState = 'vertical';
    }

    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'editFormRotateState',
      newValue: this.rotateState
    }]);

    this._splitView();
  }
  _showDom(element) {
    if (element)
      element.style.display = 'block';
  }
  _showFocus() {
    if (this.cancelBtn)
      this.cancelBtn.focus();
    else if (this.okBtn)
      this.okBtn.focus();

    gAPPP.resize();
  }
  _splitDragEnd() {
    gAPPP.resize();
  }
  _splitView() {
    if (!this._splitViewAlive)
      return;
    if (this.splitInstance)
      this.splitInstance.destroy();

    let t = this.dialog.querySelector('.popup-canvas-wrapper');
    let b = this.dataViewContainer;
    let mb = this.dialog.querySelector('.popup-main-body');

    if (this.rotateState === 'horizontal') {
      t.classList.add('vertical-split-display');
      b.classList.add('vertical-split-display');
    } else {
      t.classList.remove('vertical-split-display');
      b.classList.remove('vertical-split-display');
    }

    this.splitInstance = window.Split([t, b], {
      sizes: [50, 50],
      gutterSize: 16,
      direction: this.rotateState,
      onDragEnd: () => this._splitDragEnd(),
      onDrag: () => this._splitDragEnd()
    });
    gAPPP.resize();
  }
  _startLoad() {
    this._hideDom(this.popupButtons);
    this._hideDom(this.dataViewContainer);
    this._showDom(this.progressBar);
  }
}
