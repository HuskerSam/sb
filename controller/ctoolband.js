class cToolband {
  constructor(tag, title) {
    this.tag = tag;
    this.title = title;
    this.bindingsList = [{
        dataName: 'title',
        type: 'innerText'
      },
      {
        dataName: 'renderImageURL',
        type: 'background-image',
        classKey: 'OUTER'
      }
    ];
    this.containerCollapsed = document.querySelector('#sb-floating-toolbar');
    this.containerExpanded = document.querySelector('#sb-floating-toolbar-expanded');
    let d = this.containerCollapsed.querySelector('#sb-floating-toolbar-item-template').cloneNode(true);
    this.wrapper = d.querySelector('.sb-floating-toolbar-item');

    this.wrapper.id = 'sb-' + this.tag + '-floating-toolbar-item';
    this.childrenContainer = this.wrapper.querySelector('.sb-floating-toolbar-content');
    this.containerCollapsed.appendChild(this.wrapper);
    this.wrapper.querySelector('.button-title').innerHTML = this.title;

    this.bar = this.wrapper.querySelector('.sb-floating-toolbar-content');
    this.createBtn = this.wrapper.querySelector('.sb-floating-toolbar-create-btn');
    this.expandBtn = this.wrapper.querySelector('.sb-floating-toolbar-expand-btn')

    this.expandBtn.addEventListener('click', e => this.toggle(), false);
    this.createBtn.addEventListener('click', e => this.showPopup(), false);

    gAPPP.a.modelSets[this.tag].childListeners.push((values, type, fireData) => this.handleDataChange(fireData, type));
  }
  childAdded(fireData) {
    this._createDOM(fireData);
  }
  childChanged(fireData) {
    let div = document.querySelector('.' + this.tag + '-' + fireData.key);
    let values = fireData.val();
    this.nodeApplyValues(values, div);
  }
  childRemoved(fireData) {
    let post = this.childrenContainer.querySelector('.' + this.tag + '-' + fireData.key);
    if (post)
      this.childrenContainer.removeChild(post);
  }
  cloneElement(e, key) {
    gAPPP.a.modelSets[this.tag].cloneByKey(key).then(key => {});
  }
  _createDOM(fireData) {
    let values = fireData.val();
    let key = fireData.key;
    let html = `<button class="firebase-item ${this.tag}-${key} band-background-preview" type="button" data-toggle="dropdown">`;
    html += '<span class="band-title"></span></button>';
    html += '<ul class="dropdown-menu" role="menu" aria-labelledby="menu1">';
    html += '</ul>';

    let outer = document.createElement('div');
    outer.classList.add('dropdown');
    outer.style.display = 'inline-block';
    outer.style.position = 'initial';
    outer.innerHTML = html.trim();
    let button = outer.childNodes[0];
    let ul = outer.childNodes[1];

    if (this.tag === 'scene') {
      this.__addMenuItem(ul, '<b>Select</b>', e => this.selectScene(e, key));
    }

    this.__addMenuItem(ul, 'Edit', e => this.showEditPopup(e, key));
    this.__addMenuItem(ul, 'Clone', e => this.cloneElement(e, key));

    if (this.tag === 'texture') {
      this.__addMenuItem(ul, 'To Material', e => this.textureToMaterial(e, key), true);
      this.__addMenuItem(ul, 'To Shape', e => this.textureToShape(e, key), true);
    }
    if (this.tag === 'material') {
      this.__addMenuItem(ul, 'To Shape', e => this.materialToShape(e, key), true);
    }
    if (this.tag === 'mesh') {
      this.__addMenuItem(ul, 'Add To Scene', e => this.addMeshToScene(e, key), true);
    }
    if (this.tag === 'shape') {
      this.__addMenuItem(ul, 'Add To Scene', e => this.addShapeToScene(e, key), true);
    }

    this.__addMenuItem(ul, 'Remove', e => this.removeElement(e, key), true);

    this.nodeApplyValues(values, button);

    $(outer).on('show.bs.dropdown', function () {
      ul.style.left = button.offsetLeft - ul.parentElement.parentElement.scrollLeft + 'px';
      ul.style.top = button.offsetTop + button.offsetHeight - 8 + 'px';
      ul.style.position = 'absolute';
    });

    this.childrenContainer.insertBefore(outer, this.childrenContainer.firstChild);
  }
  handleDataChange(fireData, type) {
    if (type === 'add')
      return this.childAdded(fireData);
    if (type === 'change')
      return this.childChanged(fireData);
    if (type === 'remove')
      return this.childRemoved(fireData);
  }
  materialToShape(e, key) {
    alert('soon');
  }
  nodeApplyValues(values, outer) {
    for (let i in this.bindingsList) {
      let binding = this.bindingsList[i];
      try {
        let classKey = binding.dataName;
        if (binding.classKey)
          classKey = binding.classKey;
        let element = outer.querySelector('.band-' + classKey);
        if (classKey === 'OUTER')
          element = outer;
        if (element === null)
          continue;
        let val = values[binding.dataName];
        if (val === undefined)
          continue;
        if (binding.type === 'innerText')
          element.innerText = val;
        if (binding.type === 'background-image') {
          element.style.backgroundImage = 'url("' + val + '")';
        }
      } catch (e) {
        console.log('clstoolbandcontroller.js', e, binding);
      }
    }
  }
  removeElement(e, key) {
    if (!confirm('Are you sure you want to delete this ' + this.tag + '?'))
      return;
    gAPPP.a.modelSets[this.tag].removeByKey(key);
  }
  selectScene(e, key) {
    let updates = [{
      field: 'selectedSceneKey',
      newValue: key,
      oldValue: gAPPP.a.profile.selectedSceneKey
    }];
    gAPPP.a.modelSets['userProfile'].commitUpdateList(updates);
  }
  showEditPopup(e, key) {
    if (gAPPP.dialogs[this.tag + '-edit'])
      return gAPPP.dialogs[this.tag + '-edit'].show(key);
  }
  showPopup() {
    gAPPP.dialogs[this.tag + '-create'].show();
  }
  textureToMaterial(e, key) {
    let materialData = sDataDefinition.getDefaultDataCloned('material');
    let textureSet = gAPPP.a.modelSets['texture'];
    let materialSet = gAPPP.a.modelSets['material'];
    let texture = textureSet.getCache(key);

    materialData.title = texture.title;
    materialData.diffuseTextureName = texture.title;

    materialSet.createWithBlobString(materialData).then(r => {});
  }
  textureToShape(e, key) {
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
  toggle(forceValue) {
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
