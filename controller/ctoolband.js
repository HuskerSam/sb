class cToolband {
  constructor(tag, title) {
    let me = this;
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

    this.expandBtn.addEventListener('click', (e) => me.toggle(), false);
    this.createBtn.addEventListener('click', (e) => me.showPopup(), false);

    gAPPP.a.modelSets[this.tag].childListeners.push((values, type, fireData) => me.handleDataChange(fireData, type));
  }
  handleDataChange(fireData, type) {
    if (type === 'add')
      return this.childAdded(fireData);
    if (type === 'change')
      return this.childChanged(fireData);
    if (type === 'remove')
      return this.childRemoved(fireData);
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
  showPopup() {
    gAPPP.dialogs[this.tag + '-create'].show();
  }
  childAdded(fireData) {
    this.childrenContainer.insertBefore(this.createDOM(fireData), this.childrenContainer.firstChild);
  }
  childChanged(fireData) {
    let div = document.querySelector('.' + this.tag + '-' + fireData.key);
    let values = fireData.val();
    this.nodeApplyValues(values, div);
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
  showEditPopup(e, key) {
    if (gAPPP.dialogs[this.tag + '-edit'])
      return gAPPP.dialogs[this.tag + '-edit'].show(key);
  }
  childRemoved(fireData) {
    let post = this.childrenContainer.querySelector('.' + this.tag + '-' + fireData.key);
    if (post)
      this.childrenContainer.removeChild(post);
  }
  createDOM(fireData) {
    let me = this;
    let values = fireData.val();
    let key = fireData.key;
    let html = `<div class="firebase-item ${this.tag}-${key} band-background-preview">`;

    html += '<div class="dropdown band-menu-button">';
    html += '<button class="btn-toolbar-icon" type="button" data-toggle="dropdown">';
    html += '<i class="material-icons">menu</i></button>';
    html += '<ul class="dropdown-menu" role="menu" aria-labelledby="menu1">';
    html += '</ul>';
    html += '</div>';
    html += `<br><div class="band-title"></div>`;
    html += `</div>`

    let outer = document.createElement('div');
    outer.innerHTML = html.trim();
    let newNode = outer.childNodes[0];

    let ul = newNode.querySelector('ul');

    if (this.tag === 'scene') {
      this.__addMenuItem(ul, 'Select', e => me.selectScene(e, key));
    }

    this.__addMenuItem(ul, 'Edit', e => me.showEditPopup(e, key));
    this.__addMenuItem(ul, 'Clone', e => me.cloneElement(e, key));

    if (this.tag === 'texture') {
      this.__addMenuItem(ul, 'To Material', e => me.textureToMaterial(e, key), true);
      this.__addMenuItem(ul, 'To Shape', e => me.textureToShape(e, key), true);
    }
    if (this.tag === 'material') {
      this.__addMenuItem(ul, 'To Shape', e => me.materialToShape(e, key), true);
      this.__addMenuItem(ul, 'To Mesh', e => me.materialToShape(e, key));
    }
    if (this.tag === 'mesh') {
      this.__addMenuItem(ul, 'To Scene', e => me.materialToShape(e, key), true);
    }

    this.__addMenuItem(ul, 'Remove', e => me.removeElement(e, key), true);

    this.nodeApplyValues(values, newNode);

    return newNode;
  }
  selectScene(e, key) {
    let updates = [{
      field: 'selectedSceneKey',
      newValue: key,
      oldValue: gAPPP.a.profile.selectedSceneKey
    }];
    gAPPP.a.modelSets['userProfile'].commitUpdateList(updates);
  }
  textureToMaterial(e, key) {
    alert('soon');
  }
  materialToShape(e, key) {
    alert('soon');
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
  cloneElement(e, key) {
    gAPPP.a.modelSets[this.tag].cloneByKey(key).then(key => {});
  }
  removeElement(e, key) {
    if (!confirm('Are you sure you want to delete this ' + this.tag + '?'))
      return;
    gAPPP.a.modelSets[this.tag].removeByKey(key);
  }
}
