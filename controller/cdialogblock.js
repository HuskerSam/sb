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

    super(d, 'block', editPanel, fieldsPanel);
    this._constructor();
  }
  _constructor() {
    this._splitViewAlive = true;
    this.initScene = true;
    this.childKey = null;

    this.rootElementDom = this.dataViewContainer.querySelector('.main-band-details-element');
    this.rootElementDom.addEventListener('click', e => this.childBand.setKey(null));
    this.childBandDom = this.dataViewContainer.querySelector('.main-band-flex-children');
    this.childEditPanel = this.dataViewContainer.querySelector('.cblock-child-details-panel');
    this.childBand = new cBandChildren(this.childBandDom, this, this.childEditPanel);

    this.addChildButton = this.dataViewContainer.querySelector('.main-band-add-child');
    this.addChildButton.addEventListener('click', e => this.addChild());

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
    gAPPP.a.modelSets['frame'].childListeners.push(
      (values, type, fireData) => this._updateContextWithDataChange('frame', values, type, fireData));
    this._addAnimationContext();
  }
  _addAnimationContext() {
    this.animateButton = this.dialog.querySelector('.animate-button');
    this.animateButton.addEventListener('click', e => this.showAnimation());

    this.playButton = this.dialog.querySelector('.play-button');
    this.playButton.addEventListener('click', e => this.playAnimation());

    this.animateCanvas = this.dialog.querySelector('.animate-canvas');
    this.animateSlider = this.dialog.querySelector('.animate-range');
    this.animateCloseButton = this.dialog.querySelector('.animate-close');
    this.animateCloseButton.addEventListener('click', e => this.hideAnimation());
  }
  playAnimation() {
    this.context.activeBlock.framesHelper.processAnimationFrames();
    this.context.scene.beginAnimation(this.rootBlock.sceneObject, 0, 100, true);
  }
  showAnimation() {
    this.animateButton.style.display = 'none';
    this.playButton.style.display = '';
    this.animateSlider.style.display = '';
    this.animateCloseButton.style.display = '';

    this.animateHelper = new wAnimate(this);
  }
  hideAnimation() {
    this.animateButton.style.display = '';
    this.playButton.style.display = 'none';
    this.animateSlider.style.display = 'none';
    this.animateCloseButton.style.display = 'none';
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.rootBlock) {
      this.rootBlock.handleDataUpdate(tag, values, type, fireData);
      this.rootElementDom.innerHTML = this.rootBlock.getBlockDimDesc();
    }
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
  _handleActiveObjectUpdate(e) {}
  toggleDetails(saveValue = false) {
    this.detailsShown = !this.detailsShown;

    if (this.detailsShown) {
      this.fieldsContainer.style.display = '';
    } else {
      this.fieldsContainer.style.display = 'none';

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
  close() {
    this.fireSet.renderImageUpdateNeeded = true;
    super.close();
  }
  expandAll() {
    super.expandAll();
    this.detailsShown = false;
    this.toggleDetails(true);
    this.framesBand._updateFrameHelpersUI();
  }
  collapseAll() {
    super.collapseAll();
    this.detailsShown = true;
    this.toggleDetails(true);
    this.framesBand._updateFrameHelpersUI();
  }
}
