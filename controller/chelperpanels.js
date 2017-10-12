class cHelperPanels {
  constructor(fireFields) {
    this.fireFields = fireFields;
    this.helperPanels = {};
    this.context = null;
    document.addEventListener('contextRefreshActiveObject', e => this.handleDataUpdate(e), false);
  }
  __updateBoundingInfo() {
    this._sObj = this.context.activeContextObject.sceneObject;
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
  updateConfig(contextObject, tag, key) {
    this.context = null;
    this.tag = null;
    this.key = null;
    if (!contextObject)
      return;
    this.context = contextObject.context;
    this.tag = tag;
    this.key = key;
  }
  handleDataUpdate(event) {
    if (event.detail.context !== this.context)
      return;

    if (!this.context)
      return;

    this.__updateBoundingInfo();
    this.context.alphaFadeMesh = false;

    if (this.helperPanels['scale']) this._scaleDataUpdate();
    if (this.helperPanels['offset']) this._offsetDataUpdate();
    if (this.helperPanels['rotate']) this._rotateDataUpdate();

    this.context._updateSelectedObjectFade();
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
      hp.slider = aD.querySelector('input[type=range]');
      //hp.slider.addEventListener('input', e => this._handleInputChange(hp, hp.slider), false);
      hp.preview = aD.querySelector('.preview');
      field.helperPanel = hp;
    }
  }
  initHelperGroups() {
    if (this.fireFields.groups['scale']) this._scaleInitDom();
    if (this.fireFields.groups['offset']) this._offsetInitDom();
    if (this.fireFields.groups['rotate']) this._rotateInitDom();
  }
  _offsetChangeApply() {
    let helperPanel = this.helperPanels['offset'];
    if (helperPanel.input.value === '0' || !GLOBALUTIL.isNumeric(helperPanel.input.value))
      return;

    let sObj = this.context.activeContextObject.sceneObject;
    let nObj = this.context.ghostBlocks['offsetPreview'].sceneObject;
    let updates = [];
    updates.push({
      field: 'simpleUIDetails.positionX',
      newValue: GLOBALUTIL.formatNumber(nObj.position.x).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.position.x).trim()
    });
    updates.push({
      field: 'simpleUIDetails.positionY',
      newValue: GLOBALUTIL.formatNumber(nObj.position.y).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.position.y).trim()
    });
    updates.push({
      field: 'simpleUIDetails.positionZ',
      newValue: GLOBALUTIL.formatNumber(nObj.position.z).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.position.z).trim()
    });

    helperPanel.input.value = 0;
    helperPanel.slider.value = 0;
    gAPPP.a.modelSets[this.tag].commitUpdateList(updates, this.key);
  }
  _offsetDataUpdate() {
    let hp = this.helperPanels['offset'];
    let sObj = this.context.activeContextObject.sceneObject;

    let html = `Bounds x-min${GLOBALUTIL.formatNumber(this._wDim.minimum.x)}  x-max${GLOBALUTIL.formatNumber(this._wDim.maximum.x)}`;
    html += `\n       floor${GLOBALUTIL.formatNumber(this._wDim.minimum.y)}  ceil ${GLOBALUTIL.formatNumber(this._wDim.maximum.y)}`;
    html += `\n       z-min${GLOBALUTIL.formatNumber(this._wDim.minimum.z)}  z-max${GLOBALUTIL.formatNumber(this._wDim.maximum.z)}`;

    hp.infoDom.innerHTML = html;
    this.context.setGhostBlock('offsetPreview', null);

    if (hp.input.value === "0" || !GLOBALUTIL.isNumeric(hp.input.value)) {
      hp.preview.innerHTML = '';
    } else {
      this.context.alphaFadeMesh = true;
      let val = Number(hp.input.value);
      let type = hp.select.value;
      let tNode = sObj.clone('offetClonePreview');
      let x = (type === 'X') ? 1 : 0.0;
      let y = (type === 'Y') ? 1 : 0.0;
      let z = (type === 'Z') ? 1 : 0.0;

      let vector = new BABYLON.Vector3(x, y, z);
      tNode.translate(vector, val, BABYLON.Space.WORLD);

      let x2 = tNode.position.x;
      let y2 = tNode.position.y;
      let z2 = tNode.position.z;

      let html = `x ${GLOBALUTIL.formatNumber(x2)} y ${GLOBALUTIL.formatNumber(y2)} z ${GLOBALUTIL.formatNumber(z2)}`;

      tNode.visibility = 1;
      tNode.material = new BABYLON.StandardMaterial('material', this.context.scene);
      tNode.material.diffuseColor = GLOBALUTIL.color('.2,.8,0');
      tNode.material.diffuseColor.alpha = 0.7;
      this.context.setGhostBlock('offsetPreview', new cBlock(this.context, null, tNode));
      hp.preview.innerHTML = html;
    }

  }
  _offsetInitDom() {
    this.helperPanels['offset'] = this.__initDOMWrapper(this.fireFields.groups['offset']);
    let hp = this.helperPanels['offset'];
    let aD = hp.actionDom;
    aD.classList.add('offset');
    let html = '<select class="form-control"><option>X</option><option selected>Y</option><option>Z</option></select>';
    html += ' <input type="range" min="-15" max="15" step=".01" value="0" />' +
      ' <input class="form-control" type="text" value="0" />' +
      ' <button class="btn">Move</button><div class="preview"></div>';
    aD.innerHTML = html;
    hp.moveButton = aD.querySelector('button');
    hp.select = aD.querySelector('select');
    hp.input = aD.querySelector('input[type=text]');
    hp.slider = aD.querySelector('input[type=range]');
    hp.select.addEventListener('input', e => this.__sliderHandleInputChange(hp, null), false);
    hp.input.addEventListener('input', e => this.__sliderHandleInputChange(hp, hp.input), false);
    hp.slider.addEventListener('input', e => this.__sliderHandleInputChange(hp, hp.slider), false);
    hp.moveButton.addEventListener('click', e => this._offsetChangeApply(hp), false);
    hp.preview = aD.querySelector('.preview');
  }
  _rotateChangeApply() {
    let helperPanel = this.helperPanels['rotate'];
    if (helperPanel.input.value === '0' || !GLOBALUTIL.isNumeric(helperPanel.input.value))
      return;

    let sObj = this.context.activeContextObject.sceneObject;
    let nObj = this.context.ghostBlocks['rotatePreview'].sceneObject;
    let updates = [];
    updates.push({
      field: 'simpleUIDetails.rotateX',
      newValue: GLOBALUTIL.formatNumber(nObj.rotation.x).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.rotation.x).trim()
    });
    updates.push({
      field: 'simpleUIDetails.rotateY',
      newValue: GLOBALUTIL.formatNumber(nObj.rotation.y).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.rotation.y).trim()
    });
    updates.push({
      field: 'simpleUIDetails.rotateZ',
      newValue: GLOBALUTIL.formatNumber(nObj.rotation.z).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.rotation.z).trim()
    });

    helperPanel.input.value = 0;
    helperPanel.slider.value = 0;
    gAPPP.a.modelSets[this.tag].commitUpdateList(updates, this.key);
  }
  _rotateDataUpdate() {
    let hp = this.helperPanels['rotate'];
    let sObj = this.context.activeContextObject.sceneObject;

    let r = sObj.rotation;
    let html = `x ${GLOBALUTIL.formatNumber(r.x * 57.2958).trim()}&deg;`;
    html += ` y ${GLOBALUTIL.formatNumber(r.y * 57.2958).trim()}&deg;`;
    html += ` z ${GLOBALUTIL.formatNumber(r.z * 57.2958).trim()}&deg;`;

    hp.infoDom.innerHTML = html;
    this.context.setGhostBlock('rotatePreview', null);

    if (hp.input.value === "0" || !GLOBALUTIL.isNumeric(hp.input.value)) {
      hp.preview.innerHTML = '';
    } else {
      this.context.alphaFadeMesh = true;
      let val = Number(hp.input.value);
      let type = hp.select.value;
      let tNode = sObj.clone('rotateClonePreview');

      let x2 = Number(sObj.rotation.x);
      let y2 = Number(sObj.rotation.y);
      let z2 = Number(sObj.rotation.z);
      let vector = new BABYLON.Vector3(x2, y2, z2);
      vector[type.toLowerCase()] = val / 57.2958;
      tNode.rotation = vector;
      let x = GLOBALUTIL.formatNumber(tNode.rotation.x * 57.2958).trim();
      let y = GLOBALUTIL.formatNumber(tNode.rotation.y * 57.2958).trim();
      let z = GLOBALUTIL.formatNumber(tNode.rotation.z * 57.2958).trim();
      let html = `x ${x}&deg; y ${y}&deg; z ${z}&deg;`;

      tNode.visibility = 1;
      tNode.material = new BABYLON.StandardMaterial('material', this.context.scene);
      tNode.material.diffuseColor = GLOBALUTIL.color('0,.3,.8');
      tNode.material.diffuseColor.alpha = 0.7;
      this.context.setGhostBlock('rotatePreview', new cBlock(this.context, null, tNode));
      hp.preview.innerHTML = html;
    }
  }
  _rotateInitDom() {
    let c = this.fireFields.groups['rotate'];
    this.helperPanels['rotate'] = this.__initDOMWrapper(c);
    let hp = this.helperPanels['rotate'];
    let aD = hp.actionDom;
    aD.classList.add('rotate');
    let html = '<select class="form-control axis"><option>X</option><option>Y</option><option>Z</option></select>';
    html += ' <input type="range" min="0" max="360" step=".01" value="0" />' +
      ' <input class="form-control" type="text" value="0" />&deg;' +
      ' <button class="btn">Rotate</button><div class="preview"></div>';
    aD.innerHTML = html;
    hp.moveButton = aD.querySelector('button');
    hp.select = aD.querySelector('select.axis');
    hp.input = aD.querySelector('input[type=text]');
    hp.slider = aD.querySelector('input[type=range]');
    hp.select.addEventListener('input', e => this.__sliderHandleInputChange(hp, null), false);
    hp.input.addEventListener('input', e => this.__sliderHandleInputChange(hp, hp.input), false);
    hp.slider.addEventListener('input', e => this.__sliderHandleInputChange(hp, hp.slider), false);
    hp.moveButton.addEventListener('click', e => this._rotateChangeApply(hp), false);
    hp.preview = aD.querySelector('.preview');
  }
  _scaleChangeApply() {
    let helperPanel = this.helperPanels['scale'];
    if (helperPanel.input.value === '100' || !GLOBALUTIL.isNumeric(helperPanel.input.value))
      return;

    let sObj = this.context.activeContextObject.sceneObject;
    let nObj = this.context.ghostBlocks['scalePreview'].sceneObject;
    let updates = [];
    updates.push({
      field: 'simpleUIDetails.scaleX',
      newValue: GLOBALUTIL.formatNumber(nObj.scaling.x).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.scaling.x).trim()
    });
    updates.push({
      field: 'simpleUIDetails.scaleY',
      newValue: GLOBALUTIL.formatNumber(nObj.scaling.y).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.scaling.y).trim()
    });
    updates.push({
      field: 'simpleUIDetails.scaleZ',
      newValue: GLOBALUTIL.formatNumber(nObj.scaling.z).trim(),
      oldValue: GLOBALUTIL.formatNumber(sObj.scaling.z).trim()
    });

    helperPanel.input.value = 100;
    helperPanel.slider.value = 100;
    gAPPP.a.modelSets[this.tag].commitUpdateList(updates, this.key);
  }
  _scaleDataUpdate() {
    let hp = this.helperPanels['scale'];

    let html = `Original w${GLOBALUTIL.formatNumber(this._oDim.size.x)} h${GLOBALUTIL.formatNumber(this._oDim.size.y)} d${GLOBALUTIL.formatNumber(this._oDim.size.z)}`;
    html += `\n  Actual w${GLOBALUTIL.formatNumber(this._wDim.size.x)} h${GLOBALUTIL.formatNumber(this._wDim.size.y)} d${GLOBALUTIL.formatNumber(this._wDim.size.z)}`;

    hp.infoDom.innerHTML = html;

    this.context.setGhostBlocks('scalePreview', null);

    if (hp.input.value === "100" || !GLOBALUTIL.isNumeric(hp.input.value)) {
      hp.preview.innerHTML = '';
    } else {
      this.context.alphaFadeMesh = true;
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
      tNode.visibility = 1;
      tNode.material = new BABYLON.StandardMaterial('material', this.context.scene);
      tNode.material.diffuseColor = GLOBALUTIL.color('1,.5,0');
      tNode.material.diffuseColor.alpha = 0.7;
      this.context.setGhostBlock('scalePreview', new cBlock(this.context, null, tNode));
      hp.preview.innerHTML = html;
    }
  }
  _scaleInitDom() {
    let c = this.fireFields.groups['scale'];
    this.helperPanels['scale'] = this.__initDOMWrapper(c);
    let hp = this.helperPanels['scale'];
    let aD = hp.actionDom;
    aD.innerHTML = '<input type="range" min="1" max="500" step=".1" value="100" />' +
      ' <input class="form-control" type="text" value="100" />%' +
      ' <button class="btn">Scale</button><div class="preview"></div>';
    hp.scaleButton = aD.querySelector('button');
    hp.input = aD.querySelector('input[type=text]');
    hp.slider = aD.querySelector('input[type=range]');
    hp.input.addEventListener('input', e => this.__sliderHandleInputChange(hp, hp.input), false);
    hp.slider.addEventListener('input', e => this.__sliderHandleInputChange(hp, hp.slider), false);
    hp.scaleButton.addEventListener('click', e => this._scaleChangeApply(hp), false);
    hp.preview = aD.querySelector('.preview');
  }
  __initDOMWrapper(containerDom) {
    let helperDom = document.createElement('div');
    helperDom.setAttribute('class', 'selected-mesh-bounds-helper-box');
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
      actionDom
    };
  }
  __sliderHandleInputChange(helperPanel, sender) {
    if (sender) {
      helperPanel.input.value = sender.value;
      helperPanel.slider.value = sender.value;
    }
    this.handleDataUpdate({
      detail: {
        context: this.context
      }
    });
  }
}
