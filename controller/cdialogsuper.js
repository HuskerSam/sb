class cDialogSuper {
  constructor(dialogQuerySelector, tag, dialog) {
    this.tag = tag;
    this.key = null;
    this.fields = sDataDefinition.bindingFieldsCloned(this.tag);
    this.fireSet = gAPPP.a.modelSets[this.tag];
    this.fireFields = null;
    this.uiJSON = 'N/A';

    this.dialogQuerySelector = dialogQuerySelector;
    if (!dialog)
      this.dialog = document.querySelector(this.dialogQuerySelector);
    else
      this.dialog = dialog;

    this.fieldsContainer = this.dialog.querySelector('.fields-container');
    if (this.fields) {
      this.fireFields = new cDataView(this.fields, this.fieldsContainer, this);
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
    $(this.dialog).on('hidden.bs.modal', () => this.close()); //force cleanup if closed via escape
    $(this.dialog).on('shown.bs.modal', () => this._showFocus());

    this.canvas = this.dialog.querySelector('.popup-canvas');
    if (this.canvas)
      this.context = new cContext(this.canvas);

    this.rotateState = 'vertical';
  }
  close() {
    if (this.fireFields)
      this.fireFields.active = false;
    if (this.fireFields.renderImageUpdateNeeded) {
      this.fireFields.renderImageUpdateNeeded = false;
      if (this.context)
        this.context.renderPreview(this.tag, this.key);
    }
    $(this.dialog).modal('hide');
    gAPPP.mV.context.activate();
  }
  save() {
    this.close();
  }
  show() {
    this._startLoad();
    $(this.dialog).modal('show');

    this._showFocus();

    if (this.initScene) {
      this.context.activate(null);
      if (this.tag === 'mesh') {
        this.context.setActiveBlock(new cBlock(this.context));
        this.context.activeBlock.setData(this.fireFields.values);
        this.context.activeBlock.loadMesh().then(
          mesh => this._finishShow(),
          err => this._finishShow());
        return;
      }
      if (this.tag === 'shape') {
        let b = new cBlock(this.context);
        b.displayOverride = 'none';
        b.blockType = 'shape';
        b.setData(this.fireFields.values);
        this.context.setActiveBlock(b);

        this._finishShow();
        return;
      }

      this.context.loadScene(this.fireFields.values).then(
        r => this._finishShow(),
        e => this._finishShow());
    } else
      this._finishShow();
  }
  _endLoad() {
    this._showDom(this.popupButtons);
    this._showDom(this.fieldsContainer);
    this._hideDom(this.progressBar);

    this._splitView();
  }
  _finishShow() {
    if (this.fireFields) {
      this.fireFields.loadedURL = this.fireFields.values['url'];
      let sceneReloadRequired = this.fireFields.paint();
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
    let b = this.dialog.querySelector('.edit-popup-fields.fields-container');
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
      direction: this.rotateState,
      onDragEnd: () => this._splitDragEnd(),
      onDrag: () => this._splitDragEnd()
    });
    gAPPP.resize();
  }
  _startLoad() {
    this._hideDom(this.popupButtons);
    this._hideDom(this.fieldsContainer);
    this._showDom(this.progressBar);
  }
}
