class cBandChildren extends cBandSuper {
  constructor(domContainer, parent, editPanel) {

    super(gAPPP.a.modelSets['blockchild'], 'blockchild');
    this.childrenContainer = domContainer;
    this.parent = parent;
    this.childEditPanel = editPanel;
    this.fireSet = gAPPP.a.modelSets['blockchild'];

    this.childFields = sDataDefinition.bindingFieldsCloned(this.tag);
    this.childEditFields = new cPanelData(this.childFields, this.childEditPanel, this);
    this.buttonWrapperPanel = document.createElement('div');
    this.buttonWrapperPanel.style.float = "left";
    this.deleteChildButton = document.createElement('button');
    this.deleteChildButton.innerHTML = '<i class="material-icons">delete</i> Child';
    this.deleteChildButton.style.float = 'left';
    this.deleteChildButton.style.clear = 'both';
    this.deleteChildButton.addEventListener('click', e => this.deleteChildBlock());
    this.buttonWrapperPanel.appendChild(this.deleteChildButton);
    this.childEditPanel.insertBefore(this.buttonWrapperPanel, this.childEditPanel.childNodes[0]);
  }
  _getDomForChild(fireData) {
    let d = document.createElement('button');
    d.setAttribute('class', 'block-editor-child');
    this.childrenContainer.appendChild(d);
    d.addEventListener('click', e => this.setKey(fireData.key));

    let html = '<span class="band-title"></span>';
    d.innerHTML = html;
    d.setAttribute('class', `${this.tag}-${fireData.key} block-editor-child`);

    this._nodeApplyValues(fireData.val(), d);
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
  deleteChildBlock() {
    if (confirm('Remove this child block?'))
      this.fireSet.removeByKey(this.key);
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
