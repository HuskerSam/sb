class cBandChildren extends cBandSuper {
  constructor(domContainer, parent, editPanel) {

    super(gAPPP.a.modelSets['blockchild'], 'blockchild');
    this.childrenContainer = domContainer;
    this.parent = parent;
    this.childEditPanel = editPanel;
    this.fireSet = gAPPP.a.modelSets['blockchild'];

    this.childFields = sDataDefinition.bindingFieldsCloned(this.tag);
    this.childEditFields = new cPanelData(this.childFields, this.childEditPanel, this);

    this.deleteChildButton = document.createElement('button');
    this.deleteChildButton.innerHTML = '<i class="material-icons">delete</i>';
    this.deleteChildButton.classList.add('btn-sb-icon');
    this.deleteChildButton.style.margin = '.5em';
    this.deleteChildButton.style.float = 'left';
    this.deleteChildButton.style.background = 'blue';
    this.deleteChildButton.style.color = 'white';

    this.deleteChildButton.addEventListener('click', e => this.deleteChildBlock(this.key, e));
    this.childEditPanel.insertBefore(this.deleteChildButton, this.childEditPanel.childNodes[0]);

    this.childEditFields._superUpdateDisplayFilters = this.childEditFields._updateDisplayFilters;
    this.childEditFields._updateDisplayFilters = () => this.__updateFieldsForAnimHeaderRow();
  }
  __updateFieldsForAnimHeaderRow() {
    this.childEditFields._superUpdateDisplayFilters();
    let fieldsFilter = sDataDefinition.getAnimFieldsFilter();
    let fieldList = null;
    if (this.parent.context.activeBlock.blockRawData.childType === 'camera')
      fieldList = fieldsFilter.blockCameraFields[this.parent.context.activeBlock.blockRawData.childName];
    if (this.parent.context.activeBlock.blockRawData.childType === 'light')
      fieldList = fieldsFilter.blockLightFields[this.parent.context.activeBlock.blockRawData.childName];

    if (!fieldList)
      fieldList = [];

    let groupList = ['camera', 'light', 'camera0', 'light0', 'camera1', 'lightsub', 'camera1', 'lightsubdif', 'lightsubspec', 'lightsubgnd', 'cameraArc', 'cameraFOV'];

    if (fieldList !== null) {
      for (let inner in this.childEditFields.fields) {
        let innerField = this.childEditFields.fields[inner];
        let key = innerField.fireSetField;

        if (groupList.indexOf(innerField.group) === -1)
          continue;

        if (fieldList.indexOf(key) !== -1)
          innerField.domContainer.style.display = 'inline-block';
        else
          innerField.domContainer.style.display = 'none';
      }

      for (let i in this.childEditFields.groups) {
        let childVisible = false;
        this.childEditFields.groups[i].style.display = 'none';
        let children = this.childEditFields.groups[i].childNodes;
        for (let ii = 0; ii < children.length; ii++)
          if (children[ii].style.display !== 'none') {
            this.childEditFields.groups[i].style.display = '';
            break;
          }
      }
    }
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
    if (type === 'change' || type === 'value')
      return this.childChanged(fireData);
    if (type === 'remove')
      return this.childRemoved(fireData);
  }
  _getDomForChild(key, values) {
    let d = document.createElement('div');
    d.setAttribute('class', 'block-editor-child');
    this.childrenContainer.insertBefore(d, this.childrenContainer.childNodes[0]);
    d.addEventListener('click', e => this.setKey(key));

    let html = '<span class="band-title"></span>';
    d.innerHTML = html;
    d.setAttribute('class', `${this.tag}-${key} block-editor-child`);

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
    if (confirm('Remove this child block (only the link)?'))
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
