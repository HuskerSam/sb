class clsToolbarBandController {
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

    this.inited = false;
  }
  init() {
    if (this.inited)
      return;
    this.inited = true;
    let me = this;
    gAPPP.authorizationController.modelSets[this.tag].childListeners.push((fireData, type) => me.handleDataChange(fireData, type));
  }
  handleDataChange(fireData, type) {
    if (type === 'add')
      return this.childAdded(fireData);
    if (type === 'change')
      return this.childChanged(fireData);
    if (type === 'remove')
      return this.childRemoved(fireData);
  }
  toggle() {
    if (this.bar.style.display !== 'inline-block') {
      this.bar.style.display = 'inline-block';
      this.createBtn.style.display = 'inline-block';
      this.bar.parentNode.style.display = 'block';
      this.expandBtn.querySelector('i').innerHTML = 'expand_more';
      this.containerExpanded.insertBefore(this.bar.parentNode, null);
      this.wrapper.style.display = 'flex';
    } else {
      this.bar.style.display = 'none';
      this.createBtn.style.display = 'none';
      this.bar.parentNode.style.display = 'inline-block';
      this.expandBtn.querySelector('i').innerHTML = 'expand_less';
      this.containerCollapsed.insertBefore(this.bar.parentNode, null);
      this.wrapper.style.display = 'inline-block';
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
        if (binding.type === 'background-image'){
          element.style.backgroundImage = 'url("' + val + '")';
        }
      } catch (e) {
        console.log('clstoolbandcontroller.js', e, binding  );
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
    let html = `<div class="firebase-item ${this.tag}-${key} band-background-preview"><div class="band-title"></div>`;
    html += `<button class="band-remove-button btn-toolbar-icon"><i class="material-icons">delete</i></button>`;
    html += `<button class="band-details-button btn-toolbar-icon"><i class="material-icons">settings</i></button>`;
    html += `</div>`

    let outer = document.createElement('div');
    outer.innerHTML = html.trim();
    let newNode = outer.childNodes[0];
    this.nodeApplyValues(values, newNode);

    let remove_div = outer.querySelector('.band-remove-button');
    if (remove_div)
      remove_div.addEventListener('click', (e) => me.removeElement(e, key), false);

    let details_div = outer.querySelector('.band-details-button');
    if (details_div)
      details_div.addEventListener('click', (e) => me.showEditPopup(e, key), false);

    return newNode;
  }
  removeElement(e, key) {
    if (!confirm('Are you sure you want to delete this ' + this.tag + '?'))
      return;
    gAPPP.authorizationController.modelSets[this.tag].removeByKey(key);
  }
}
