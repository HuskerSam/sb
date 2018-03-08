class cDialogEdit {
  constructor(tag, title) {
    if (tag !== null) {
      let d = document.createElement('dialog');
      d.innerHTML = document.getElementById('scene-builder-edit-dialog-template').innerHTML;
      d.classList.add('modal-dialog');
      d.querySelector('.popup-title').innerHTML = title;
      document.body.appendChild(d);

      let canvasTemplate = document.getElementById('canvas-d3-player-template').innerHTML;
      d.querySelector('.popup-canvas-wrapper').innerHTML = canvasTemplate;

      let fieldsContainer = d.querySelector('.edit-popup-fields');
      this._init(d, tag, fieldsContainer, fieldsContainer);
    }
  }
  _init(dialog, tag, dataViewContainer = null, fieldsContainer = null) {
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
      this.fireFields.updateContextObject = true;
      this.fireSet.childListeners.push((values, type, fireData) => this.fireFields._handleDataChange(values, type, fireData));
    }

    this.okBtn = this.dialog.querySelector('.save-details');
    this.cancelBtn = this.dialog.querySelector('.close-details');
    this.progressBar = this.dialog.querySelector('.popup-progress-bar');
    this.okBtn = this.dialog.querySelector('.save-details');
    this.rotateBtn = this.dialog.querySelector('.rotate-details');
    this.deleteBtn = this.dialog.querySelector('.delete-item');
    this.popupButtons = this.dialog.querySelector('.popup-buttons');

    if (this.cancelBtn)
      this.cancelBtn.addEventListener('click', () => this.close(), false);
    if (this.okBtn)
      this.okBtn.addEventListener('click', () => this.save(), false);
    if (this.rotateBtn)
      this.rotateBtn.addEventListener('click', () => this._rotateView(), false);
    if (this.deleteBtn)
      this.deleteBtn.addEventListener('click', () => this._delete(), false);

    this.dialog.addEventListener('close', e => this.close());

    this.canvas = this.dialog.querySelector('.popup-canvas');
    if (this.canvas) {
      this.context = new wContext(this.canvas);
      this.canvasHelper = new cPanelCanvas(this);
      this.context.canvasHelper = this.canvasHelper;
    }

    this._splitViewAlive = true;
    this.initScene = true;
  }
  expandAll() {
    this.fireFields.helpers.expandAll();
  }
  collapseAll() {
    this.fireFields.helpers.collapseAll();
  }
  _delete() {
    if (!confirm('Are you sure you want to delete this ' + this.tag + '?'))
      return;

    gAPPP.a.modelSets[this.tag].removeByKey(this.key);
    this.renderPreview = false;

    this.close();
  }
  close() {
    if (this.fireFields)
      this.fireFields.active = false;
    if (this.sceneFireFields)
      this.sceneFireFields.active = false;

    if (this.renderPreview)
      if (this.context)
        this.context.renderPreview(this.tag, this.key);

    this.dialog.close();

    if (this.canvasHelper) {
      this.canvasHelper.stopAnimation();
      this.canvasHelper.sceneTools.expanded = true;
      this.canvasHelper.sceneTools.toggle();
    }
    gAPPP.mV.show();
  }
  save() {
    this.close();
  }
  show(key) {
    this.key = key;
    this.fireFields.values = this.fireSet.fireDataByKey[this.key].val();
    this.renderPreview = true;

    this._startLoad();
    this.dialog.showModal();

    this.rotateState = gAPPP.a.profile.editFormRotateState;
    if (!this.rotateState)
      this.rotateState = 'vertical';

    gAPPP.mV.closeHeaderBands();
    this._showFocus();

    if (this.initScene) {
      this.context.activate(null);

      if (this.tag === 'mesh') {
        this.__createRootBlock('mesh');
        this.rootBlock.loadMesh().then(
          mesh => this._finishShow(),
          err => this._finishShow());
        return;
      }
      if (this.tag === 'shape') {
        this.__createRootBlock('shape');
        this._finishShow();
        return;
      }
      if (this.tag === 'block') {
        if (this.fireFields.values.url) {
          this.context.loadSceneURL(this.fireFields.values.url).then(result => {
            this.__loadBlock();
          });
          return;
        }

        this.__loadBlock();
        return;
      }
      if (this.tag === 'material') {
        this.__createRootBlock('material');
        this._finishShow();
        return;
      }
      if (this.tag === 'texture') {
        this.__createRootBlock('texture');
        this._finishShow();
        return;
      }

      this._finishShow();
    } else
      this._finishShow();
  }
  __createRootBlock(staticType, key) {
    let b = new wBlock(this.context);
    b.staticType = staticType;
    b.staticLoad = true;
    if (key) {
      b.blockKey = key;
      b.isContainer = true;
    }
    this.context.setActiveBlock(b);
    this.rootBlock = b;
    this.canvasHelper.__updateVideoCallback();
    b.setData(this.fireFields.values);
  }
  __loadBlock() {
    this.__createRootBlock('block', this.key);

    this.rootElementDom.innerHTML = this.rootBlock.getBlockDimDesc();
    this.dialog.querySelector('.block-id-display-span').setAttribute('href', this.rootBlock.publishURL);

    this.childBand.refreshUIFromCache();
    this.childBand.setKey(null);

    this._finishShow();
  }
  _endLoad() {
    this._showDom(this.popupButtons);
    this._showDom(this.dataViewContainer);
    this._hideDom(this.progressBar);
    this.canvasHelper.cameraSelect.value = 'default';
    this.canvasHelper.show();

    this._splitView();
  }
  _finishShow() {
    this.rootBlock = this.context.activeBlock;
    if (this.canvasHelper)
      this.canvasHelper.logClear();

    if (this.fireFields) {
      this.fireFields.loadedURL = this.fireFields.values['url'];
      let sceneReloadRequired = this.fireFields.paint();
      this.fireFields.helpers.resetUI();
    }
    if (this.sceneFireFields) {
      this.sceneFireFields.paint();
      this.sceneFireFields.helpers.resetUI();
    }
    this._endLoad();
    this._showFocus();
    this.expandAll();

    this.context.scene.switchActiveCamera(this.context.camera, this.context.canvas);
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
