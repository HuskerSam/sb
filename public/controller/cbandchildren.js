class cBandChildren extends bBand {
  constructor(childSelect, parent, editPanel) {

    super(gAPPP.a.modelSets['blockchild'], 'blockchild');
    this.childSelect = childSelect;
    this.parent = parent;
    this.childEditPanel = editPanel;
    this.fireSet = gAPPP.a.modelSets['blockchild'];

    this.childFields = sDataDefinition.bindingFieldsCloned(this.tag);
    this.childEditFields = new cPanelData(this.childFields, this.childEditPanel, this);
    this.fireSet.childListeners.push((values, type, fireData) => this.childEditFields._handleDataChange(values, type, fireData));

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

//    for (let i in children)
//      this._getDomForChild(i, children[i]);

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
  childChanged(fireData) {
    let div = document.querySelector('.' + this.tag + this.myKey + '-' + fireData.key);
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

    let post = this.childrenContainer.querySelector('.' + this.tag + this.myKey + '-' + fireData.key);
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
      let d = this.childrenContainer.querySelector(`.${this.tag}${this.myKey}-${this.parent.childKey}`);
      d.classList.add('selected');
    }

    this.key = childKey;
    this.childEditFields.paint(this.fireSet.getCache(this.key));
  }
}
