class cBandSelect extends bBand {
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

    this.childSelect.addEventListener('change', e => this.selectedIndexChanged());
  }
  selectedIndexChanged() {
    if (this.childSelect.selectedIndex < 1)
      this.setKey(null);
    else
      this.setKey(this.childSelect.value);
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
  handleDataChange(fireData, type) {
    if (fireData.val().parentKey !== this.parent.key)
     return;

    this.updateSelectDom();
  }
  updateSelectDom() {
    let children = this.fireSet.queryCache('parentKey', this.parent.key);

    let title = 'main';
    let html = `<option value="">Block: ${title}</option>`;
    for (let i in children)
      html += `<option value="${i}">Linked ${children[i].childType}:${children[i].childName}</option>`

    this.childSelect.innerHTML = html;
    if (this.parent.childKey)
      this.childSelect.value = this.parent.childKey;
    else
      this.childSelect.selectedIndex = 0;
  }
  deleteChildBlock(deleteKey, e) {
    if (confirm('Remove this child block (only the link)?'))
      this.fireSet.removeByKey(deleteKey);

    if (e)
      e.stopPropagation();
  }
  setKey(childKey) {
    this.parent.setChildKey(childKey);

    if (childKey)
      this.childSelect.value = childKey;
    else
      this.childSelect.selectedIndex = 0;

    this.key = childKey;
    this.childEditFields.paint(this.fireSet.getCache(this.key));
  }
}
