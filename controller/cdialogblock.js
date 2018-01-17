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

    this.stopButton.setAttribute('disabled', "true");
    this.pauseButton.setAttribute('disabled', "true");

    this.canvasActions = this.dialog.querySelector('.canvas-actions');
    this.canvasActions.style.display = '';
  }
  get activeAnimation() {
    return this.rootBlock.framesHelper.activeAnimation;
  }
  _addAnimationContext() {
    this.playButton = this.dialog.querySelector('.play-button');
    this.playButton.addEventListener('click', e => this.playAnimation());
    this.stopButton = this.dialog.querySelector('.stop-button');
    this.stopButton.addEventListener('click', e => this.stopAnimation());
    this.pauseButton = this.dialog.querySelector('.pause-button');
    this.pauseButton.addEventListener('click', e => this.pauseAnimation());

    this.animateSlider = this.dialog.querySelector('.animate-range');
    this.animateSlider.addEventListener('input', e => this.rootBlock.setAnimationPosition(this.animateSlider.value));
  }
  stopAnimation() {
    this.playButton.removeAttribute('disabled');
    this.stopButton.setAttribute('disabled', "true");
    this.pauseButton.setAttribute('disabled', "true");
    this.rootBlock.stopAnimation();

    this.activateSliderUpdates(false);
  }
  activateSliderUpdates(updateSlider = true) {
    this._updateSliderPosition();
    clearTimeout(this.sliderTimeout);

    if (updateSlider)
      this.sliderTimeout = setTimeout(() => {
        this._updateSliderPosition();
        this.activateSliderUpdates();
      }, 50);
  }
  _updateSliderPosition(startTimer = true) {
    let elapsed = 0;
    let total = 100;
    if (this.activeAnimation) {
      elapsed = this.activeAnimation._runtimeAnimations[0].currentFrame;
      total = this.activeAnimation.toFrame;
    }

    this.animateSlider.value = elapsed / total * 100.0;
  }
  pauseAnimation() {

    this.playButton.removeAttribute('disabled');
    this.stopButton.removeAttribute('disabled');
    this.pauseButton.setAttribute('disabled', "true");

    this.rootBlock.pauseAnimation();
    this.activateSliderUpdates(false);
  }
  playAnimation() {
    this.playButton.setAttribute('disabled', "true");
    this.pauseButton.removeAttribute('disabled');
    this.stopButton.removeAttribute('disabled');
    this.rootBlock.playAnimation(this.animateSlider.value);
    this.activateSliderUpdates();
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
