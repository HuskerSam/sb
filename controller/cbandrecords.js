class cBandRecords extends cBandSuper {
  constructor(tag, title) {
    super(gAPPP.a.modelSets[tag], tag);

    this.title = title;
    this.containerCollapsed = document.querySelector('#sb-floating-toolbar');
    this.containerExpanded = document.querySelector('#sb-floating-toolbar-expanded');
    let d = this.containerCollapsed.querySelector('#sb-floating-toolbar-item-template').cloneNode(true);
    this.wrapper = d.querySelector('.sb-floating-toolbar-item');

    this.wrapper.id = 'sb-' + this.tag + '-floating-toolbar-item';
    this.childrenContainer = this.wrapper.querySelector('.sb-floating-toolbar-content');
    this.containerCollapsed.appendChild(this.wrapper);
    this.titleDom = this.wrapper.querySelector('.button-title');
    this.titleDom.innerHTML = this.title;

    this.bar = this.wrapper.querySelector('.sb-floating-toolbar-content');
    this.createBtn = this.wrapper.querySelector('.sb-floating-toolbar-create-btn');

    this.titleDom.addEventListener('click', e => this.toggleChildBandDisplay(undefined, true));
    this.createBtn.addEventListener('click', e => this._showCreatePopup());

    this.buttonWrapper = this.wrapper.querySelector('.button-wrapper');

    let forceExpand = gAPPP.a.profile['mainRecordsExpanded' + this.tag];
    if (forceExpand)
      this.toggleChildBandDisplay(true);
  }
  _getDomForChild(key, values) {
    let html = '<div class="band-title"></div><br>'
    + '<button class="btn_toolbar_v2 toggle-btn"><i class="material-icons">chevron_right</i></button>'
    + '<div class="extend-panel" style="display:none;"></div>';

    let outer = document.createElement('div');
    outer.setAttribute('class', `band-background-preview`);
    outer.innerHTML = html.trim();
    let button = outer.childNodes[0];
    let exPanel = outer.querySelector('.extend-panel');
    let dd = document.createElement('div');
    dd.setAttribute('class', `${this.tag}-${key} menu-clipper-wrapper`);
    dd.appendChild(outer);
    let toggle = outer.querySelector('.toggle-btn');
    toggle.addEventListener('click', e => this.toggleState(toggle, exPanel));
    if (this.tag === 'block'){
        let btn = this.__addMenuItem(outer, 'switch_video', e => this._selectBlock(e, key));
        btn.classList.add('select-block-animation-button');
    }

    this.__addMenuItem(exPanel, 'edit', e => this._showEditPopup(e, key));
    this.__addMenuItem(exPanel, 'delete', e => this._removeElement(e, key), true);

    this._nodeApplyValues(values, outer);

    outer.addEventListener('dblclick', e => this._showEditPopup(e, key));
    this.childrenContainer.insertBefore(dd, this.childrenContainer.firstChild);
  }
  toggleState(tgl, pnl) {
    if (pnl.style.display === 'none') {
      pnl.style.display = '';
      tgl.innerHTML = '<i class="material-icons">chevron_left</i>';
    } else {
       pnl.style.display = 'none';
       tgl.innerHTML = '<i class="material-icons">chevron_right</i>';
    }
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
    if (gAPPP.dialogs[this.tag + '-edit'])
      return gAPPP.dialogs[this.tag + '-edit'].show(key);
  }
  _showCreatePopup() {
    gAPPP.dialogs[this.tag + '-create'].show();
  }
  toggleChildBandDisplay(forceValue = undefined, saveValue = false) {
    if (forceValue === undefined)
      forceValue = (this.bar.style.display !== 'inline-block');

    let expand = !forceValue;
    if (forceValue) {
      this.bar.style.display = 'inline-block';
      this.createBtn.style.display = 'inline-block';
      this.bar.parentNode.style.display = 'flex';
      this.buttonWrapper.classList.add('button-wrapper-invert');
      this.containerExpanded.insertBefore(this.bar.parentNode, null);
      this.wrapper.style.display = 'left';
    } else {
      this.bar.style.display = 'none';
      this.createBtn.style.display = 'none';
      this.bar.parentNode.style.display = 'inline-block';
      this.buttonWrapper.classList.remove('button-wrapper-invert');
      this.containerCollapsed.insertBefore(this.bar.parentNode, null);
      this.wrapper.style.float = '';
    }

    if (saveValue)
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'mainRecordsExpanded' + this.tag,
        newValue: forceValue
      }]);
  }
  __addMenuItem(button, title, clickHandler, prependDivider) {
    let btn = document.createElement('button');
    btn.innerHTML = '<i class="material-icons">' + title + '</i>';
    btn.classList.add('btn_toolbar_v2');
    button.appendChild(btn);
    btn.addEventListener('click', e => clickHandler(e), false);
    return btn;
  }
}
