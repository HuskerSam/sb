class cPanelHelpers {
  constructor(fireFields) {
    this.fireFields = fireFields;
    this.helperPanels = {};
    this.toggleButtons = [];
    this.fieldPanels = [];
    this.context = null;
    document.addEventListener('contextRefreshActiveObject', e => this.handleDataUpdate(e), false);
  }
  updateConfig(context, tag, key) {
    this.context = null;
    this.tag = null;
    this.key = null;
    if (!context)
      return;
    this.context = context;
    this.tag = tag;
    this.key = key;
  }
  resetUI() {
    let helperPanel = this.helperPanels['rotate'];
    if (helperPanel) {
      helperPanel.input[0].value = 0;
      helperPanel.slider[0].value = 0;
      helperPanel.input[1].value = 0;
      helperPanel.slider[1].value = 0;
      helperPanel.input[2].value = 0;
      helperPanel.slider[2].value = 0;
    }

    helperPanel = this.helperPanels['scale'];
    if (helperPanel) {
      helperPanel.input.value = 100;
    }
  }
  handleDataUpdate(event) {
    if (event.detail.context !== this.context)
      return;

    if (!this.context)
      return;
    if (!this.context.activeBlock)
      return;

    if (this.helperPanels['scale']) this._scaleDataUpdate();
    if (this.helperPanels['rotate']) this._rotateDataUpdate();
  }
  initHelperField(field) {
    if (field.helperType === 'vector') {
      let hp = this.__initDOMWrapper(field.domContainer);

      let aD = hp.actionDom;
      let sliderText0 = `<input type="range" min="${field.rangeMin}" max="${field.rangeMax}" step="${field.rangeStep}" value="0" /><br>`;
      let sliderText1 = `<input type="range" min="${field.rangeMin}" max="${field.rangeMax}" step="${field.rangeStep}" value="0" /><br>`;
      let sliderText2 = `<input type="range" min="${field.rangeMin}" max="${field.rangeMax}" step="${field.rangeStep}" value="0" /><br>`;
      let htmlAction = '<div class="preview"></div>';
      aD.innerHTML = sliderText0 + sliderText1 + sliderText2 + htmlAction;
      hp.slider = aD.querySelectorAll('input[type=range]');
      hp.slider[0].addEventListener('input', e => this._fieldHandleVectorChange(field), false);
      hp.slider[1].addEventListener('input', e => this._fieldHandleVectorChange(field), false);
      hp.slider[2].addEventListener('input', e => this._fieldHandleVectorChange(field), false);
      hp.preview = aD.querySelector('.preview');
      field.helperPanel = hp;
      this.fieldPanels.push(hp);
    }
    if (field.helperType === 'singleSlider') {
      let hp = this.__initDOMWrapper(field.domContainer);

      let aD = hp.actionDom;
      let sliderText0 = `<input type="range" class="singleslider" min="${field.rangeMin}" max="${field.rangeMax}" step="${field.rangeStep}" value="0" /><br>`;
      let htmlAction = '<div class="preview"></div>';
      aD.innerHTML = sliderText0 + htmlAction;
      hp.slider = aD.querySelector('input[type=range]');
      hp.slider.addEventListener('input', e => this._fieldHandleSliderChange(field), false);
      hp.preview = aD.querySelector('.preview');
      field.helperPanel = hp;
      this.fieldPanels.push(hp);
    }
  }
  _fieldHandleVectorChange(field) {
    let hp = field.helperPanel;
    let oldValue = field.dom.value;
    let r = hp.slider[0].value;
    let g = hp.slider[1].value;
    let b = hp.slider[2].value;

    let str = r + ',' + g + ',' + b;

    if (!hp.fireSet)
      return;

    hp.fireSet.commitUpdateList([{
      field: field.fireSetField,
      newValue: str,
      oldValue: oldValue
    }], hp.key);
  }
  _fieldHandleSliderChange(field) {
    let hp = field.helperPanel;
    let oldValue = field.dom.value;
    let str = hp.slider.value;

    if (!hp.fireSet)
      return;

    hp.fireSet.commitUpdateList([{
      field: field.fireSetField,
      newValue: str,
      oldValue: oldValue
    }], hp.key);
  }
  fieldVectorUpdateData(field, fireSet, key) {
    let hp = field.helperPanel;
    hp.fireSet = fireSet;
    hp.key = key;

    let vector = GLOBALUTIL.getVector(field.dom.value, 0, 0, 0);
    hp.slider[0].value = vector.x.toFixed(3);
    hp.slider[1].value = vector.y.toFixed(3);
    hp.slider[2].value = vector.z.toFixed(3);
  }
  fieldSliderUpdateData(field, fireSet, key) {
    let hp = field.helperPanel;
    hp.fireSet = fireSet;
    hp.key = key;

    hp.slider.value = field.dom.value;
  }
  initHelperGroups() {
    if (this.fireFields.groups['scale']) this._scaleInitDom();
    if (this.fireFields.groups['rotate']) this._rotateInitDom();
  }
  __inputarrayHandleDomChange(hp, sender) {
    for (let c = 0, l = hp.input.length; c < l; c++) {
      if (hp.input[c] === sender)
        hp.slider[c].value = hp.input[c].value;
      if (hp.slider[c] === sender)
        hp.input[c].value = hp.slider[c].value;
    }
    this.context.refreshFocus();
  }
  _rotateChangeApply() {
    let helperPanel = this.helperPanels['rotate'];
    let sObj = this.context.activeBlock.sceneObject;
    let nObj = this.context.ghostBlocks['rotatePreview'].sceneObject;
    let updates = [];
    updates.push({
      field: 'rotationX',
      newValue: GLOBALUTIL.formatNumber(nObj.rotation.x).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.rotation.x).trim()
    });
    updates.push({
      field: 'rotationY',
      newValue: GLOBALUTIL.formatNumber(nObj.rotation.y).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.rotation.y).trim()
    });
    updates.push({
      field: 'rotationZ',
      newValue: GLOBALUTIL.formatNumber(nObj.rotation.z).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.rotation.z).trim()
    });

    helperPanel.input[0].value = 0;
    helperPanel.slider[0].value = 0;
    helperPanel.input[1].value = 0;
    helperPanel.slider[1].value = 0;
    helperPanel.input[2].value = 0;
    helperPanel.slider[2].value = 0;
    gAPPP.a.modelSets[this.tag].commitUpdateList(updates, this.key);
  }
  _rotateDataUpdate() {
    let hp = this.helperPanels['rotate'];
    let sObj = this.context.activeBlock.sceneObject;
    hp.moveButton.disabled = true;

    this.context.setGhostBlock('rotatePreview', null);
    if (!sObj) {
      hp.infoDom.innerHTML = ' ';
      hp.preview.innerHTML = ' ';
      return;
    }
    this.__updateBoundingInfo();

    let r = sObj.rotation;
    let html = `x ${GLOBALUTIL.formatNumber(r.x * 57.2958).trim()}&deg;`;
    html += ` y ${GLOBALUTIL.formatNumber(r.y * 57.2958).trim()}&deg;`;
    html += ` z ${GLOBALUTIL.formatNumber(r.z * 57.2958).trim()}&deg;`;
    if (this.tag === 'mesh') {
      let meshData = this.context.activeBlock.sceneObjectMeshData;
      if (meshData)
        html += `\n  Import x${GLOBALUTIL.formatNumber(meshData.rotationX)} y${GLOBALUTIL.formatNumber(meshData.rotationY)} z${GLOBALUTIL.formatNumber(meshData.rotationZ)}`;
    }

    hp.infoDom.innerHTML = html;

    let x = hp.input[0].value;
    let y = hp.input[1].value;
    let z = hp.input[2].value;

    if (x === '0' && y === '0' && z === '0') {
      hp.preview.innerHTML = ' ';
      return;
    }

    let tNode = sObj.clone('rotateClonePreview');
    let x2 = Number(sObj.rotation.x);
    let y2 = Number(sObj.rotation.y);
    let z2 = Number(sObj.rotation.z);
    let vector = new BABYLON.Vector3(x2, y2, z2);
    tNode.rotation = vector;

    let adjVector = GLOBALUTIL.getVector(x + ',' + y + ',' + z, 0, 0, 0);
    tNode.rotation.x += (adjVector.x / 57.2958);
    tNode.rotation.y += (adjVector.y / 57.2958);
    tNode.rotation.z += (adjVector.z / 57.2958);

    let xDegrees = GLOBALUTIL.formatNumber(tNode.rotation.x * 57.2958).trim();
    let yDegrees = GLOBALUTIL.formatNumber(tNode.rotation.y * 57.2958).trim();
    let zDegrees = GLOBALUTIL.formatNumber(tNode.rotation.z * 57.2958).trim();
    let previewHtml = `x ${xDegrees}&deg; y ${yDegrees}&deg; z ${zDegrees}&deg;`;
    hp.preview.innerHTML = previewHtml;

    let m = new BABYLON.StandardMaterial('material', this.context.scene);
    m.diffuseColor = GLOBALUTIL.color('0,.3,.8');
    m.diffuseColor.alpha = 0.7;
    this.context.__setMaterialOnObj(tNode, m);
    this.context.setGhostBlock('rotatePreview', new wBlock(this.context, null, tNode));

    hp.moveButton.disabled = false;
  }
  _rotateInitDom() {
    this.helperPanels['rotate'] = this.__initDOMWrapper(this.fireFields.groups['rotate']);
    let hp = this.helperPanels['rotate'];
    let aD = hp.actionDom;
    aD.classList.add('rotate');
    let html = '<div>x <input type="range" min="-360" max="360" step=".01" value="0" />' +
      ' <input class="form-control" type="text" value="0" />&deg;<br>' +
      'y <input type="range" min="-360" max="360" step=".01" value="0" />' +
      ' <input class="form-control" type="text" value="0" />&deg;<br>' +
      'z <input type="range" min="-360" max="360" step=".01" value="0" />' +
      ' <input class="form-control" type="text" value="0" />&deg;<br></div>' +
      '<button class="btn-sb-icon">Rotate</button><div class="preview"></div>';
    aD.innerHTML = html;
    hp.moveButton = aD.querySelector('button');
    hp.input = aD.querySelectorAll('input[type=text]');
    hp.slider = aD.querySelectorAll('input[type=range]');

    for (let c = 0, l = hp.input.length; c < l; c++)
      hp.input[c].addEventListener('input', e => this.__inputarrayHandleDomChange(hp, hp.input[c]), false);
    for (let c = 0, l = hp.slider.length; c < l; c++)
      hp.slider[c].addEventListener('input', e => this.__inputarrayHandleDomChange(hp, hp.slider[c]), false);

    hp.moveButton.addEventListener('click', e => this._rotateChangeApply(hp), false);
    hp.preview = aD.querySelector('.preview');
  }
  _scaleChangeApply() {
    let helperPanel = this.helperPanels['scale'];
    if (helperPanel.input.value === '100' || !GLOBALUTIL.isNumeric(helperPanel.input.value))
      return;

    let sObj = this.context.activeBlock.sceneObject;
    let nObj = this.context.ghostBlocks['scalePreview'].sceneObject;
    let updates = [];
    updates.push({
      field: 'scalingX',
      newValue: GLOBALUTIL.formatNumber(nObj.scaling.x).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.scaling.x).trim()
    });
    updates.push({
      field: 'scalingY',
      newValue: GLOBALUTIL.formatNumber(nObj.scaling.y).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.scaling.y).trim()
    });
    updates.push({
      field: 'scalingZ',
      newValue: GLOBALUTIL.formatNumber(nObj.scaling.z).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.scaling.z).trim()
    });

    helperPanel.input.value = 100;
    gAPPP.a.modelSets[this.tag].commitUpdateList(updates, this.key);
  }
  _scaleDataUpdate() {
    let hp = this.helperPanels['scale'];
    this.context.setGhostBlock('scalePreview', null);
    hp.scaleButton.disabled = true;

    if (!this.context.activeBlock.sceneObject) {
      hp.infoDom.innerHTML = ' ';
      hp.preview.innerHTML = ' ';
      return;
    }
    this.__updateBoundingInfo();

    let html = `Original w${GLOBALUTIL.formatNumber(this._oDim.size.x)} h${GLOBALUTIL.formatNumber(this._oDim.size.y)} d${GLOBALUTIL.formatNumber(this._oDim.size.z)}`;
    html += `\n  Actual w${GLOBALUTIL.formatNumber(this._wDim.size.x)} h${GLOBALUTIL.formatNumber(this._wDim.size.y)} d${GLOBALUTIL.formatNumber(this._wDim.size.z)}`;
    if (this.tag === 'mesh') {
      let meshData = this.context.activeBlock.sceneObjectMeshData;
      if (meshData)
        html += `\n  Import x${GLOBALUTIL.formatNumber(meshData.scalingX)} y${GLOBALUTIL.formatNumber(meshData.scalingY)} z${GLOBALUTIL.formatNumber(meshData.scalingZ)}`;
    }
    hp.infoDom.innerHTML = html;

    if (hp.input.value === "100" || !GLOBALUTIL.isNumeric(hp.input.value)) {
      hp.preview.innerHTML = ' ';
    } else {
      let val = Number(hp.input.value) / 100.0;
      let width = this._wDim.size.x * val;
      let height = this._wDim.size.y * val;
      let depth = this._wDim.size.z * val;
      let html = '';
      html += `Scaled w${GLOBALUTIL.formatNumber(width)} h${GLOBALUTIL.formatNumber(height)} d${GLOBALUTIL.formatNumber(depth)}`;

      let tNode = this._sObj.clone('scaleClonePreview');
      tNode.scaling.x = val * this._sObj.scaling.x;
      tNode.scaling.y = val * this._sObj.scaling.y;
      tNode.scaling.z = val * this._sObj.scaling.z;

      let m = new BABYLON.StandardMaterial('material', this.context.scene);
      m.diffuseColor = GLOBALUTIL.color('1,.5,0');
      m.diffuseColor.alpha = 0.7;
      this.context.__setMaterialOnObj(tNode, m);
      this.context.setGhostBlock('scalePreview', new wBlock(this.context, null, tNode));
      hp.preview.innerHTML = html;
      hp.scaleButton.disabled = false;
    }
  }
  _scaleInitDom() {
    let c = this.fireFields.groups['scale'];
    this.helperPanels['scale'] = this.__initDOMWrapper(c);
    let hp = this.helperPanels['scale'];
    let aD = hp.actionDom;
    aD.innerHTML = ' <input class="form-control scale-value" type="text" value="100" />% &nbsp;' +
      '<button class="btn-sb-icon scale-button">Scale</button><div class="preview"></div>' +
      '<div class="scale-to-fit">' +
      '<label><span>W</span><input type="text" class="mesh-width" value="1" /></label>' +
      '<label><span>H</span><input type="text" class="mesh-height" value="1" /></label>' +
      '<label><span>D</span><input type="text" class="mesh-depth" value="1" /></label>' +
      '<button class="fit-button">Fit</button></div>';
    hp.scaleButton = aD.querySelector('.scale-button');
    hp.input = aD.querySelector('.scale-value');
    hp.fitButton = aD.querySelector('.fit-button');
    hp.fitWidth = aD.querySelector('.mesh-width');
    hp.fitHeight = aD.querySelector('.mesh-height');
    hp.fitDepth = aD.querySelector('.mesh-depth');
    hp.fitButton.addEventListener('click', e => this._fitChangeApply(hp), false);
    hp.input.addEventListener('input', e => this.context.refreshFocus(), false);
    hp.scaleButton.addEventListener('click', e => this._scaleChangeApply(hp), false);
    hp.preview = aD.querySelector('.preview');
  }
  _fitChangeApply(hp) {
    let fitWidth =  GLOBALUTIL.getNumberOrDefault(hp.fitWidth.value, 1);
    let fitHeight = GLOBALUTIL.getNumberOrDefault(hp.fitHeight.value, 1);
    let fitDepth = GLOBALUTIL.getNumberOrDefault(hp.fitDepth.value, 1);
    this.__updateBoundingInfo();

    let xF = fitWidth / this._oDim.size.x;
    let xH = fitHeight / this._oDim.size.y;
    let xD = fitDepth / this._oDim.size.z;

    let factor = Math.min(xF, Math.min(xH, xD));

    let updates = [];
    updates.push({
      field: 'scalingX',
      newValue: factor.toFixed(6)
    });
    updates.push({
      field: 'scalingY',
      newValue: factor.toFixed(6)
    });
    updates.push({
      field: 'scalingZ',
      newValue: factor.toFixed(6)
    });
    gAPPP.a.modelSets[this.tag].commitUpdateList(updates, this.key);
  }
  collapseAll() {
    for (let c = 0, l = this.toggleButtons.length; c < l; c++)
      this.__toggleHelper(this.toggleButtons[c].helperDom, this.toggleButtons[c], false);
  }
  expandAll() {
    for (let c = 0, l = this.toggleButtons.length; c < l; c++)
      this.__toggleHelper(this.toggleButtons[c].helperDom, this.toggleButtons[c], true);
  }
  __initDOMWrapper(containerDom) {
    let helperDom = document.createElement('div');
    helperDom.setAttribute('class', 'selected-mesh-bounds-helper-box');
    helperDom.style.display = 'none';
    let collapseButton = document.createElement('button');
    collapseButton.setAttribute('class', 'selected-mesh-helper-collapse-button');
    collapseButton.innerHTML = '<i class="material-icons">unfold_more</i>';
    collapseButton.addEventListener('click', e => this.__toggleHelper(helperDom, collapseButton));
    collapseButton.helperDom = helperDom;
    this.toggleButtons.push(collapseButton);

    containerDom.appendChild(collapseButton);

    let actionDom = document.createElement('div');
    actionDom.setAttribute('class', 'action-area');
    helperDom.appendChild(actionDom);
    let infoDom = document.createElement('div');
    infoDom.classList.add('info-area');
    helperDom.appendChild(infoDom);
    containerDom.appendChild(helperDom);
    return {
      containerDom,
      helperDom,
      infoDom,
      actionDom,
      collapseButton
    };
  }
  __toggleHelper(helperDom, collapseButton, forceState = undefined) {
    let vState = false;

    if (helperDom.style.display === 'none')
      vState = true;

    if (forceState !== undefined)
      vState = forceState;

    if (vState) {
      helperDom.style.display = 'block';
      collapseButton.innerHTML = '<i class="material-icons">unfold_less</i>';
      collapseButton.classList.add('app-inverted');
    } else {
      helperDom.style.display = 'none';
      collapseButton.innerHTML = '<i class="material-icons">unfold_more</i>';
      collapseButton.classList.remove('app-inverted');
    }
  }
  __updateBoundingInfo() {
    this._sObj = this.context.activeBlock.sceneObject;
    if (!this._sObj)
      return;
    this._boundingBox = this._sObj.getBoundingInfo().boundingBox;
    this._oDim = {
      center: this._boundingBox.center,
      size: this._boundingBox.extendSize,
      minimum: this._boundingBox.minimum,
      maximum: this._boundingBox.maximum
    };
    this._wDim = {
      center: this._boundingBox.centerWorld,
      size: this._boundingBox.extendSizeWorld,
      minimum: this._boundingBox.minimumWorld,
      maximum: this._boundingBox.maximumWorld
    };
  }
}
