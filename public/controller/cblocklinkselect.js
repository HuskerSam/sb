class cBlockLinkSelect extends bBand {
  constructor(childSelect, parent, editPanel, childExpandedBand, noEditFields = false) {

    super(gAPPP.a.modelSets['blockchild'], 'blockchild');
    this.childSelect = childSelect;
    this.parent = parent;
    this.childEditPanel = editPanel;
    this.fireSet = gAPPP.a.modelSets['blockchild'];
    this.childExpandedBand = childExpandedBand;

    this.childFields = sDataDefinition.bindingFieldsCloned(this.tag);
    if (noEditFields)
      this.childFields = [];
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

    if (this.parent.context.activeBlock.blockRawData.childType === 'camera') {
      let map = {};
      this.childEditFields.fields.forEach(i => map[i.fireSetField] = i);

      if (map['cameraType'].dom.value !== 'FollowCamera')
        map['cameraTargetBlock'].domContainer.style.display = 'none';
      else
        map['cameraTargetBlock'].domContainer.style.display = 'inline-block';
    }
  }
  handleDataChange(fireData, type) {
    if (fireData.val().parentKey !== this.parent.key)
      return;

    this.refreshUIFromCache();
  }
  refreshUIFromCache() {
    let children = this.fireSet.queryCache('parentKey', this.parent.key);

    let title = 'main';
    let html = '';
    for (let i in children)
      html = `<option value="${i}">Linked ${children[i].childType}:${children[i].childName}</option>` +
      html;

    html = `<option value="">Block: ${title} [${this.parent.rootBlock.getBlockDimDesc()}]</option>` +
      html;

    this.childSelect.innerHTML = html;
    if (this.parent.childKey)
      this.childSelect.value = this.parent.childKey;
    else
      this.childSelect.selectedIndex = 0;

    this._refreshChildBandFromCache(children);
  }
  setKey(childKey) {
    this.parent.setChildKey(childKey);

    if (childKey)
      this.childSelect.value = childKey;
    else
      this.childSelect.selectedIndex = 0;

    this.key = (childKey) ? childKey : null;
    this.childEditFields.paint(this.fireSet.getCache(this.key));
    this._refreshChildBandFromCache();
  }
  _refreshChildBandFromCache(children) {
    this.childExpandedBand.innerHTML = '';
    if (!children)
      children = this.fireSet.queryCache('parentKey', this.parent.key);

    let keyEle = null;
    let addDom = (key, values) => {
      let d = document.createElement('a');
      this.childExpandedBand.insertBefore(d, this.childExpandedBand.childNodes[0]);


      let html = '';
      if (!this.key)
        this.key = null;

      if (key)
        html += `<i class="material-icons">link</i>${values.childName + ' (' + values.childType + ')'}`;
      else
        html += '<i class="material-icons">trip_origin</i>';
      d.innerHTML = html;
      let className = `${this.tag}${this.myKey}-${key} block-editor-child app-panel`;
      if (this.key === key) {
        className += ' app-inverted';
        keyEle = d;
      }
      d.setAttribute('class', className);
      d.addEventListener('click', e => {
        this.setKey(key);
        this.childSelect.focus();
      });
      return d;
    }

    for (let i in children)
      addDom(i, children[i]);
    let root = addDom(null);
    if (!keyEle) {
      keyEle = root;
      root.classList.add('app-inverted');
    }

    setTimeout(() => keyEle.scrollIntoView({behavior: "smooth", inline: "center"}), 1);
  }
}
