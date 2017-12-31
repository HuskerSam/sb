class cBandFrames extends cBandSuper {
  constructor(childrenContainer, parent) {
    super(gAPPP.a.modelSets['frame'], 'frame');
    this.fireSet = gAPPP.a.modelSets['frame'];
    this.childrenContainer = childrenContainer;
    this.frameDataViewInstances = {};
    this.framesHelper = new wFrames();
    this.parent = parent;

    let headerBar = document.createElement('div');
    headerBar.classList.add('frames-header-bar');
    this.childrenContainer.append(headerBar);
    this.headerBar = headerBar;

    this.expandAllFrameHelpersButton = document.createElement('button');
    this.expandAllFrameHelpersButton.innerHTML = '+';
    this.allFrameHelpersExpanded = false;
    this.expandAllFrameHelpersButton.addEventListener('click', e => this.expandAllFrameHelpers());
    this.expandAllFrameHelpersButton.classList.add('expand-all-helpers');
    this.expandAllFrameHelpersButton.classList.add('btn-toolbar-icon');
    headerBar.append(this.expandAllFrameHelpersButton);

    this.addFrameButton = document.createElement('button');
    this.addFrameButton.innerHTML = '<i class="material-icons">add</i> Frame';
    this.addFrameButton.setAttribute('class', 'btn add-button');
    this.addFrameButton.addEventListener('click', e => this.addFrame(this.__getKey()));
    this.headerBar.append(this.addFrameButton);

    this.baseFrameInfoSpan = document.createElement('span');
    this.headerBar.append(this.baseFrameInfoSpan);

    let clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    this.headerBar.append(clearDiv);
  }
  expandAllFrameHelpers() {
    if (this.allFrameHelpersExpanded) {
      this.expandAllFrameHelpersButton.innerHTML = '+';
      this.allFrameHelpersExpanded = false;

      for (let i in this.frameDataViewInstances) {
        this.frameDataViewInstances[i].domParts.helperDom.style.display = 'none';
        this.frameDataViewInstances[i].domParts.collapseButton.innerHTML = '+';
      }
    } else {
      this.expandAllFrameHelpersButton.innerHTML = '-';
      this.allFrameHelpersExpanded = true;

      for (let i in this.frameDataViewInstances) {
        this.frameDataViewInstances[i].domParts.helperDom.style.display = 'block';
        this.frameDataViewInstances[i].domParts.collapseButton.innerHTML = '-';
      }
    }
  }
  addFrame(parentKey) {
    let objectData = sDataDefinition.getDefaultDataCloned('frame');
    objectData.parentKey = parentKey;
    objectData.frameOrder = this.framesHelper.nextFrameOrder();
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
      this.__toggleRowHelper(helperDom, collapseButton);
    });
    containerDom.childNodes[0].append(collapseButton);
    containerDom.append(helperDom);
    return {
      containerDom,
      helperDom,
      collapseButton
    };
  }
  __toggleRowHelper(helperDom, collapseButton) {
    if (helperDom.style.display === 'none') {
      helperDom.style.display = 'block';
      collapseButton.innerHTML = '-';
    } else {
      helperDom.style.display = 'none';
      collapseButton.innerHTML = '+';
    }
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
    instance.dataPanel = new cPanelData(instance.frameFields, framesContainer, instance, false);
    instance.childListener = (values, type, fireData) => instance.dataPanel._handleDataChange(values, type, fireData);
    this.fireSet.childListeners.push(instance.childListener);
    this.frameDataViewInstances[key] = instance;

    instance.domParts = this.__initDOMWrapper(framesContainer);
    let deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="material-icons">delete</i>';
    deleteButton.setAttribute('class', 'btn delete-button');
    deleteButton.style.float = 'left';
    deleteButton.addEventListener('click', e => this._removeFrame(instance));
    instance.domParts.helperDom.append(deleteButton);
    let frameInfoPanel = document.createElement('div');
    frameInfoPanel.classList.add('frame-info-panel');
    instance.domParts.helperDom.append(frameInfoPanel);
    instance.frameInfoPanel = frameInfoPanel;
    let clear = document.createElement('div');
    clear.style.clear = 'both';
    instance.domParts.helperDom.append(clear);

    let clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    framesContainer.appendChild(clearDiv);
    this.childrenContainer.append(framesContainer);
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

    this._processFrames();
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

    this._processFrames();
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
  _processFrames() {
    this.framesHelper.setParentKey(this.__getKey());
    this.__applyFrameOrderToDom();
  }
  __applyFrameOrderToDom() {
    for (let c = 0, l = this.framesHelper.orderedKeys.length; c < l; c++) {
      let key = this.framesHelper.orderedKeys[c];
      let panelDom = this.frameDataViewInstances[key].framesContainer;
      let currentPanel = this.childrenContainer.childNodes[c + 1]; //offset the header

      if (panelDom !== currentPanel)
        if (!panelDom.contains(document.activeElement))
          this.childrenContainer.insertBefore(panelDom, currentPanel);
        else {
          this.childrenContainer.append(currentPanel);
          this.__applyFrameOrderToDom();
        }

      let infoPanel = this.frameDataViewInstances[key].frameInfoPanel;
      infoPanel.innerHTML = this.__processedRowsHTML(key);
    }
  }
  __processedRowsHTML(key) {
    let parsedFramesHTML = '';
    let resultFrames = this.framesHelper.processedFrames;
    for (let c = 0, l = resultFrames.length; c < l; c++) {
      let rFrame = resultFrames[c];
      if (key !== rFrame.ownerKey)
        continue;

      let stash = resultFrames[c].frameStash;

      let className = '';
      if (rFrame.gen)
        className = 'genFrame';

      parsedFramesHTML += `<div class="${className}">` +
        rFrame.actualTime.toFixed(0).padStart(7) + 'ms  ' +
        stash.autoGen.padEnd(5) +
        rFrame.key.padEnd(21) +
        stash.autoTime.toFixed(0).padStart(6) + 'ms  ' +

        ' Scale ' +
        rFrame.values['scalingX'].value.toFixed(2) + ',' +
        rFrame.values['scalingY'].value.toFixed(2) + ',' +
        rFrame.values['scalingZ'].value.toFixed(2) +

        ' Position ' +
        rFrame.values['positionX'].value.toFixed(2) + ',' +
        rFrame.values['positionY'].value.toFixed(2) + ',' +
        rFrame.values['positionZ'].value.toFixed(2) +

        ' Rotation ' +
        rFrame.values['rotationX'].value.toFixed(2) + ',' +
        rFrame.values['rotationY'].value.toFixed(2) + ',' +
        rFrame.values['rotationZ'].value.toFixed(2) +
        '</div>';
    }
    return parsedFramesHTML;
  }
  childRemoved(fireData) {
    let inst = this.frameDataViewInstances[fireData.key];
    if (inst) this.__removeInst(inst);
  }
}
