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

    this._splitViewAlive = true;
    this.initScene = true;

    this.toggleDom = this.dataViewContainer.querySelector('.main-band-details-element');
    this.toggleDom.innerHTML = '4x2x2';
    this.childBandDom = this.dataViewContainer.querySelector('.main-band-flex-children');
    this.childBand = new cBandChildren(this.childBandDom);
    this.panelFrames = new cPanelFrames();
  }
  show(key) {
    this.key = key;
    this.fireFields.values = this.fireSet.fireDataByKey[this.key].val();

    if (!this.fireFields.values['renderImageURL'])
      this.fireSet.renderImageUpdateNeeded = true;
    super.show();
  }
}
