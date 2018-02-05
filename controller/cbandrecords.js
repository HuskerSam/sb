class cBandRecords extends cBandSuper {
  constructor(tag, title, context) {
    super(gAPPP.a.modelSets[tag], tag);

    this.context = context;
    this.title = title;
    this.containerCollapsed = document.querySelector('#sb-floating-toolbar');
    this.containerExpanded = document.querySelector('#sb-floating-toolbar-expanded');
    let d = this.containerCollapsed.querySelector('#sb-floating-toolbar-item-template').cloneNode(true);
    this.wrapper = d.querySelector('.sb-floating-toolbar-item');

    this.wrapper.id = 'sb-' + this.tag + '-floating-toolbar-item';
    this.childrenContainer = this.wrapper.querySelector('.sb-floating-toolbar-content');
    this.containerCollapsed.appendChild(this.wrapper);
    this.titleDom = this.wrapper.querySelector('.button-title');
    this.titleDom.innerHTML = this.title;

    this.bar = this.wrapper.querySelector('.sb-floating-toolbar-content');
    this.createBtn = this.wrapper.querySelector('.sb-floating-toolbar-create-btn');
    this.createPanel = d.querySelector('.add-item-panel');
    this.childrenContainer.appendChild(this.createPanel);
    this.createPanelCreateBtn = this.createPanel.querySelector('.add-button');
    this.createPanelCreateBtn.addEventListener('click', e => this.createItem());
    this.createPanelInput = this.createPanel.querySelector('.add-item-name');
    this.createPanelInput.addEventListener('keypress', e => this._titleKeyPress(e), false);
    this.createMesage = this.createPanel.querySelector('.creating-message');
    this.createPanelShown = false;

    if (this.tag === 'material') {
      this.addMaterialOptionsPanel = this.createPanel.querySelector('.material-add-options');
      this.addMaterialOptionsPanel.style.display = 'block';
      this.materialColorInput = this.createPanel.querySelector('.material-color-add');
      this.materialColorPicker = this.createPanel.querySelector('.material-color-add-colorinput');
      this.diffuseCheckBox = this.createPanel.querySelector('.diffuse-color-checkbox');
      this.emissiveCheckBox = this.createPanel.querySelector('.emissive-color-checkbox');
      this.ambientCheckBox = this.createPanel.querySelector('.ambient-color-checkbox');
      this.specularCheckBox = this.createPanel.querySelector('.specular-color-checkbox');
      this.texturePickerMaterial = this.createPanel.querySelector('.texture-picker-select');

      this.materialColorPicker.addEventListener('input', e => this.__handleMaterialColorInputChange());
      this.materialColorInput.addEventListener('input', e => this.__handleMaterialColorTextChange());
      this.__handleMaterialColorTextChange();
    }

    if (this.tag === 'shape') {
      this.addShapeOptionsPanel = this.createPanel.querySelector('.shape-add-options');
      this.addShapeOptionsPanel.style.display = 'block';
      this.createBoxOptions = this.addShapeOptionsPanel.querySelector('.create-box-options');
      this.createSphereOptions = this.addShapeOptionsPanel.querySelector('.create-sphere-options');
      this.createTextOptions = this.addShapeOptionsPanel.querySelector('.create-text-options');
      this.createCylinderOptions = this.addShapeOptionsPanel.querySelector('.create-cylinder-options');
      this.createShapesSelect = this.addShapeOptionsPanel.querySelector('.shape-type-select');
      this.createShapesSelect.addEventListener('input', e => this.__handleShapesSelectChange());
      this.shapeMaterialSelectPicker = this.createPanel.querySelector('.shape-material-picker-select');
      this.__handleShapesSelectChange();
    }

    if (this.tag === 'mesh') {
      this.addMeshOptionsPanel = this.createPanel.querySelector('.mesh-add-options');
      this.addMeshOptionsPanel.style.display = 'block';
      this.meshMaterialSelectPicker = this.createPanel.querySelector('.mesh-material-picker-select');
      this.meshFile = this.createPanel.querySelector('.mesh-file-upload');
    }

    if (this.tag === 'texture') {
      this.texturePanel = this.createPanel.querySelector('.texture-add-options');
      this.texturePanel.style.display = 'block';
      this.selectTextureType = this.createPanel.querySelector('.texture-type-select');
      this.selectTextureType.addEventListener('input', e => this.__handleTextureTypeChange());
      this.textureFile = this.createPanel.querySelector('.file-upload-texture');
      this.texturePathInputLabel = this.createPanel.querySelector('.texture-path-label');
      this.texturePathInput = this.createPanel.querySelector('.text-path-texture');
      this.__handleTextureTypeChange();
    }

    this.titleDom.addEventListener('click', e => this.toggleChildBandDisplay(undefined, true));
    this.createBtn.addEventListener('click', e => this.toggleCreatePanel());
    if (this.tag === 'mesh' || this.tag === 'texture')
      this.context = new wContext(document.querySelector('#hiddenlowresolutioncanvas'));

    this.buttonWrapper = this.wrapper.querySelector('.button-wrapper');

    let forceExpand = gAPPP.a.profile['mainRecordsExpanded' + this.tag];
    if (forceExpand)
      this.toggleChildBandDisplay(true);
  }
  __handleTextureTypeChange() {
    this.texturePathInputLabel.style.display = 'none';
    this.textureFile.style.display = 'none';

    let sel = this.selectTextureType.value;
    if (sel === 'Upload')
      this.textureFile.style.display = '';
    if (sel === 'Path')
      this.texturePathInputLabel.style.display = '';
  }
  __handleShapesSelectChange() {
    this.createBoxOptions.style.display = this.createShapesSelect.value === 'Box' ? '' : 'none';
    this.createSphereOptions.style.display = this.createShapesSelect.value === 'Sphere' ? '' : 'none';
    this.createTextOptions.style.display = this.createShapesSelect.value === '3D Text' ? '' : 'none';
    this.createCylinderOptions.style.display = this.createShapesSelect.value === 'Cylinder' ? '' : 'none';
  }
  __handleMaterialColorInputChange() {
    let bColor = GLOBALUTIL.HexToRGB(this.materialColorPicker.value);
    this.materialColorInput.value = bColor.r.toFixed(2) + ',' + bColor.g.toFixed(2) + ',' + bColor.b.toFixed(2);
  }
  __handleMaterialColorTextChange() {
    let bColor = GLOBALUTIL.color(this.materialColorInput.value);
    let rH = Math.round(bColor.r * 255).toString(16);
    if (rH.length === 1)
      rH = '0' + rH;
    let gH = Math.round(bColor.g * 255).toString(16);
    if (gH.length === 1)
      gH = '0' + gH;
    let bH = Math.round(bColor.b * 255).toString(16);
    if (bH.length === 1)
      bH = '0' + bH;

    let hex = '#' + rH + gH + bH;
    this.materialColorPicker.value = hex;
  }
  createItem() {
    let newName = this.createPanelInput.value.trim();
    if (newName === '') {
      alert('Please enter a name');
      return;
    }
    let file = null;
    let scene = gAPPP.mV.scene;

    this.createMesage.style.display = 'block';
    this.buttonWrapper.setAttribute('disabled', 'true');

    if (this.tag === 'mesh' || this.tag === 'texture')
      this.context.activate(null);

    let mixin = {};
    if (this.tag === 'material') {
      let color = this.materialColorInput.value;
      let texture = this.texturePickerMaterial.value;
      if (this.diffuseCheckBox.checked) {
        mixin.diffuseColor = color;
        mixin.diffuseTextureName = texture;
      }
      if (this.emissiveCheckBox.checked) {
        mixin.emissiveColor = color;
        mixin.emissiveTextureName = texture;
      }
      if (this.ambientCheckBox.checked) {
        mixin.ambientColor = color;
        mixin.ambientTextureName = texture;
      }
      if (this.specularCheckBox.checked) {
        mixin.specularColor = color;
        mixin.specularTextureName = texture;
      }
    }

    if (this.tag === 'shape') {
      let sT = this.createShapesSelect.value;
      let shapeType = 'box';
      if (sT === 'Sphere')
        shapeType = 'sphere';
      else if (sT === '3D Text')
        shapeType = 'text';
      else if (sT === 'Cylinder')
        shapeType = 'cylinder';

      mixin.shapeType = shapeType;
      if (shapeType === 'text') {
        mixin.textText = this.createTextOptions.querySelector('.text-shape-add').value;
        mixin.textFontFamily = this.createTextOptions.querySelector('.font-family-shape-add').value;
        mixin.scalingX = ".1";
        mixin.scalingY = ".1";
        mixin.scalingZ = ".1";
      }
      if (shapeType === 'sphere') {
        mixin.sphereDiameter = this.addShapeOptionsPanel.querySelector('.sphere-diameter').value;
      }
      if (shapeType === 'box') {
        mixin.boxWidth = this.addShapeOptionsPanel.querySelector('.box-width').value;
        mixin.boxHeight = this.addShapeOptionsPanel.querySelector('.box-height').value;
        mixin.boxDepth = this.addShapeOptionsPanel.querySelector('.box-depth').value;
      }
      if (shapeType === 'cylinder') {
        mixin.cylinderDiameter = this.addShapeOptionsPanel.querySelector('.cylinder-diameter').value;
        mixin.cylinderHeight = this.addShapeOptionsPanel.querySelector('.cylinder-height').value;
      }
      mixin.materialName = this.shapeMaterialSelectPicker.value;
    }

    if (this.tag === 'mesh') {
      mixin.materialName = this.meshMaterialSelectPicker.value;
      if (this.meshFile.files.length > 0)
        file = this.meshFile.files[0];
    }

    if (this.tag === 'texture') {
      let sel = this.selectTextureType.value;
      if (sel === 'Upload'){
        if (this.textureFile.files.length > 0)
          file = this.textureFile.files[0];
      }
      if (sel === 'Path'){
        mixin.url = this.texturePathInput.value.trim();
      }
      if (sel === 'Text'){
      }
    }

    this.context.createObject(this.tag, newName, file, mixin).then(results => {
      if (this.tag !== 'texture')
        this.context.renderPreview(this.tag, results.key);
      else {
        gAPPP.a.modelSets['texture'].commitUpdateList([{
          field: 'renderImageURL',
          newValue: results.url
        }], results.key);
      }

      this.createPanelShown = true;
      this.toggleCreatePanel();
      setTimeout(() => gAPPP.dialogs[this.tag + '-edit'].show(results.key), 600);
    });
  }
  _getDomForChild(key, values) {
    let html = '<div class="band-title"></div><br>' +
      '<button class="btn-sb-icon toggle-btn"><i class="material-icons">chevron_right</i></button>' +
      '<div class="extend-panel" style="display:none;"></div>';

    let outer = document.createElement('div');
    outer.setAttribute('class', `band-background-preview`);
    outer.innerHTML = html.trim();
    let button = outer.childNodes[0];
    let exPanel = outer.querySelector('.extend-panel');
    let dd = document.createElement('div');
    dd.setAttribute('class', `${this.tag}-${key} menu-clipper-wrapper`);
    dd.appendChild(outer);
    let toggle = outer.querySelector('.toggle-btn');
    toggle.addEventListener('click', e => this.toggleState(toggle, exPanel));
    if (this.tag === 'block') {
      let btn = this.__addMenuItem(outer, 'switch_video', e => this._selectBlock(e, key));
      btn.classList.add('select-block-animation-button');
    }

    this.__addMenuItem(exPanel, 'edit', e => this._showEditPopup(e, key));
    this.__addMenuItem(exPanel, 'delete', e => this._removeElement(e, key), true);

    this._nodeApplyValues(values, outer);

    outer.addEventListener('dblclick', e => this._showEditPopup(e, key));
    this.childrenContainer.insertBefore(dd, this.childrenContainer.firstChild);
  }
  toggleState(tgl, pnl) {
    if (pnl.style.display === 'none') {
      pnl.style.display = '';
      tgl.innerHTML = '<i class="material-icons">chevron_left</i>';
    } else {
      pnl.style.display = 'none';
      tgl.innerHTML = '<i class="material-icons">chevron_right</i>';
    }
  }
  _removeElement(e, key) {
    if (!confirm('Are you sure you want to delete this ' + this.tag + '?'))
      return;
    gAPPP.a.modelSets[this.tag].removeByKey(key);
  }
  _selectBlock(e, key) {
    let field = 'selectedBlockKey' + gAPPP.a.profile.selectedWorkspace;
    let updates = [{
      field,
      newValue: key,
      oldValue: gAPPP.a.profile.selectedBlockKey
    }];
    gAPPP.a.modelSets['userProfile'].commitUpdateList(updates);
    gAPPP.mV._updateSelectedBlock(key);
  }
  _showEditPopup(e, key) {
    if (gAPPP.dialogs[this.tag + '-edit'])
      return gAPPP.dialogs[this.tag + '-edit'].show(key);
  }
  toggleCreatePanel() {
    this.createPanelInput.value = '';
    if (this.meshFile)
      this.meshFile.value = '';
    if (this.textureFile)
      this.textureFile.value = '';

    this.createMesage.style.display = 'none';
    this.buttonWrapper.removeAttribute('disabled');

    if (this.createPanelShown) {
      this.createPanelShown = false;
      this.createPanel.style.display = 'none';
      this.createBtn.style.background = 'rgb(240,240,240)';
      this.createBtn.style.color = 'black';
    } else {
      this.createPanelShown = true;
      this.createPanel.style.display = 'block';
      this.createBtn.style.background = 'rgb(50,50,50)';
      this.createBtn.style.color = 'white';
    }
  }
  _titleKeyPress(e) {
    if (e.code === 'Enter')
      this.createItem();
  }
  toggleChildBandDisplay(forceValue = undefined, saveValue = false) {
    if (forceValue === undefined)
      forceValue = (this.bar.style.display !== 'inline-block');

    let expand = !forceValue;
    if (forceValue) {
      this.bar.style.display = 'inline-block';
      this.createBtn.style.display = 'inline-block';
      this.bar.parentNode.style.display = 'flex';
      this.buttonWrapper.classList.add('button-wrapper-invert');
      this.containerExpanded.insertBefore(this.bar.parentNode, null);
      this.wrapper.style.display = 'left';
    } else {
      this.bar.style.display = 'none';
      this.createBtn.style.display = 'none';
      this.bar.parentNode.style.display = 'inline-block';
      this.buttonWrapper.classList.remove('button-wrapper-invert');
      this.containerCollapsed.insertBefore(this.bar.parentNode, null);
      this.wrapper.style.float = '';
      this.createPanelShown = true;
      this.toggleCreatePanel();
    }

    if (saveValue)
      gAPPP.a.modelSets['userProfile'].commitUpdateList([{
        field: 'mainRecordsExpanded' + this.tag,
        newValue: forceValue
      }]);
  }
  __addMenuItem(button, title, clickHandler, prependDivider) {
    let btn = document.createElement('button');
    btn.innerHTML = '<i class="material-icons">' + title + '</i>';
    btn.classList.add('btn-sb-icon');
    button.appendChild(btn);
    btn.addEventListener('click', e => clickHandler(e), false);
    return btn;
  }
}
