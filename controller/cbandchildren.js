class cBandChildren extends cBandSuper {
  constructor(domContainer, parent, editPanel) {

    super(gAPPP.a.modelSets['blockchild'], 'blockchild');
    this.childrenContainer = domContainer;
    this.parent = parent;
    this.childEditPanel = editPanel;
    this.fireSet = gAPPP.a.modelSets['blockchild'];

    this.childFields = sDataDefinition.bindingFieldsCloned(this.tag);
    this.childEditFields = new cPanelData(this.childFields, this.childEditPanel, this);
  }
  refreshUIFromCache() {
    this.clearChildren();
    let children = this.fireSet.queryCache('parentKey', this.parent.key);

    for (let i in children)
      this._getDomForChild(i, children[i]);
  }
  handleDataChange(fireData, type) {
    if (type === 'clear')
      return this.clearChildren();

    if (fireData.val().parentKey !== this.parent.key)
      return;

    if (type === 'add')
      return this.childAdded(fireData);
    if (type === 'change')
      return this.childChanged(fireData);
    if (type === 'remove')
      return this.childRemoved(fireData);
  }
  _getDomForChild(key, values) {
    let d = document.createElement('div');
    d.setAttribute('class', 'block-editor-child');
    this.childrenContainer.appendChild(d);
    d.addEventListener('click', e => this.setKey(key));

    let html = '<span class="band-title"></span>';
    d.innerHTML = html;
    d.setAttribute('class', `${this.tag}-${key} block-editor-child`);

    this.deleteChildButton = document.createElement('button');
    this.deleteChildButton.innerHTML = '<i class="material-icons">delete</i>';
    let deleteKey = key;
    this.deleteChildButton.addEventListener('click', e => this.deleteChildBlock(deleteKey, e));
    d.appendChild(this.deleteChildButton);

    this._nodeApplyValues(values, d);
  }
  childChanged(fireData) {
    let div = document.querySelector('.' + this.tag + '-' + fireData.key);
    let values = fireData.val();
    this._nodeApplyValues(values, div);
  }
  _nodeApplyValues(values, div) {
    super._nodeApplyValues(values, div);

    let ele = div.querySelector('.band-title');
    ele.innerHTML = values.childType + ':' + values.childName;
  }
  childRemoved(fireData) {
    if (this.key === fireData.key)
      this.setKey(null);

    let post = this.childrenContainer.querySelector('.' + this.tag + '-' + fireData.key);
    if (post)
      this.childrenContainer.removeChild(post);
  }
  deleteChildBlock(deleteKey, e) {
    if (confirm('Remove this child block?'))
      this.fireSet.removeByKey(deleteKey);

    if (e)
      e.stopPropagation();
  }
  setKey(childKey) {
    this.parent.setChildKey(childKey);

    let selected = this.childrenContainer.querySelectorAll('.block-editor-child.selected');
    for (let c = 0, l = selected.length; c < l; c++) selected[c].classList.remove('selected');

    if (this.parent.childKey) {
      let d = this.childrenContainer.querySelector(`.${this.tag}-${this.parent.childKey}`);
      d.classList.add('selected');
    }

    this.key = childKey;
    this.childEditFields.paint(this.fireSet.getCache(this.key));
  }
}
