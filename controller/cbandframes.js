class cBandFrames extends cBandSuper {
  constructor(childrenContainer, parent) {
    super(gAPPP.a.modelSets['frame'], 'frame');
    this.fireSet = gAPPP.a.modelSets['frame'];
    this.childrenContainer = childrenContainer;
    this.frameDataViewInstances = {};
    this.parent = parent;
    this.framesHelper = new wFrames(this.parent.context);

    this.addFrameButton = document.createElement('button');
    this.addFrameButton.innerHTML = '<i class="material-icons">add</i>';
    this.addFrameButton.setAttribute('class', 'add-button btn-sb-icon');
    this.addFrameButton.addEventListener('click', e => this.addFrame(this.__getKey()));
    this.childrenContainer.appendChild(this.addFrameButton);
  }
  _updateFrameHelpersUI() {
    if (!this.parent.detailsShown) {
      for (let i in this.frameDataViewInstances) {
        let d = this.frameDataViewInstances[i].dataPanel;
        for (let ii in d.groupDisplays)
          d.groupDisplays[ii].style.display = 'none';
      }
    } else {
      for (let i in this.frameDataViewInstances) {
        let d = this.frameDataViewInstances[i].dataPanel;
        for (let ii in d.groupDisplays)
          d.groupDisplays[ii].style.display = 'block';
      }
    }

  }
  addFrame(parentKey) {
    let objectData = sDataDefinition.getDefaultDataCloned('frame');
    objectData.parentKey = parentKey;
    objectData.frameOrder = this.framesHelper.nextFrameOrder();
    gAPPP.a.modelSets['frame'].createWithBlobString(objectData).then(r => {});
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

    let clearDiv = document.createElement('div');
    clearDiv.style.clear = 'both';
    framesContainer.appendChild(clearDiv);
    this.childrenContainer.appendChild(framesContainer);

    instance.dataPanel.groupDisplays = {};
    let firstGroup = null;
    for (let i in instance.dataPanel.groups) {
      let g = instance.dataPanel.groups[i];
      let helperDom = document.createElement('div');
      helperDom.setAttribute('class', 'selected-mesh-bounds-helper-box frame-info-panel');
      helperDom.style.display = 'none';
      g.appendChild(helperDom);
      instance.dataPanel.groupDisplays[i] = helperDom;
      if (!firstGroup)
        firstGroup = helperDom;
    }
    let deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="material-icons">delete</i>';
    deleteButton.setAttribute('class', 'delete-button btn-sb-icon');
    //deleteButton.style.float = 'left';
    deleteButton.addEventListener('click', e => this._removeFrame(instance));
    framesContainer.insertBefore(deleteButton, framesContainer.childNodes[framesContainer.childNodes.length - 1]);

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
    if (type === 'add') {
      //let frames helpers process add first
      setTimeout(() => {
        result = this.childAdded(fireData);
        this.framesHelper.compileFrames();
        this._processFrames();
      }, 1);
      return null;
    }
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
  childAdded(fireData) {
    this._getDomForChild(fireData.key, fireData.val());
  }
  _removeFrame(instance) {
    if (confirm('Delete this frame?'))
      this.fireSet.removeByKey(instance.key);
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
    if (this.parent.context.activeBlock)
      this.framesHelper = this.parent.context.activeBlock.framesHelper;
    else
      this.framesHelper = new wFrames(this.parent.context);

    this.framesHelper.compileFrames();
    this.childrenContainer.removeChild(this.addFrameButton);
    this.__applyFrameOrderToDom();
    this.childrenContainer.appendChild(this.addFrameButton);
    this._updateFrameHelpersUI();
  }
  __applyFrameOrderToDom() {
    for (let c = 0, l = this.framesHelper.orderedKeys.length; c < l; c++) {
      let key = this.framesHelper.orderedKeys[c];

      if (!this.frameDataViewInstances[key])
        continue;
      let panelDom = this.frameDataViewInstances[key].framesContainer;
      let currentPanel = this.childrenContainer.childNodes[c];

      if (panelDom !== currentPanel) {
        if (!panelDom.contains(document.activeElement))
          this.childrenContainer.insertBefore(panelDom, currentPanel);
        else {
          this.childrenContainer.appendChild(currentPanel);
          return this.__applyFrameOrderToDom();
        }
      }
      this._updateProcessedRowUI(key);
    }
  }
  _updateProcessedRowUI(key) {
    let groupDisplays = this.frameDataViewInstances[key].dataPanel.groupDisplays;
    let resultFrames = this.framesHelper.processedFrames;

    groupDisplays.time.innerHTML = '';
    groupDisplays.scale.innerHTML = '';
    groupDisplays.offset.innerHTML = '';
    groupDisplays.rotate.innerHTML = '';
    groupDisplays.visi.innerHTML = '';
    groupDisplays.diffuse.innerHTML = '';
    groupDisplays.emissive.innerHTML = '';
    groupDisplays.ambient.innerHTML = '';
    groupDisplays.specular.innerHTML = '';

    for (let c = 0, l = resultFrames.length; c < l; c++) {
      let rFrame = resultFrames[c];
      if (key !== rFrame.ownerKey)
        continue;

      let stash = resultFrames[c].frameStash;

      let className = '';
      if (rFrame.gen)
        className = 'genFrame';

      groupDisplays.time.innerHTML += `<div class="${className}">` +
        rFrame.actualTime.toFixed(0).padStart(7) + 'ms</div>';

      groupDisplays.scale.innerHTML += `<div class="${className}">` +
        GLOBALUTIL.formatNumber(rFrame.values['scalingX'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['scalingY'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['scalingZ'].value) + '</div>';

      groupDisplays.offset.innerHTML += `<div class="${className}">` +
        GLOBALUTIL.formatNumber(rFrame.values['positionX'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['positionY'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['positionZ'].value) + '</div>';

      groupDisplays.rotate.innerHTML += `<div class="${className}">` +
        GLOBALUTIL.formatNumber(rFrame.values['rotationX'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['rotationY'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['rotationZ'].value) + '</div>';

      groupDisplays.visi.innerHTML += `<div class="${className}">` +
        GLOBALUTIL.formatNumber(rFrame.values['visibility'].value) + '</div>';

      groupDisplays.diffuse.innerHTML += `<div class="${className}">` +
        GLOBALUTIL.formatNumber(rFrame.values['diffuseColorR'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['diffuseColorB'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['diffuseColorG'].value) + '</div>';

      groupDisplays.emissive.innerHTML += `<div class="${className}">` +
        GLOBALUTIL.formatNumber(rFrame.values['emissiveColorR'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['emissiveColorB'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['emissiveColorG'].value) + '</div>';

      groupDisplays.ambient.innerHTML += `<div class="${className}">` +
        GLOBALUTIL.formatNumber(rFrame.values['ambientColorR'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['ambientColorB'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['ambientColorG'].value) + '</div>';

      groupDisplays.specular.innerHTML += `<div class="${className}">` +
        GLOBALUTIL.formatNumber(rFrame.values['specularColorR'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['specularColorB'].value) + ',' +
        GLOBALUTIL.formatNumber(rFrame.values['specularColorG'].value) + '</div>';
    }


  }
  childRemoved(fireData) {
    let inst = this.frameDataViewInstances[fireData.key];
    if (inst) this.__removeInst(inst);
  }
}
