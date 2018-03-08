class cBandRecords extends bBand {
  constructor(tag, title, dialog) {
    super(gAPPP.a.modelSets[tag], tag);

    this.dialog = dialog;
    this.title = title;
    this.containerCollapsed = document.querySelector('#sb-floating-toolbar');
    this.containerExpanded = document.querySelector('#sb-floating-toolbar-expanded');
    let d = document.querySelector('#sb-floating-toolbar-item-template').cloneNode(true);
    this.wrapper = d.querySelector('.sb-floating-toolbar-item');

    this.wrapper.id = 'sb-' + this.tag + '-floating-toolbar-item';
    this.childrenContainer = this.wrapper.querySelector('.sb-floating-toolbar-content');
    this.containerCollapsed.appendChild(this.wrapper);
    this.titleDom = this.wrapper.querySelector('.button-title');
    this.titleDom.innerHTML = this.title;

    this.bar = this.wrapper.querySelector('.sb-floating-toolbar-content');

    this.titleDom.addEventListener('click', e => this.toggleChildBandDisplay(undefined, true));
    this.buttonWrapper = this.wrapper.querySelector('.button-wrapper');

    let forceExpand = gAPPP.a.profile['mainRecordsExpanded' + this.tag];
    if (forceExpand)
      this.toggleChildBandDisplay(true);
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
    if (gAPPP.dialogs[this.tag + '-edit']){
      gAPPP.mV.canvasHelper.hide();
      setTimeout(() => gAPPP.dialogs[this.tag + '-edit'].show(key), 10);
    }
  }
  toggleChildBandDisplay(expandValue = undefined, saveValue = false) {
    if (expandValue === undefined)
      expandValue = (this.bar.style.display !== 'inline-block');

    let tI = this.dialog.toolbarItems;
    this.expandValue = expandValue;
    if (expandValue) {
      this.bar.style.display = 'inline-block';
      this.bar.parentNode.style.display = 'flex';
      this.buttonWrapper.classList.add('button-wrapper-invert');

      let nextSibling = this.containerExpanded.childNodes[0];
      for (let i in tI) {
        if (tI[i] === this)
          break;

        if (tI[i].expandValue)
          nextSibling = tI[i].bar.parentNode.nextSibling;
      }
      this.containerExpanded.insertBefore(this.bar.parentNode, nextSibling);
      this.wrapper.style.display = 'left';
    } else {
      this.bar.style.display = 'none';
      this.bar.parentNode.style.display = 'inline-block';
      this.buttonWrapper.classList.remove('button-wrapper-invert');
      this.wrapper.style.float = '';

      let nextSibling = this.containerCollapsed.childNodes[0];
      for (let i in tI) {
        if (tI[i] === this)
          break;

        if (!tI[i].expandValue)
          nextSibling = tI[i].bar.parentNode.nextSibling;
      }
      this.containerCollapsed.insertBefore(this.bar.parentNode, nextSibling);
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
