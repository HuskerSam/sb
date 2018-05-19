class cBandRecords extends bBand {
  constructor(tag, title, dialog) {
    super(gAPPP.a.modelSets[tag], tag);

    this.dialog = dialog;
    this.title = title;
    this.containerExpanded = document.querySelector('#sb-floating-toolbar-expanded');
    let d = document.querySelector('#sb-floating-toolbar-item-template').cloneNode(true);
    this.wrapper = d.querySelector('.sb-floating-toolbar-item');

    this.wrapper.id = 'sb-' + this.tag + '-floating-toolbar-item';
    this.childrenContainer = this.wrapper.querySelector('.sb-floating-toolbar-content');
    this.containerExpanded.appendChild(this.wrapper);
    this.titleDom = this.wrapper.querySelector('.button-title');
    this.titleDom.innerHTML = this.title;

    this.bar = this.wrapper.querySelector('.sb-floating-toolbar-content');

    this.titleDom.addEventListener('click', e => this.toggleChildBandDisplay(undefined, true));
    this.buttonWrapper = this.wrapper.querySelector('.button-wrapper');

    this.addButton = this.wrapper.querySelector('.button-add-item');
    this.addButton.addEventListener('click', e => this.addRecord());

    this.toggleChildBandDisplay(gAPPP.a.profile['mainRecordsExpanded' + this.tag]);
  }
  addRecord() {
    this.dialog.context.createObject(this.tag, 'new ' + this.tag).then(results => {
      gAPPP.dialogs[this.tag + '-edit'].show(results.key);
    });
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
    if (this.tag === 'block') {
      let btn = this.__addMenuItem(outer, 'switch_video', e => this._selectBlock(e, key));
      btn.classList.add('select-block-animation-button');
    }

    let b = this.__addMenuItem(outer, 'edit', e => this._showEditPopup(e, key));
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
  _selectBlock(e, key) {
    let field = 'selectedBlockKey' + gAPPP.a.profile.selectedWorkspace;
    let updates = [{
      field,
      newValue: key,
      oldValue: gAPPP.a.profile.selectedBlockKey
    }];
    gAPPP.a.modelSets['userProfile'].commitUpdateList(updates);
    gAPPP.mV._updateSelectedBlock(key);
  }
  _showEditPopup(e, key) {
    if (gAPPP.dialogs[this.tag + '-edit']) {
      gAPPP.mV.canvasHelper.hide();
      setTimeout(() => gAPPP.dialogs[this.tag + '-edit'].show(key), 10);
    }
  }
  toggleChildBandDisplay(expandValue = undefined, saveValue = false) {
    if (expandValue === undefined)
      expandValue = (this.bar.style.display !== 'inline-block');

    let tI = this.dialog.toolbarItems;
    this.expandValue = expandValue;
    this.bar.parentNode.style.display = 'flex';
    this.buttonWrapper.classList.add('button-wrapper-invert');
    this.wrapper.style.display = 'left';

    if (expandValue) {
      this.bar.style.display = 'inline-block';
      this.buttonWrapper.classList.add('button-wrapper-invert');
    } else {
      this.bar.style.display = 'none';
      this.buttonWrapper.classList.remove('button-wrapper-invert');
    }

    if (saveValue)
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'mainRecordsExpanded' + this.tag,
        newValue: expandValue
      }]);
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
