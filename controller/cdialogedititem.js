class cDialogEditItem extends cDialogSuper {
  constructor(tag, title) {
    let d = document.createElement('div');
    d.innerHTML = document.getElementById('scene-builder-edit-dialog-template').innerHTML;
    d.setAttribute('role', 'dialog');
    d.setAttribute('class', 'modal fade edit-modal');
    d.querySelector('.popup-title').innerHTML = title;

    let canvasTemplate = document.getElementById('canvas-d3-player-template').innerHTML;
    d.querySelector('.popup-canvas-wrapper').innerHTML = canvasTemplate;


    let fieldsContainer = d.querySelector('.edit-popup-fields');
    super(d, tag, fieldsContainer, fieldsContainer);

    this._splitViewAlive = true;
    this.initScene = true;
  }
  show(key) {
    this.key = key;
    this.fireFields.values = this.fireSet.fireDataByKey[this.key].val();

    if (!this.fireFields.values['renderImageURL'])
      this.fireSet.renderImageUpdateNeeded = true;
    super.show();
  }
}
