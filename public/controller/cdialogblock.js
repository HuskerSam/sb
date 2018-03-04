class cDialogBlock extends cDialogEdit {
  constructor() {
    let d = document.createElement('dialog');
    d.innerHTML = document.getElementById('scene-builder-edit-dialog-template').innerHTML;
    d.setAttribute('class', 'modal-dialog');
    d.querySelector('.popup-title').innerHTML = 'Block Editor';
    document.body.appendChild(d);
    let canvasTemplate = document.getElementById('canvas-d3-player-template').innerHTML;
    d.querySelector('.popup-canvas-wrapper').innerHTML = canvasTemplate;
    d.classList.add('block-dialog-popup');

    let editPanelTemplate = document.getElementById('cblock-editor-panel-template');
    let editPanel = document.createElement('div');
    editPanel.setAttribute('class', 'cblock-editor-wrapper');
    editPanel.innerHTML = editPanelTemplate.innerHTML;
    let fieldsPanel = editPanel.querySelector('.cblock-details-panel');
    let old = d.querySelector('.edit-popup-fields');
    let b = d.querySelector('.popup-main-body');
    b.insertBefore(editPanel, old);
    b.removeChild(old);

    super(null);
    this.editMainPanel = editPanel;
    this._init(d, 'block', editPanel, fieldsPanel);
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

    this.framesPanel = this.dataViewContainer.querySelector('.frames-panel');
    this.framesPanelHeader = this.dataViewContainer.querySelector('.frames-header-fields-panel');
    this.framesBand = new cBandFrames(this.framesPanel, this, this.framesPanelHeader);
    this.sceneFields = sDataDefinition.bindingFieldsCloned('sceneFields');
    this.sceneFireFields = new cPanelData(this.sceneFields, this.framesPanelHeader, this);
    this.fireSet.childListeners.push((values, type, fireData) => this.sceneFireFields._handleDataChange(values, type, fireData));
    let clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    this.framesPanelHeader.appendChild(clearDiv);
    this.blockShowHideBtn = this.editMainPanel.querySelector('.block-scene-details-button');
    this.blockShowHideBtn.addEventListener('click', () => this.showHideSceneDetails());

    this.addChildButton = this.dataViewContainer.querySelector('.main-band-add-child');
    this.addChildButton.addEventListener('click', e => this.addChild());


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

    this.exportFramesDetailsPanel = this.dialog.querySelector('.export-frames-details-panel');
    this.exportFramesButton = this.dialog.querySelector('.ie-frames-details');
    this.exportFramesButton.style.display = 'inline-block';
    this.exportFramesButton.addEventListener('click', e => this.toggleFramesIEDisplay());
    this.iePanelShown = false;

    this.refreshExportButton = this.dialog.querySelector('.refresh-export-frames-button');
    this.refreshExportButton.addEventListener('click', e => this.refreshExportText())
    this.importButton = this.dialog.querySelector('.import-frames-button');
    this.importButton.addEventListener('click', e => this.importFramesFromText());
    this.dialog.querySelector('.canvas-actions .download-button').style.display = 'inline-block';
    this.ieTextArea = this.dialog.querySelector('.frames-textarea-export');
  }
  showHideSceneDetails() {
    if (this.framesPanelHeader.style.display === 'none') {
      this.framesPanelHeader.style.display = '';
      this.blockShowHideBtn.style.background = 'rgb(50,50,50)';
      this.blockShowHideBtn.style.color = 'white';
    } else {
      this.framesPanelHeader.style.display = 'none';
      this.blockShowHideBtn.style.background = 'rgb(240,240,240)';
      this.blockShowHideBtn.style.color = 'black';
    }
  }
  refreshExportText() {
    let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
    if (!block)
      block = this.rootBlock;
    let outFrames = [];
    for (let i in block.framesHelper.rawFrames)
      outFrames.push(block.framesHelper.rawFrames[i]);

    this.ieTextArea.value = JSON.stringify(outFrames).replace(/},/g, '},\n');
  }
  importFramesFromText() {
    let obj;
    let rawJSON = this.ieTextArea.value;
    try {
      obj = JSON.parse(rawJSON);
    } catch (e) {
      console.log('frames import error (JSON.parse)', e);
      alert('Error parsing JSON, refer to console for more details: ' + e.toString());
      return;
    }

    if (!Array.isArray(obj)) {
      alert('Frames need to be in an array');
    }

    let block = this.rootBlock.recursiveGetBlockForKey(this.childKey);
    if (!block)
      block = this.rootBlock;

    block.framesHelper.importFrames(obj);
  }
  toggleFramesIEDisplay() {
    if (this.iePanelShown) {
      this.iePanelShown = false;
      this.exportFramesDetailsPanel.style.display = 'none';
      this.exportFramesButton.style.background = 'rgb(240,240,240)';
      this.exportFramesButton.style.color = 'black';
    } else {
      this.iePanelShown = true;
      this.exportFramesDetailsPanel.style.display = 'flex';
      this.exportFramesButton.style.background = 'rgb(50,50,50)';
      this.exportFramesButton.style.color = 'white';
      this.refreshExportText();
    }
  }
  get activeAnimation() {
    return this.rootBlock.framesHelper.activeAnimation;
  }
  _updateContextWithDataChange(tag, values, type, fireData) {
    if (this.rootBlock) {
      this.rootBlock.handleDataUpdate(tag, values, type, fireData);
      this.rootElementDom.innerHTML = this.rootBlock.getBlockDimDesc();
      if (tag === 'blockchild')
        this._updateFollowTargetListOptions();
      if (tag === 'blockchild')
        this.rootBlock.updateCamera();
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
      this.editMainPanel.classList.add('root-block-display');
      this.editMainPanel.classList.remove('child-block-display');
      this.rootElementDom.classList.add('selected');

      if (this.detailsShown)
        this.fieldsContainer.style.display = 'block';
      this.context.setActiveBlock(this.rootBlock);
    } else {
      this.editMainPanel.classList.remove('root-block-display');
      this.editMainPanel.classList.add('child-block-display');
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
  _updateFollowTargetListOptions() {
    let optionText = '';
    let options = this.rootBlock.generateTargetFollowList();
    for (let i = 0; i < options.length; i++)
      optionText += '<option>' + options[i] + '</option>';

    document.getElementById('followblocktargetoptionslist').innerHTML = optionText;
  }
  show(key) {
    this.sceneFireFields.values = this.fireSet.fireDataByKey[key].val();
    super.show(key);
    this._updateFollowTargetListOptions();
  }
}
