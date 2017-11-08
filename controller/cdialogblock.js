class cDialogBlock extends cDialogSuper {
  constructor() {
    let d = document.createElement('div');
    d.innerHTML = document.getElementById('scene-builder-edit-dialog-template').innerHTML;
    d.setAttribute('role', 'dialog');
    d.setAttribute('class', 'modal fade edit-modal');
    d.querySelector('.popup-title').innerHTML = 'Block Editor';

    let editPanelTemplate = document.getElementById('cblock-editor-panel-template');
    let editPanel = document.createElement('div');
    editPanel.setAttribute('class', 'cblock-editor-wrapper');
    editPanel.innerHTML = editPanelTemplate.innerHTML;
    let fieldsPanel = editPanel.querySelector('.cblock-details-panel');
    let old = d.querySelector('.fields-container');
    let b = d.querySelector('.popup-main-body');
    b.insertBefore(editPanel, old);
    b.removeChild(old);

    let compiledFramePanel = document.createElement('div');
    compiledFramePanel.classList.add('compiled-frames-panel');
    b.insertBefore(compiledFramePanel, editPanel);

    super(d, 'block', editPanel, fieldsPanel);

    this.compiledFramePanel = compiledFramePanel;
    this._constructor();
  }
  _constructor() {
    this._splitViewAlive = true;
    this.initScene = true;
    this.childKey = null;

    this.rootElementDom = this.dataViewContainer.querySelector('.main-band-details-element');
    this.rootElementDom.addEventListener('click', e => this.childBand.setKey(null));
    this.childBandDom = this.dataViewContainer.querySelector('.main-band-flex-children');
    this.toggleDetailsDom = this.dataViewContainer.querySelector('.main-band-toggle');
    this.toggleDetailsDom.innerHTML = '<i class="material-icons">expand_more</i>';
    this.detailsShown = true;
    this.toggleDetailsDom.addEventListener('click', e => this.toggleDetails(true));
    this.childEditPanel = this.dataViewContainer.querySelector('.cblock-child-details-panel');
    this.childBand = new cBandChildren(this.childBandDom, this, this.childEditPanel);

    this.addChildButton = document.createElement('button');
    this.addChildButton.innerHTML = '<i class="material-icons">add</i> Child Block';
    this.addChildButton.setAttribute('class', 'main-band-add-child');
    this.addChildButton.addEventListener('click', e => this.addChild());
    this.fieldsContainer.insertBefore(this.addChildButton, this.fieldsContainer.childNodes[0]);

    this.framesPanel = this.dataViewContainer.querySelector('.frames-panel');
    this.framesBand = new cBandFrames(this.framesPanel, this);

    document.addEventListener('contextRefreshActiveObject', e => this._handleActiveObjectUpdate(e), false);

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
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.rootBlock) {
      this.rootBlock.handleDataUpdate(tag, values, type, fireData);
      this.rootElementDom.innerHTML = this.rootBlock.getBlockDimDesc();
    }
  }
  _splitView() {
    if (!this._splitViewAlive)
      return;
    if (this.splitInstance)
      this.splitInstance.destroy();

    let t = this.dialog.querySelector('.popup-canvas-wrapper');
    let b = this.dataViewContainer;
    let b2 = this.compiledFramePanel;
    let mb = this.dialog.querySelector('.popup-main-body');

    if (this.rotateState === 'horizontal') {
      t.classList.add('vertical-split-display');
      b.classList.add('vertical-split-display');
      b2.classList.add('vertical-split-display');
    } else {
      t.classList.remove('vertical-split-display');
      b.classList.remove('vertical-split-display');
      b2.classList.remove('vertical-split-display');
    }

    this.splitInstance = window.Split([t, b2, b], {
      sizes: [40, 30, 30],
      gutterSize: 16,
      direction: this.rotateState,
      onDragEnd: () => this._splitDragEnd(),
      onDrag: () => this._splitDragEnd()
    });
    gAPPP.resize();
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
    this.fieldsContainer.style.display = 'none';

    if (this.childKey === null) {
      this.rootElementDom.classList.add('selected');

      if (this.detailsShown)
        this.fieldsContainer.style.display = 'block';
      this.context.setActiveBlock(this.rootBlock);
    } else {
      this.rootElementDom.classList.remove('selected');
      if (this.detailsShown)
        this.childEditPanel.style.display = 'block';

      let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
      if (block)
        this.context.setActiveBlock(block);
      else
        this.context.setActiveBlock(this.rootBlock);
    }

    this.framesBand.refreshUIFromCache();
  }
  _handleActiveObjectUpdate(e) {
    let desc = this.context.activeBlock.baseFrameDescription;
    this.framesBand.baseFrameInfoSpan.innerHTML = desc;
  }
  toggleDetails(saveValue = false) {
    this.detailsShown = !this.detailsShown;

    if (this.detailsShown) {
      this.fieldsContainer.style.display = '';
      this.toggleDetailsDom.innerHTML = '<i class="material-icons">expand_more</i>';
      this.toggleDetailsDom.classList.add('selected');
    } else {
      this.fieldsContainer.style.display = 'none';
      this.toggleDetailsDom.innerHTML = '<i class="material-icons">expand_less</i>';
      this.toggleDetailsDom.classList.remove('selected');
    }
    this.setChildKey(this.childKey);

    if (saveValue)
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'cDialogBlockToggleDetailsValue',
        newValue: this.detailsShown
      }]);
  }
  show(key) {
    this.key = key;
    this.fireFields.values = this.fireSet.fireDataByKey[this.key].val();

    if (!this.fireFields.values['renderImageURL'])
      this.fireSet.renderImageUpdateNeeded = true;
    super.show();

    this.rootElementDom.innerHTML = this.rootBlock.getBlockDimDesc();

    this.childBand.refreshUIFromCache();
    this.childBand.setKey(null);

    this.detailsShown = !gAPPP.a.profile.cDialogBlockToggleDetailsValue;
    this.toggleDetails();
  }
}
