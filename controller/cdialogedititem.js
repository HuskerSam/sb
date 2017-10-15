class cDialogEditItem extends cDialogSuper {
  constructor(tag, title) {
    let d = document.createElement('div');
    d.innerHTML = document.getElementById('scene-builder-edit-dialog-template').innerHTML;
    d.setAttribute('role', 'dialog');
    d.setAttribute('class', 'modal fade edit-modal');
    d.querySelector('.popup-title').innerHTML = title;

    super('#' + tag + '-details-dialog', tag, d);

    this._splitViewAlive = true;
    this.initScene = true;

    if (this.tag === 'block')
      this._addChildBlockList();
  }
  _addChildBlockList() {
    let childBar = document.createElement('div');
    let c = this.fieldsContainer;
    c.insertBefore(childBar, c.childNodes[0]);
    c.setAttribute('class', 'block-editor-children-bar-wrapper');
    let html = '<div class="block-editor-child options-button">4 x 2 x 2</div>';
    html += '<div class="block-editor-child add-button"><i class="material-icons">add</i></div>';
    html += '<div class="block-editor-child selected">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    html += '<div class="block-editor-child">M: mesh1</div>';
    childBar.innerHTML = html;
  }
  show(key) {
    this.key = key;
    this.fireFields.values = this.fireSet.fireDataByKey[this.key].val();

    if (!this.fireFields.values['renderImageURL'])
      this.fireSet.renderImageUpdateNeeded = true;
    super.show();
  }
}
