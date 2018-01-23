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
    this.expandBtn = this.wrapper.querySelector('.sb-floating-toolbar-expand-btn')

    this.expandBtn.addEventListener('click', e => this.toggleChildBandDisplay(undefined, true));
    this.titleDom.addEventListener('click', e => this.toggleChildBandDisplay(undefined, true));
    this.createBtn.addEventListener('click', e => this._showCreatePopup());

    let forceExpand = gAPPP.a.profile['mainRecordsExpanded' + this.tag];
    if (forceExpand)
      this.toggleChildBandDisplay(true);
  }
  _getDomForChild(key, values) {
    let html = `<div class="band-background-preview" type="button" data-toggle="dropdown">`;
    html += '<span class="band-title"></span></div>';
    html += '<ul class="dropdown-menu" role="menu">';
    html += '</ul>';

    let outer = document.createElement('div');
    outer.setAttribute('class', `band-background-outer dropdown`);
    outer.innerHTML = html.trim();
    let button = outer.childNodes[0];
    let ul = outer.childNodes[1];
    let dd = document.createElement('div');
    dd.setAttribute('class', `${this.tag}-${key} bs-menu-clipper-wrapper`);
    dd.appendChild(outer);

    if (this.tag === 'block') {
      this.__addMenuItem(ul, '<b>Select</b>', e => this._selectBlock(e, key));
    }

    this.__addMenuItem(ul, 'Edit', e => this._showEditPopup(e, key));
    this.__addMenuItem(ul, 'Clone', e => this._cloneElement(e, key));

    if (this.tag === 'texture') {
      this.__addMenuItem(ul, 'To Material', e => this._textureToMaterial(e, key), true);
      this.__addMenuItem(ul, 'To Shape', e => this._textureToShape(e, key), true);
    }
    if (this.tag === 'material') {
      this.__addMenuItem(ul, 'To Shape', e => this._materialToShape(e, key), true);
    }
    if (this.tag === 'mesh') {
      this.__addMenuItem(ul, 'Add To Scene', e => this.addMeshToScene(e, key), true);
    }
    if (this.tag === 'shape') {
      this.__addMenuItem(ul, 'Add To Scene', e => this.addShapeToScene(e, key), true);
    }

    this.__addMenuItem(ul, 'Remove', e => this._removeElement(e, key), true);

    this._nodeApplyValues(values, button);

    $(outer).on('show.bs.dropdown', function () {
      ul.style.left = button.offsetLeft - ul.parentElement.parentElement.parentElement.scrollLeft + 'px';
      ul.style.top = button.offsetTop + button.offsetHeight - 8 + 'px';
      ul.style.position = 'absolute';
    });
    outer.addEventListener('dblclick', e => this._showEditPopup(e, key));
    this.childrenContainer.insertBefore(dd, this.childrenContainer.firstChild);
  }
  _cloneElement(e, key) {
    gAPPP.a.modelSets[this.tag].cloneByKey(key).then(key => {});
  }
  _materialToShape(e, key) {
    alert('soon');
  }
  _removeElement(e, key) {
    if (!confirm('Are you sure you want to delete this ' + this.tag + '?'))
      return;
    gAPPP.a.modelSets[this.tag].removeByKey(key);
  }
  _selectBlock(e, key) {
    let updates = [{
      field: 'selectedBlockKey',
      newValue: key,
      oldValue: gAPPP.a.profile.selectedBlockKey
    }];
    gAPPP.a.modelSets['userProfile'].commitUpdateList(updates);
    gAPPP.mV._updateSelectedBlock(gAPPP.a.profile.selectedBlockKey);
  }
  _showEditPopup(e, key) {
    if (gAPPP.dialogs[this.tag + '-edit'])
      return gAPPP.dialogs[this.tag + '-edit'].show(key);
  }
  _showCreatePopup() {
    gAPPP.dialogs[this.tag + '-create'].show();
  }
  _textureToMaterial(e, key) {
    let materialData = sDataDefinition.getDefaultDataCloned('material');
    let textureSet = gAPPP.a.modelSets['texture'];
    let materialSet = gAPPP.a.modelSets['material'];
    let texture = textureSet.getCache(key);

    materialData.title = texture.title;
    materialData.diffuseTextureName = texture.title;

    materialSet.createWithBlobString(materialData).then(r => {});
  }
  _textureToShape(e, key) {
    let materialData = sDataDefinition.getDefaultDataCloned('material');
    let textureSet = gAPPP.a.modelSets['texture'];
    let materialSet = gAPPP.a.modelSets['material'];
    let texture = textureSet.getCache(key);

    materialData.title = texture.title;
    materialData.diffuseTextureName = texture.title;

    materialSet.createWithBlobString(materialData).then(r => {
      let shapeData = sDataDefinition.getDefaultDataCloned('shape');
      let shapeSet = gAPPP.a.modelSets['shape'];

      shapeData.title = texture.title;
      shapeData.materialName = texture.title;
      shapeSet.createWithBlobString(shapeData).then(r2 => {});
    });
  }
  toggleChildBandDisplay(forceValue = undefined, saveValue = false) {
    if (forceValue === undefined)
      forceValue = (this.bar.style.display !== 'inline-block');

    let expand = !forceValue;
    if (forceValue) {
      this.bar.style.display = 'inline-block';
      this.createBtn.style.display = 'inline-block';
      this.bar.parentNode.style.display = 'flex';
      this.expandBtn.querySelector('i').innerHTML = 'expand_more';
      this.containerExpanded.insertBefore(this.bar.parentNode, null);
      this.wrapper.style.display = 'left';
    } else {
      this.bar.style.display = 'none';
      this.createBtn.style.display = 'none';
      this.bar.parentNode.style.display = 'inline-block';
      this.expandBtn.querySelector('i').innerHTML = 'expand_less';
      this.containerCollapsed.insertBefore(this.bar.parentNode, null);
      this.wrapper.style.float = '';
    }

    if (saveValue)
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'mainRecordsExpanded' + this.tag,
        newValue: forceValue
      }]);
  }
  __addMenuItem(ul, title, clickHandler, prependDivider) {
    let html = '<a role="menuitem" tabindex="-1">' + title + '</a>';
    let li = document.createElement('li');
    li.innerHTML = html;
    li.setAttribute('role', 'presentation');
    if (prependDivider) {
      let di = document.createElement('li');
      di.setAttribute('role', 'presentation');
      di.classList.add('divider');
      ul.appendChild(di);
    }
    ul.appendChild(li);
    li.querySelector('a').addEventListener('click', e => clickHandler(e), false);
  }
}
