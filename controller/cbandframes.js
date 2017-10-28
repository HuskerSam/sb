class cBandFrames extends cBandSuper {
  constructor(childrenContainer, parent) {
    super(gAPPP.a.modelSets['frame'], 'frame');
    this.fireSet = gAPPP.a.modelSets['frame'];
    this.childrenContainer = childrenContainer;
    this.frameDataViewInstances = {};
    this.framesHelper = new wFrames();
    this.parent = parent;

    this.addFrameButton = document.createElement('button');
    this.addFrameButton.innerHTML = '<i class="material-icons">add</i> Frame';
    this.addFrameButton.setAttribute('class', 'btn add-button');
    this.addFrameButton.style.float = 'left';
    this.childrenContainer.appendChild(this.addFrameButton);
    this.addFrameButton.addEventListener('click', e => this.addFrame(this.__getKey()));
  }
  addFrame(parentKey) {
    let objectData = sDataDefinition.getDefaultDataCloned('frame');
    objectData.parentKey = parentKey;
    objectData.frameOrder = this.framesHelper.getNextOrder();
    gAPPP.a.modelSets['frame'].createWithBlobString(objectData).then(r => {});
  }
  __initDOMWrapper(containerDom) {
    let helperDom = document.createElement('div');
    helperDom.setAttribute('class', 'selected-mesh-bounds-helper-box');
    helperDom.style.display = 'none';
    let collapseButton = document.createElement('button');
    collapseButton.setAttribute('class', 'selected-mesh-helper-collapse-button');
    collapseButton.innerHTML = '+';
    collapseButton.addEventListener('click', e => {
      if (helperDom.style.display === 'none') {
        helperDom.style.display = 'block';
        collapseButton.innerHTML = '-';
      } else {
        helperDom.style.display = 'none';
        collapseButton.innerHTML = '+';
      }
    });
    containerDom.appendChild(collapseButton);
    let infoDom = document.createElement('div');
    infoDom.classList.add('info-area');
    helperDom.appendChild(infoDom);
    let actionDom = document.createElement('div');
    actionDom.setAttribute('class', 'action-area');
    helperDom.appendChild(actionDom);
    containerDom.appendChild(helperDom);
    return {
      containerDom,
      helperDom,
      infoDom,
      actionDom,
      collapseButton
    };
  }
  _getDomForChild(key, values) {
    let framesContainer = document.createElement('div');
    framesContainer.setAttribute('class', 'frame-fields-container');
    let domParts = this.__initDOMWrapper(framesContainer);

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
    framesContainer.insertBefore(deleteButton, framesContainer.childNodes[0]);
    domParts.helperDom.append(deleteButton);

    let clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    framesContainer.appendChild(clearDiv);
    this.childrenContainer.insertBefore(framesContainer, this.addFrameButton);
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
          this.childrenContainer.insertBefore(currentPanel, this.addFrameButton);
          this.__applyFrameOrderToDom();
        }
    }
  }
  childRemoved(fireData) {
    let inst = this.frameDataViewInstances[fireData.key];
    if (inst) this.__removeInst(inst);
  }
}
