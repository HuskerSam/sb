class cBandFrames extends bBand {
  constructor(childrenContainer, parent, framesHeaderPanel) {
    super(gAPPP.a.modelSets['frame'], 'frame');
    this.framesHeaderPanel = framesHeaderPanel;
    this.fireSet = gAPPP.a.modelSets['frame'];
    this.childrenContainer = childrenContainer;
    this.frameDataViewInstances = {};
    this.parent = parent;
    this.framesHelper = new wFrames(this.parent.context);

    this.addFrameButton = document.createElement('button');
    this.addFrameButton.innerHTML = '<i class="material-icons">playlist_add</i>';
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
  __updateFieldsForAnimRow(instance) {
    let fieldsFilter = sDataDefinition.getAnimFieldsFilter();
    let fieldList = null;
    if (this.framesHelper.cachedChildType === 'camera')
      fieldList = fieldsFilter.animateCameraFields[this.parent.context.activeBlock.blockRawData.childName];
    if (this.framesHelper.cachedChildType === 'light')
      fieldList = fieldsFilter.animateLightFields[this.parent.context.activeBlock.blockRawData.childName];

    if (fieldList) {
      for (let inner in instance.dataPanel.fields) {
        let innerField = instance.dataPanel.fields[inner];
        let key = innerField.fireSetField;

        if (fieldList.indexOf(key) !== -1 || key === 'frameTime' || key === 'frameOrder')
          innerField.domContainer.style.display = 'inline-block';
        else
          innerField.domContainer.style.display = 'none';
      }

      for (let i in instance.dataPanel.groups) {
        let childVisible = false;
        instance.dataPanel.groups[i].style.display = 'none';
        let children = instance.dataPanel.groups[i].childNodes;
        for (let ii = 0; ii < children.length; ii++)
          if (children[ii].classList.contains('form-group'))
            if (children[ii].style.display !== 'none') {
              instance.dataPanel.groups[i].style.display = '';
              break;
            }
      }
    }
  }
  _moveToNextFrame(instance, field, moveUp = false) {
    for (let i = 0, l = this.framesHelper.orderedKeys.length; i < l; i++) {
      let key = this.framesHelper.orderedKeys[i];
      let inst = this.frameDataViewInstances[key];
      if (instance === inst) {
        let resultKey = null;

        if (moveUp) {
          if (i === 0)
            resultKey = this.framesHelper.orderedKeys[l - 1];
          else
            resultKey = this.framesHelper.orderedKeys[i - 1];
        } else {
          if (i === l - 1)
            resultKey = this.framesHelper.orderedKeys[0];
          else
            resultKey = this.framesHelper.orderedKeys[i + 1];
        }

        let resultInst = this.frameDataViewInstances[resultKey];
        for (let x = 0, l = resultInst.frameFields.length; x < l; x++) {
          if (resultInst.frameFields[x].fireSetField === field.fireSetField) {
            resultInst.frameFields[x].dom.focus();
            return;
          }
        }
      }
    }
  }
  _moveToNextField(instance, field, e, movePrevious = false) {
    for (let x = 0, l = instance.frameFields.length; x < l; x++) {
      if (instance.frameFields[x].fireSetField === field.fireSetField) {
        if (!movePrevious) {
          if (x < l - 1)
            instance.frameFields[x + 1].dom.focus();
          else {
            instance.frameFields[0].dom.focus();
            this._moveToNextFrame(instance, instance.frameFields[0]);
          }
        } else {
          if (x === 0) {
            instance.frameFields[l - 1].dom.focus();
            this._moveToNextFrame(instance, instance.frameFields[l - 1], true);
          } else
            instance.frameFields[x - 1].dom.focus();
        }
        e.preventDefault();
        return;
      }
    }
  }
  _handleFrameKeyPress(instance, field, e) {
    if (e.keyCode === 16)
      return;

    if (e.keyCode === 40)
      this._moveToNextFrame(instance, field);
    else if (e.keyCode === 38)
      this._moveToNextFrame(instance, field, true);
    else if (e.keyCode === 39) {
      if (field.dom.selectionEnd === field.dom.value.length)
        this._moveToNextField(instance, field, e);
    } else if (e.keyCode === 37) {
      if (field.dom.selectionEnd === 0)
        this._moveToNextField(instance, field, e, true);
    }
  }
  _getDomForChild(key, values) {
    let framesContainer = document.createElement('div');
    framesContainer.setAttribute('class', 'frame-fields-container');

    let instance = {};
    instance.frameFields = sDataDefinition.bindingFieldsCloned(this.framesHelper.cachedFrameType);
    instance.key = key;
    instance.tag = 'frame';
    instance.fireSet = this.fireSet;
    instance.framesContainer = framesContainer;
    instance.dataPanel = new cPanelData(instance.frameFields, framesContainer, instance, false);
    instance.dataPanel._updateDisplayFilters = () => this.__updateFieldsForAnimRow(instance);
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
      g.appendChild(helperDom);
      instance.dataPanel.groupDisplays[i] = helperDom;
      if (!firstGroup)
        firstGroup = helperDom;
    }
    let deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="material-icons">delete_sweep</i>';
    deleteButton.setAttribute('class', 'delete-button btn-sb-icon');
    deleteButton.addEventListener('click', e => this._removeFrame(instance));
    framesContainer.insertBefore(deleteButton, framesContainer.childNodes[framesContainer.childNodes.length - 1]);

    instance.dataPanel.paint(values);

    for (let i = 0; i < instance.dataPanel.fieldObjs.length; i++)
      instance.dataPanel.fieldObjs[i].dom.addEventListener('keydown', e => this._handleFrameKeyPress(instance, instance.dataPanel.fieldObjs[i], e), false);
  }
  __getKey() {
    let filter = this.parent.childKey;
    if (!filter)
      filter = this.parent.key;
    return filter;
  }
  refreshUIFromCache() {
    this.clearChildren();

    let childType = 'block';
    if (this.parent.childKey !== null)
      childType = this.parent.childBand.fireSet.getCache(this.parent.childKey).childType;

    this.framesHelper._validateFieldList(childType);
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
    this.childrenContainer.removeChild(this.framesHeaderPanel);
    this.__applyFrameOrderToDom();
    this.childrenContainer.appendChild(this.addFrameButton);
    this.childrenContainer.insertBefore(this.framesHeaderPanel, this.childrenContainer.childNodes[0]);
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

    for (let i in groupDisplays)
      if (groupDisplays[i])
        groupDisplays[i].innerHTML = '';

    for (let c = 0, l = resultFrames.length; c < l; c++) {
      let rFrame = resultFrames[c];
      let lightValues;

      if (this.framesHelper.cachedFrameType === 'lightFrame') {
        let lV = {};
        for (let i in rFrame.values)
          lV[i] = rFrame.values[i].value;
        lightValues = this.framesHelper.__getLightDetails(lV);
      }

      if (key !== rFrame.ownerKey)
        continue;

      let stash = resultFrames[c].frameStash;

      let className = '';
      let prefix = '';
      if (rFrame.gen) {
        className = 'genFrame';
        prefix = '(gen) '
      }

      if (groupDisplays.time)
        groupDisplays.time.innerHTML += `<div class="${className}">` +
        rFrame.actualTime.toFixed(0) + `ms ${prefix}</div>`;
      try {
        if (groupDisplays.command) {
          if (rFrame.gen)
            groupDisplays.command.innerHTML += `<div class="${className}"> </div>`;
          else {
            let cmd = rFrame.values['frameCommand'].origValue;
            if (! cmd)
              cmd = '';
            let field = rFrame.values['frameCommandField'].origValue;
            if (! field)
              field = '';
            let value = rFrame.values['frameCommandValue'].origValue;
            if (! value)
              value = '';
            groupDisplays.command.innerHTML += `<div class="${className}">` +
              cmd + ' ' +
              field + ' ' +
              value + ' ' +
              '</div>';
          }
        }

        if (groupDisplays.scale)
          groupDisplays.scale.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['scalingX'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['scalingY'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['scalingZ'].value) + '</div>';

        if (groupDisplays.offset)
          groupDisplays.offset.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['positionX'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['positionY'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['positionZ'].value) + '</div>';

        if (groupDisplays.rotate)
          groupDisplays.rotate.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['rotationX'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['rotationY'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['rotationZ'].value) + '</div>';

        if (groupDisplays.visi)
          groupDisplays.visi.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['visibility'].value) + '</div>';

        if (groupDisplays.diffuse)
          groupDisplays.diffuse.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['diffuseColorR'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['diffuseColorG'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['diffuseColorB'].value) + '</div>';

        if (groupDisplays.camera1)
          groupDisplays.camera1.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['cameraRotationOffset'].value) + ' &nbsp; ' +
          GLOBALUTIL.formatNumber(rFrame.values['cameraAcceleration'].value) + ' &nbsp; ' +
          GLOBALUTIL.formatNumber(rFrame.values['maxCameraSpeed'].value) + '</div>';

        if (groupDisplays.cameraArc)
          groupDisplays.cameraArc.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['cameraRadius'].value) + ' &nbsp; ' +
          GLOBALUTIL.formatNumber(rFrame.values['cameraHeightOffset'].value) + '</div>';

        if (groupDisplays.cameraFOV)
          groupDisplays.cameraFOV.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['cameraFOV'].value) + ' &nbsp; ' + '</div>';

        if (groupDisplays.camera)
          groupDisplays.camera.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['cameraOriginX'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['cameraOriginY'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['cameraOriginZ'].value) + '</div>';

        if (groupDisplays.camera0)
          groupDisplays.camera0.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['cameraRotationX'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['cameraRotationY'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['cameraRotationZ'].value) + '</div>';
        if (groupDisplays.light)
          groupDisplays.light.innerHTML += lightValues.directionX + ',' + lightValues.directionY + ',' + lightValues.directionZ;

        if (groupDisplays.lightsub)
          groupDisplays.lightsub.innerHTML += lightValues.intensity;

        if (groupDisplays.lightsubdif)
          groupDisplays.lightsubdif.innerHTML += lightValues.diffuseR + ',' + lightValues.diffuseG + ',' + lightValues.diffuseB;

        if (groupDisplays.lightsubspec)
          groupDisplays.lightsubspec.innerHTML += lightValues.specularR + ',' + lightValues.specularG + ',' + lightValues.specularB;

        if (groupDisplays.lightsubgnd)
          groupDisplays.lightsubgnd.innerHTML += lightValues.groundR + ',' + lightValues.groundG + ',' + lightValues.groundB;

        if (groupDisplays.lightP)
          groupDisplays.lightP.innerHTML += lightValues.originX + ',' + lightValues.originY + ',' + lightValues.originZ;

        if (groupDisplays.light4)
          groupDisplays.light4.innerHTML += lightValues.angle + ',' + lightValues.decay;

        if (groupDisplays.emissive)
          groupDisplays.emissive.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['emissiveColorR'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['emissiveColorG'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['emissiveColorB'].value) + '</div>';

        if (groupDisplays.ambient)
          groupDisplays.ambient.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['ambientColorR'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['ambientColorG'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['ambientColorB'].value) + '</div>';

        if (groupDisplays.specular)
          groupDisplays.specular.innerHTML += `<div class="${className}">` +
          GLOBALUTIL.formatNumber(rFrame.values['specularColorR'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['specularColorG'].value) + ',' +
          GLOBALUTIL.formatNumber(rFrame.values['specularColorB'].value) + '</div>';

      } catch (e) {
        console.log(e);
      }
    }
  }
  childRemoved(fireData) {
    let inst = this.frameDataViewInstances[fireData.key];
    if (inst) this.__removeInst(inst);
  }
}
