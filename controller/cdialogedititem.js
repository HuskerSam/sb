class cDialogEditItem extends cDialogSuper {
  constructor(tag, title) {
    let d = document.createElement('dialog');
    d.innerHTML = document.getElementById('scene-builder-edit-dialog-template').innerHTML;
    d.classList.add('modal-dialog');
    d.querySelector('.popup-title').innerHTML = title;
    document.body.appendChild(d);

    let canvasTemplate = document.getElementById('canvas-d3-player-template').innerHTML;
    d.querySelector('.popup-canvas-wrapper').innerHTML = canvasTemplate;

    let fieldsContainer = d.querySelector('.edit-popup-fields');
    super(d, tag, fieldsContainer, fieldsContainer);

    this._splitViewAlive = true;
    this.initScene = true;

    this.collapseAllButton = this.dialog.querySelector('.toggle-bands-up');
    this.collapseAllButton.addEventListener('click', e => this.collapseAll());
    this.expandAllButton = this.dialog.querySelector('.toggle-bands-down');
    this.expandAllButton.addEventListener('click', e => this.expandAll());
  }
  show(key) {
    this.key = key;
    this.fireFields.values = this.fireSet.fireDataByKey[this.key].val();

    if (!this.fireFields.values['renderImageURL'])
      this.fireSet.renderImageUpdateNeeded = true;
    super.show();
  }
}
