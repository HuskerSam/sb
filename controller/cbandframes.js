class cBandFrames extends cBandSuper {
  constructor(childrenContainer, parent) {
    super(gAPPP.a.modelSets['frame'], 'frame');
    this.fireSet = gAPPP.a.modelSets['frame'];
    this.childrenContainer = childrenContainer;
    this.frameDataViewInstances = {};
    this.framesHelper = new wFrames();
    this.parent = parent;
  }
  _getDomForChild(key, values) {
    let framesContainer = document.createElement('div');
    framesContainer.setAttribute('class', 'frame-fields-container');

    let instance = {};
    instance.frameFields = sDataDefinition.bindingFieldsCloned('frame');
    instance.key = key;
    instance.tag = 'frame';
    instance.fireSet = this.fireSet;
    instance.framesContainer = framesContainer;
    instance.dataPanel = new cPanelData(instance.frameFields, framesContainer, instance);
    instance.childListener = (values, type, fireData) => instance.dataPanel._handleDataChange(values, type, fireData);
    this.fireSet.childListeners.push(instance.childListener);
    this.frameDataViewInstances[key] = instance;

    let deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="material-icons">delete</i>';
    deleteButton.setAttribute('class', 'btn delete-button');
    deleteButton.addEventListener('click', e => this._removeFrame(instance));
    framesContainer.appendChild(deleteButton);
    let clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    framesContainer.appendChild(clearDiv);
    this.childrenContainer.appendChild(framesContainer);
    instance.dataPanel.paint(values);
  }
  __getKey() {
    let filter = this.parent.childKey;
    if (!filter)
      filter = this.parent.key;
    return filter;
  }
  refreshUIFromCache() {
    this.clearChildren();

    let children = this.fireSet.queryCache('parentKey', this.__getKey());

    for (let i in children)
      this._getDomForChild(i, children[i]);

    this._sortFrames();
  }
  handleDataChange(fireData, type) {
    if (type === 'clear')
      return this.clearChildren();

    if (fireData.val().parentKey !== this.__getKey())
      return;

    let result = null;
    if (type === 'add')
      result = this.childAdded(fireData);
    if (type === 'change')
      result = this.childChanged(fireData);
    if (type === 'remove')
      result = this.childRemoved(fireData);

    this._sortFrames();

    return result;
  }
  childChanged(fireData) {
    //edit fields handle this
  }
  _removeFrame(instance) {
    if (confirm('Delete this frame?'))
      this.fireSet.removeByKey(instance.key)
  }
  clearChildren() {
    for (let i in this.frameDataViewInstances)
      this.__removeInst(this.frameDataViewInstances[i]);

    this.frameDataViewInstances = {};
    super.clearChildren();
  }
  __removeInst(inst) {
    for (let c = 0, l = this.fireSet.childListeners.length; c < l; c++) {
      if (this.fireSet.childListeners[c] === inst.childListener) {
        this.fireSet.childListeners.splice(c, 1);
        break;
      }
    }
    this.childrenContainer.removeChild(inst.framesContainer);
    delete this.frameDataViewInstances[inst.key];
  }
  _sortFrames() {
    this.framesHelper.setParentKey(this.__getKey());
    this.__applyFrameOrderToDom();
  }
  __applyFrameOrderToDom() {
    for (let c = 0, l = this.framesHelper.orderedKeys.length; c < l; c++) {
      let key = this.framesHelper.orderedKeys[c];
      let panelDom = this.frameDataViewInstances[key].framesContainer;
      let currentPanel = this.childrenContainer.childNodes[c];

      if (panelDom !== currentPanel)
        if (!panelDom.contains(document.activeElement))
          this.childrenContainer.insertBefore(panelDom, currentPanel);
        else {
          this.childrenContainer.appendChild(currentPanel);
          this.__applyFrameOrderToDom();
        }
    }
  }
  childRemoved(fireData) {
    let inst = this.frameDataViewInstances[fireData.key];
    if (inst) this.__removeInst(inst);
  }
}
