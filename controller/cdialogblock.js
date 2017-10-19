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
    this.childBand = new cBandChildren(this.childBandDom, this);
    this.panelFrames = new cPanelFrames();
    this.addChildButton = this.dataViewContainer.querySelector('.main-band-add-child');
    this.addChildButton.addEventListener('click', e => this.addChild());
    this.childEditPanel = this.dataViewContainer.querySelector('.cblock-child-details-panel');
  }
  addChild() {
    let childData = {};
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

    gAPPP.a.modelSets['blockchild'].setFilter(this.key);

    if (!this.fireFields.values['renderImageURL'])
      this.fireSet.renderImageUpdateNeeded = true;
    super.show();
    this.childBand.setKey(null);
  }
}
