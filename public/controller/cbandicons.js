class cBandIcons extends bBand {
  constructor(tag, dialog) {
    super(gAPPP.a.modelSets[tag], tag);
    this.fireSet = gAPPP.a.modelSets[tag];
    this.dialog = dialog;

    this.childrenContainer = document.createElement('div');
    this.childrenContainer.classList.add('sb-floating-toolbar-content');
    this.dialog.fieldsContainer.appendChild(this.childrenContainer);

    this.refreshUIFromCache();
  }
  childMoved(fireData) {
    let keyOrder = this.modelSet.childOrderByKey;
    for (let i in keyOrder) {
      let key = keyOrder[i];
      let div = document.querySelector('.' + this.tag + this.myKey + '-' + key);
      if (div)
        this.childrenContainer.appendChild(div);
    }
  }
  _getDomForChild(key, values) {
    let html = '<span class="img-holder"></span><div class="band-title"></div>';

    let outer = document.createElement('div');
    outer.setAttribute('class', `band-background-preview`);
    outer.innerHTML = html.trim();
    let button = outer.childNodes[0];
    let dd = document.createElement('div');
    dd.setAttribute('class', `${this.tag}${this.myKey}-${key} menu-clipper-wrapper`);
    dd.appendChild(outer);

    let b = this.__addMenuItem(outer, 'edit', e => this.selectItem(e, key));
    b.classList.add('show-edit-panel-button');
    b = this.__addMenuItem(outer, 'delete', e => this._removeElement(e, key), true);
    b.classList.add('delete-edit-panel-button');

    this._nodeApplyValues(values, outer);

    this.childrenContainer.insertBefore(dd, this.childrenContainer.firstChild);
  }
  _removeElement(e, key) {
    if (!confirm('Are you sure you want to delete this ' + this.tag + '?'))
      return;
    gAPPP.a.modelSets[this.tag].removeByKey(key);
  }
  selectItem(e, newKey) {
    this.dialog.dataview_record_key.value = newKey;
    this.dialog.updateSelectedRecord();
  }
  __addMenuItem(button, title, clickHandler, prependDivider) {
    let btn = document.createElement('button');
    btn.innerHTML = '<i class="material-icons">' + title + '</i>';
    btn.classList.add('btn-sb-icon');
    button.appendChild(btn);
    btn.addEventListener('click', e => clickHandler(e), false);
    return btn;
  }
}
