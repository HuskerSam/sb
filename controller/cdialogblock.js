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
    this.rootElementDom.innerHTML = '<i class="material-icons">developer_board</i>';
    this.rootElementDom.addEventListener('click', e => this.childBand.setKey(null));
    this.childBandDom = this.dataViewContainer.querySelector('.main-band-flex-children');
    this.toggleDetailsDom = this.dataViewContainer.querySelector('.main-band-toggle');
    this.toggleDetailsDom.innerHTML = '<i class="material-icons">expand_more</i>';
    this.detailsShown = true;
    this.toggleDetailsDom.addEventListener('click', e => this.toggleDetails());
    this.childEditPanel = this.dataViewContainer.querySelector('.cblock-child-details-panel');
    this.childBand = new cBandChildren(this.childBandDom, this, this.childEditPanel);
    this.addChildButton = this.dataViewContainer.querySelector('.main-band-add-child');
    this.addChildButton.addEventListener('click', e => this.addChild());

    this.framesPanel = this.dataViewContainer.querySelector('.frames-panel');
    this.framesBand = new cBandFrames(this.framesPanel, this);

    this.addRootFrameButton = document.createElement('button');
    this.addRootFrameButton.innerHTML = '<i class="material-icons">add</i> Block Frame';
    this.addRootFrameButton.setAttribute('class', '');
    this.addRootFrameButton.style.float = 'left';
    this.fieldsContainer.insertBefore(this.addRootFrameButton, this.fieldsContainer.childNodes[0]);
    this.addRootFrameButton.addEventListener('click', e => this.addFrame(this.key));

    this.addChildFrameButton = document.createElement('button');
    this.addChildFrameButton.innerHTML = '<i class="material-icons">add</i> Child Frame';
    this.addChildFrameButton.style.float = 'left';
    this.addChildFrameButton.style.clear = 'both';
    this.addChildFrameButton.setAttribute('class', '');
    this.childBand.buttonWrapperPanel.appendChild(this.addChildFrameButton);
    this.addChildFrameButton.addEventListener('click', e => this.addFrame(this.childKey));
  }
  addFrame(parentKey) {
      let objectData = sDataDefinition.getDefaultDataCloned('frame');
      objectData.parentKey = parentKey;
      gAPPP.a.modelSets['frame'].createWithBlobString(objectData).then(r => {

      });
  }
  addChild() {
    let objectData = sDataDefinition.getDefaultDataCloned('blockchild');
    objectData.parentKey = this.key;
    gAPPP.a.modelSets['blockchild'].createWithBlobString(objectData).then(r => {

    });
  }
  setChildKey(key) {
    this.childKey = key;
    if (this.childKey === null) {
      this.fieldsContainer.style.display = 'block';
      this.childEditPanel.style.display = 'none';
      this.rootElementDom.classList.add('selected');
    } else {
      this.fieldsContainer.style.display = 'none';
      this.childEditPanel.style.display = 'block';
      this.rootElementDom.classList.remove('selected');
    }
    this.framesBand.refreshUIFromCache();
  }
  toggleDetails() {
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
  }
  show(key) {
    this.key = key;
    this.fireFields.values = this.fireSet.fireDataByKey[this.key].val();

    if (!this.fireFields.values['renderImageURL'])
      this.fireSet.renderImageUpdateNeeded = true;
    super.show();

    this.childBand.refreshUIFromCache();
    this.childBand.setKey(null);
  }
}
