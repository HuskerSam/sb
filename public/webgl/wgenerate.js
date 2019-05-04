class wGenerate {
  constructor(panel, tag) {
    this.panel = panel;
    this.tag = tag;
    if (!tag)
      return this.panel.innerHTML = '';

    panel.innerHTML = this.baseTemplate() + this[tag + 'Template']() + `<hr>`;
    this[tag + 'Register']();
    this.panelCreateBtn = this.panel.querySelector('.add-button');
    this.panelCreateBtn.addEventListener('click', e => this.createItem());
    this.panelInput = this.panel.querySelector('.add-item-name');
    this.panelInput.addEventListener('keypress', e => this.titleKeyPress(e), false);
    this.createMesage = this.panel.querySelector('.creating-message');
  }
  updateFontField(textDom) {
    textDom.style.fontFamily = textDom.value;
  }
  titleKeyPress(e) {
    if (e.code === 'Enter')
      this.createItem();
  }
  baseTemplate() {
    return `<label><b>Add ${this.tag} asset</b> <input style="width:20em;" class="add-item-name" /></label>
      <button class="add-button btn-sb-icon" style="background:rgb(0,127,0);color:white;"><i class="material-icons">add_circle</i></button>
      <div class="creating-message" style="display:none;background:silver;padding: .25em;">Creating...</div><br>`;
  }

  textureTemplate() {
    return `<select class="texture-type-select">
        <option>Upload</option>
        <option>Path</option>
      </select>
      <input type="file" class="file-upload-texture" />&nbsp;
      <label class="texture-path-label"><span>Path</span> <input type="text" style="width:17em;" class="text-path-texture" list="sbimageslist" /></label>`;
  }
  textureRegister() {
    this.texturePanel = this.panel.querySelector('.texture-add-options');
    this.selectTextureType = this.panel.querySelector('.texture-type-select');
    this.selectTextureType.addEventListener('input', e => this.textureTypeChange());
    this.textureFile = this.panel.querySelector('.file-upload-texture');
    this.texturePathInputLabel = this.panel.querySelector('.texture-path-label');
    this.texturePathInput = this.panel.querySelector('.text-path-texture');
    this.textureTypeChange();
  }
  textureCreate() {
    let sel = this.selectTextureType.value;
    if (sel === 'Upload') {
      if (this.textureFile.files.length > 0)
        file = this.textureFile.files[0];
    }
    if (sel === 'Path') {
      mixin.url = this.texturePathInput.value.trim();
    }
  }
  textureTypeChange() {
    this.texturePathInputLabel.style.display = 'none';
    this.textureFile.style.display = 'none';

    let sel = this.selectTextureType.value;
    if (sel === 'Upload')
      this.textureFile.style.display = '';
    else if (sel === 'Path')
      this.texturePathInputLabel.style.display = '';
  }

  materialTemplate() {
    return `<label><input type="checkbox" class="diffuse-color-checkbox" checked />Diffuse</label>
      <label><input type="checkbox" class="ambient-color-checkbox" checked />Ambient</label>
      <label><input type="checkbox" class="emissive-color-checkbox" />Emissive</label>
      <label><input type="checkbox" class="specular-color-checkbox" />Specular</label>
      <br>
      <label>Color <input style="width:12em;" class="material-color-add" type="text" value="1,.5,0" /></label>
      <input type="color" class="material-color-add-colorinput" />
      &nbsp; <label><span>Texture</span>&nbsp;<input type="text" style="width:15em;" class="texture-picker-select" list="texturedatatitlelookuplist" /></label>`;
  }
  materialRegister() {
    this.addMaterialOptionsPanel = this.panel.querySelector('.material-add-options');
    this.materialColorInput = this.panel.querySelector('.material-color-add');
    this.materialColorPicker = this.panel.querySelector('.material-color-add-colorinput');
    this.diffuseCheckBox = this.panel.querySelector('.diffuse-color-checkbox');
    this.emissiveCheckBox = this.panel.querySelector('.emissive-color-checkbox');
    this.ambientCheckBox = this.panel.querySelector('.ambient-color-checkbox');
    this.specularCheckBox = this.panel.querySelector('.specular-color-checkbox');
    this.texturePickerMaterial = this.panel.querySelector('.texture-picker-select');

    this.materialColorPicker.addEventListener('input', e => this.materialColorInputChange());
    this.materialColorInput.addEventListener('input', e => this.materialColorTextChange());
    this.materialColorTextChange();
  }
  materialCreate() {
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
  materialColorTextChange() {
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
  materialColorInputChange() {
    let bColor = GLOBALUTIL.HexToRGB(this.materialColorPicker.value);
    this.materialColorInput.value = bColor.r.toFixed(2) + ',' + bColor.g.toFixed(2) + ',' + bColor.b.toFixed(2);
  }

  meshTemplate() {
    return `<select class="mesh-type-select">
        <option>Upload</option>
        <option>Path</option>
      </select>
    <input type="file" class="mesh-file-upload" />
    <label class="mesh-path-label"><span>Path</span><input type="text" style="width:17em;" class="text-path-mesh" list="sbmesheslist" /></label>
    <br>
    <label><span>Material</span><input type="text" style="width:15em;" class="mesh-material-picker-select" list="materialdatatitlelookuplist" /></label>`;
  }
  meshRegister() {
    this.addMeshOptionsPanel = this.panel.querySelector('.mesh-add-options');
    this.meshMaterialSelectPicker = this.panel.querySelector('.mesh-material-picker-select');
    this.meshFile = this.panel.querySelector('.mesh-file-upload');
    this.selectMeshType = this.panel.querySelector('.mesh-type-select');
    this.selectMeshType.addEventListener('input', e => this.meshTypeChange());
    this.meshPathInputLabel = this.panel.querySelector('.mesh-path-label');
    this.meshPathInput = this.panel.querySelector('.text-path-mesh');

    this.meshTypeChange();
  }
  meshCreate() {
    mixin.materialName = this.meshMaterialSelectPicker.value;
    let sel = this.selectMeshType.value;
    if (sel === 'Upload') {
      if (this.meshFile.files.length > 0)
        file = this.meshFile.files[0];
    }
    if (sel === 'Path') {
      mixin.url = this.meshPathInput.value.trim();
    }
  }
  meshTypeChange() {
    this.meshPathInputLabel.style.display = 'none';
    this.meshFile.style.display = 'none';

    let sel = this.selectMeshType.value;
    if (sel === 'Upload')
      this.meshFile.style.display = '';
    else if (sel === 'Path')
      this.meshPathInputLabel.style.display = '';
  }

  shapeTemplate() {
    return `<div class="create-sphere-options">
      <label><span>Diameter</span><input type="text" class="sphere-diameter" /></label>
    </div>
    <div class="create-2d-text-plane">
      <label><span>Text</span><input class="text-2d-line-1" value="Text Line" /></label>
      <br>
      <label><span>Line 2</span><input class="text-2d-line-2" value="" /></label>
      <br>
      <label><span>Line 3</span><input class="text-2d-line-3" value="" /></label>
      <br>
      <label><span>Line 4</span><input class="text-2d-line-4" value="" /></label>
      <br>
      <label><span>Font</span><input class="font-family-2d-add" list="fontfamilydatalist" /></label>
      <br>
      <label><span>Color</span><input class="font-2d-color" color="0,0,0" /></label>
      <br>
      <label><span>Text Size</span><input class="font-2d-text-size" value="100" /></label>
      <br>
      <label><span>Plane Size</span><input class="font-2d-plane-size" value="4" /></label>
    </div>
    <div class="create-cylinder-options">
      <label><span>Diameter</span><input type="text" class="cylinder-diameter"></label>
      <label><span>Height</span><input type="text" class="cylinder-height"></label>
    </div>
    <div class="create-text-options">
      <label><span>Text</span><input class="text-shape-add" value="3D Text" /></label>
      <br>
      <label><span>Font</span><input class="font-family-shape-add" list="fontfamilydatalist" /></label>
    </div>
    <label><span>Material</span><input type="text" style="width:15em;" class="shape-material-picker-select" list="materialdatatitlelookuplist" /></label>
    <div class="create-box-options">
      <label><span>Width</span><input type="text" class="box-width" /></label>
      <label><span>Height</span><input type="text" class="box-height" /></label>
      <label><span>Depth</span><input type="text" class="box-depth" /></label>
    </div>
    <br>
    <select class="shape-type-select">
     <option>2D Text Plane</option>
     <option selected>3D Text</option>
     <option>Box</option>
     <option>Sphere</option>
     <option>Cylinder</option>
    </select>`;
  }
  shapeRegister() {
    this.add2dTextPanel = this.panel.querySelector('.create-2d-text-plane');
    this.createBoxOptions = this.panel.querySelector('.create-box-options');
    this.createSphereOptions = this.panel.querySelector('.create-sphere-options');
    this.createTextOptions = this.panel.querySelector('.create-text-options');
    this.createCylinderOptions = this.panel.querySelector('.create-cylinder-options');
    this.createShapesSelect = this.panel.querySelector('.shape-type-select');
    this.createShapesSelect.addEventListener('input', e => this.shapeTypeChange());
    this.shapeMaterialSelectPicker = this.panel.querySelector('.shape-material-picker-select');
    this.shapeAddFontFamily = this.panel.querySelector('.font-family-shape-add');
    this.shapeAddFontFamily.addEventListener('input', e => this.updateFontField(this.shapeAddFontFamily));
    this.shapeAddFontFamily2D = this.panel.querySelector('.font-family-2d-add');
    this.shapeAddFontFamily2D.addEventListener('input', e => this.updateFontField(this.shapeAddFontFamily2D));
    this.shapeTypeChange();
  }
  shapeCreate() {
    let sT = this.createShapesSelect.value;
    let shapeType = 'box';
    if (sT === 'Sphere')
      shapeType = 'sphere';
    else if (sT === '3D Text')
      shapeType = 'text';
    else if (sT === 'Cylinder')
      shapeType = 'cylinder';
    else if (sT === '2D Text Plane')
      shapeType = 'plane';

    mixin.shapeType = shapeType;
    if (shapeType === 'text') {
      mixin.textText = this.createTextOptions.querySelector('.text-shape-add').value;
      mixin.textFontFamily = this.createTextOptions.querySelector('.font-family-shape-add').value;
    }
    if (shapeType === 'sphere') {
      mixin.sphereDiameter = this.panel.querySelector('.sphere-diameter').value;
    }
    if (shapeType === 'box') {
      mixin.boxWidth = this.panel.querySelector('.box-width').value;
      mixin.boxHeight = this.panel.querySelector('.box-height').value;
      mixin.boxDepth = this.panel.querySelector('.box-depth').value;
    }
    if (shapeType === 'cylinder') {
      mixin.cylinderDiameter = this.panel.querySelector('.cylinder-diameter').value;
      mixin.cylinderHeight = this.panel.querySelector('.cylinder-height').value;
    }
    mixin.materialName = this.shapeMaterialSelectPicker.value;

    if (shapeType === 'plane') {
      mixin.width = this.panel.querySelector('.font-2d-plane-size').value;
      mixin.height = mixin.width;
      mixin.materialName = newName + '_2d_material';

      callbackMixin.textureText = this.panel.querySelector('.text-2d-line-1').value;
      callbackMixin.textureText2 = this.panel.querySelector('.text-2d-line-2').value;
      callbackMixin.textureText3 = this.panel.querySelector('.text-2d-line-3').value;
      callbackMixin.textureText4 = this.panel.querySelector('.text-2d-line-4').value;
      callbackMixin.textFontFamily = this.panel.querySelector('.font-family-2d-add').value;
      callbackMixin.textFontColor = this.panel.querySelector('.font-2d-color').value;
      callbackMixin.textFontSize = this.panel.querySelector('.font-2d-text-size').value;
      generate2DTexture = true;
    }
  }
  shapeTypeChange() {
    this.createBoxOptions.style.display = this.createShapesSelect.value === 'Box' ? '' : 'none';
    this.createSphereOptions.style.display = this.createShapesSelect.value === 'Sphere' ? '' : 'none';
    this.createTextOptions.style.display = this.createShapesSelect.value === '3D Text' ? '' : 'none';
    this.createCylinderOptions.style.display = this.createShapesSelect.value === 'Cylinder' ? '' : 'none';
    this.add2dTextPanel.style.display = this.createShapesSelect.value === '2D Text Plane' ? '' : 'none';
    this.shapeMaterialSelectPicker.parentElement.style.display = this.createShapesSelect.value != '2D Text Plane' ? '' : 'none';
  }

  blockTemplate() {
    return `<label><span>W</span><input type="text" class="block-box-width" value="" /></label>
    <label><span>H</span><input type="text" class="block-box-height" value="" /></label>
    <label><span>D</span><input type="text" class="block-box-depth" value="" /></label>`;
  }
  sceneTemplate() {
    return `<label><input type="checkbox" class="block-add-hemi-light" /><span>Add Hemispheric Light</span></label>
      <hr>
      <label><input type="checkbox" class="block-generate-ground" /><span>Create Ground Material</span></label>
      <br>
      <label><span>Image Path</span><input type="text" style="width:15em;" class="block-scene-cloudfile-picker-input" list="sbimageslist" /></label>
      <br>
      <img class="cloud-file-ground-preview" crossorigin="anonymous" style="width:5em;height:5em;display:none;">
      <hr>
      <label><span>Skybox</span><input type="text" style="width:15em;" class="block-skybox-picker-select" list="skyboxlist" /></label>
      <div class="skybox-preview-images"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"></div>
      <br>
      <label><span>W</span><input type="text" class="block-box-width" value="50" /></label>
      <label><span>H</span><input type="text" class="block-box-height" value="16" /></label>
      <label><span>D</span><input type="text" class="block-box-depth" value="50" /></label>`;
  }
  connectorLineTemplate() {
    return `<label><span>Length</span><input type="text" class="line-length" value="10" /></label>
      <label><span>Diameter</span><input type="text" class="line-diameter" value=".5" /></label>
      <label><span>Sides</span><input type="text" class="line-sides" value="" /></label>
      <br>
      <label><span>Material</span><input type="text" style="width:15em;" class="line-material" list="materialdatatitlelookuplist" /></label>
      <br>
      <label>
        <span>Point</span>
        <select class="point-shape">
          <option>None</option>
          <option>Cylinder</option>
          <option selected>Cone</option>
          <option>Ellipsoid</option>
        </select>
      </label>
      <br>
      <label><span>Length</span><input type="text" class="point-length" value="1" /></label>
      <label><span>Diameter</span><input type="text" class="point-diameter" value="2" /></label>
      <label><span>Sides</span><input type="text" class="point-sides" value="" /></label>
      <br>
      <label><span>Material</span><input type="text" style="width:15em;" class="point-material" list="materialdatatitlelookuplist" /></label>
      <br>
      <label>
        <span>Tail Shape</span>
        <select class="tail-shape">
          <option>None</option>
          <option>Cylinder</option>
          <option>Cone</option>
          <option selected>Ellipsoid</option>
        </select>
      </label>
      <br>
      <label><span>Length</span><input type="text" class="tail-length" value="1" /></label>
      <label><span>Diameter</span><input type="text" class="tail-diameter" value="1" /></label>
      <label><span>Sides</span><input type="text" class="tail-sides" value="" /></label>
      <br>
      <label><span>Material</span><input type="text" style="width:15em;" class="tail-material" list="materialdatatitlelookuplist" /></label>`;
  }
  animatedLineTemplate() {
    return `<label><span>Dashes</span><input type="text" class="animated-line-dash-count" value="5" /></label>
      <label><span>Run Time</span><input type="text" class="animated-run-time" value="1500" /></label>
      <br>
      <label>
        <span>Shape</span>
        <select class="block-add-dash-shape-type-options">
          <option>Cylinder</option>
          <option selected>Cone</option>
          <option>Ellipsoid</option>
        </select>
      </label>
      <label><span>Sides</span><input type="text" class="dash-shape-sides" value="" /></label>
      <label><span>Length</span><input type="text" class="dash-box-depth" value=".5" /></label>
      <br>
      <label><span>Material</span><input type="text" style="width:15em;" class="dash-shape-material-picker-select" list="materialdatatitlelookuplist" /></label>
      <br>
      <label><span>W</span><input type="text" class="block-box-width" value="1" /></label>
      <label><span>H</span><input type="text" class="block-box-height" value="2" /></label>
      <label><span>Len</span><input type="text" class="block-box-depth" value="10" /></label>`;
  }
  shapeAndTextTemplate() {
    return `<label><span>Line 1</span><input type="text" style="width:15em;" class="block-box-text" value="Block Text" /></label>
      <br>
      <label><span>Line 2</span><input type="text" style="width:15em;" class="block-box-text-line2" value="" /></label>
      <br>
      <label><span>Font</span><input class="font-family-block-add" list="fontfamilydatalist" /></label>
      <label><span>Depth</span><input type="text" class="block-text-depth" value=".1" /></label>
      <br>
      <label><span>Material</span><input type="text" style="width:15em;" class="block-material-picker-select" list="materialdatatitlelookuplist" /></label>
      <hr>

      <label><span>Shape</span><select class="block-add-shape-type-options"><option>Cube</option><option>Box</option><option selected>Cone</option>
        <option>Cylinder</option><option>Sphere</option><option>Ellipsoid</option></select></label>
      <label class="block-shape-add-label"><span>Divs</span><input type="text" class="block-add-shape-sides" /></label>
      <label class="block-stretch-along-width-label"><input type="checkbox" class="shape-stretch-checkbox" />Horizontal</label>
      <br>
      <label><span>Material</span><input type="text" style="width:15em;" class="block-shapematerial-picker-select" list="materialdatatitlelookuplist" /></label>
      <br>
      <label><span>W</span><input type="text" class="block-box-width" value="4" /></label>
      <label><span>H</span><input type="text" class="block-box-height" value="1" /></label>
      <label><span>D</span><input type="text" class="block-box-depth" value="1" /></label>`;
  }
  blockRegister() {

    this.addBlockOptionsPanel = this.panel.querySelector('.block-add-options');
    this.blockOptionsPicker = this.panel.querySelector('.block-type-select');
    this.blockOptionsPicker.addEventListener('input', e => this.__handleBlockTypeSelectChange());

    this.blockShapePicker = this.panel.querySelector('.block-add-shape-type-options');
    this.blockShapePicker.addEventListener('input', e => this.blockShapeChange());
    this.blockShapePanel = this.panel.querySelector('.shape-and-text-block-options');
    this.sceneBlockPanel = this.panel.querySelector('.scene-block-add-options');
    this.emptyBlockPanel = this.panel.querySelector('.scene-empty-block-add-options');
    this.connectorLinePanel = this.panel.querySelector('.connector-line-block-add-options');
    this.animatedDashPanel = this.panel.querySelector('.animated-line-block-add-options');
    this.storeItemPanel = this.panel.querySelector('.store-item-block-add-options');

    this.blockAddFontFamily = this.blockShapePanel.querySelector('.font-family-block-add');
    this.blockAddFontFamily.addEventListener('input', e => this.updateFontField(this.blockAddFontFamily));

    this.skyBoxImages = this.panel.querySelector('.skybox-preview-images');
    this.skyBoxInput = this.panel.querySelector('.block-skybox-picker-select');
    this.skyBoxInput.addEventListener('input', e => this.__handleSkyboxChange());

    this.cloudImageInput = this.panel.querySelector('.block-scene-cloudfile-picker-input');
    this.groundImagePreview = this.panel.querySelector('.cloud-file-ground-preview');
    this.generateGroundMaterial = this.panel.querySelector('.block-generate-ground');
    this.cloudImageInput.addEventListener('input', e => this.__handleGroundChange());

    this.addSceneLight = this.panel.querySelector('.block-add-hemi-light');
    this.shapeDetailsPanel = this.panel.querySelector('.block-shape-add-label');
    this.stretchDetailsPanel = this.panel.querySelector('.block-stretch-along-width-label');

    this.__handleBlockTypeSelectChange();
    this.blockShapeChange();
    this.__handleSkyboxChange();
    this.handleAddTypeSelect('Block');

  }
  blockCreate() {
    let bType = this.blockOptionsPicker.value;

    if (bType === 'Empty') {
      mixin.width = this.addBlockOptionsPanel.querySelector('.block-box-width').value;
      mixin.height = this.addBlockOptionsPanel.querySelector('.block-box-height').value;
      mixin.depth = this.addBlockOptionsPanel.querySelector('.block-box-depth').value;
    }

    if (bType === 'Scene') {
      mixin.width = this.sceneBlockPanel.querySelector('.block-box-width').value;
      mixin.height = this.sceneBlockPanel.querySelector('.block-box-height').value;
      mixin.depth = this.sceneBlockPanel.querySelector('.block-box-depth').value;
      mixin.skybox = this.skyBoxInput.value.trim();

      if (this.generateGroundMaterial.checked) {
        generateGround = true;
        mixin.groundMaterial = newName + '_groundmaterial';
      }
      if (this.addSceneLight.checked)
        generateLight = true;
    }

    if (bType === 'Text and Shape') {
      mixin.width = this.blockShapePanel.querySelector('.block-box-width').value;
      mixin.height = this.blockShapePanel.querySelector('.block-box-height').value;
      mixin.depth = this.blockShapePanel.querySelector('.block-box-depth').value;

      mixin.textText = this.blockShapePanel.querySelector('.block-box-text').value;
      mixin.textTextLine2 = this.blockShapePanel.querySelector('.block-box-text-line2').value;
      mixin.textFontFamily = this.blockShapePanel.querySelector('.font-family-block-add').value;
      mixin.textMaterial = this.blockShapePanel.querySelector('.block-material-picker-select').value;
      mixin.textDepth = this.blockShapePanel.querySelector('.block-text-depth').value;
      mixin.shapeMaterial = this.blockShapePanel.querySelector('.block-shapematerial-picker-select').value;
      mixin.shapeDivs = this.blockShapePanel.querySelector('.block-add-shape-sides').value;
      mixin.cylinderHorizontal = this.blockShapePanel.querySelector('.shape-stretch-checkbox').checked;
      mixin.createShapeType = this.blockShapePicker.value;
      generateShapeAndText = true;
    }

    if (bType === 'Animated Line') {
      mixin.width = this.animatedDashPanel.querySelector('.block-box-width').value;
      mixin.height = this.animatedDashPanel.querySelector('.block-box-height').value;
      mixin.depth = this.animatedDashPanel.querySelector('.block-box-depth').value;

      mixin.dashCount = this.animatedDashPanel.querySelector('.animated-line-dash-count').value;
      mixin.runTime = this.animatedDashPanel.querySelector('.animated-run-time').value;

      mixin.createShapeType = this.animatedDashPanel.querySelector('.block-add-dash-shape-type-options').value;
      mixin.dashDepth = this.animatedDashPanel.querySelector('.dash-box-depth').value;
      mixin.shapeDivs = this.animatedDashPanel.querySelector('.dash-shape-sides').value;
      mixin.materialName = this.animatedDashPanel.querySelector('.dash-shape-material-picker-select').value;

      generateAnimatedLine = true;
    }
    if (bType === 'Connector Line') {
      callbackMixin.lineLength = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.line-length').value, 1);
      callbackMixin.lineDiameter = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.line-diameter').value, 1);
      callbackMixin.lineMaterial = this.connectorLinePanel.querySelector('.line-material').value;
      callbackMixin.lineSides = this.connectorLinePanel.querySelector('.line-sides').value;

      callbackMixin.pointLength = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.point-length').value, 1);
      callbackMixin.pointDiameter = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.point-diameter').value, 1);
      callbackMixin.pointMaterial = this.connectorLinePanel.querySelector('.point-material').value;
      callbackMixin.pointSides = this.connectorLinePanel.querySelector('.point-sides').value;
      callbackMixin.pointShape = this.connectorLinePanel.querySelector('.point-shape').value;

      callbackMixin.tailLength = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.tail-length').value, 1);
      callbackMixin.tailDiameter = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.tail-diameter').value, 1);
      callbackMixin.tailMaterial = this.connectorLinePanel.querySelector('.tail-material').value;
      callbackMixin.tailSides = this.connectorLinePanel.querySelector('.tail-sides').value;
      callbackMixin.tailShape = this.connectorLinePanel.querySelector('.tail-shape').value;

      callbackMixin.adjPointLength = callbackMixin.pointLength;
      callbackMixin.adjPointDiameter = callbackMixin.pointDiameter;
      if (callbackMixin.pointShape === 'None') {
        callbackMixin.adjPointLength = 0;
        callbackMixin.adjPointDiameter = 0;
      }
      callbackMixin.adjTailLength = callbackMixin.tailLength;
      callbackMixin.adjTailDiameter = callbackMixin.tailDiameter;
      if (callbackMixin.tailShape === 'None') {
        callbackMixin.adjTailLength = 0;
        callbackMixin.adjTailDiameter = 0;
      }
      callbackMixin.depth = Math.max(callbackMixin.lineDiameter, Math.max(callbackMixin.adjTailDiameter, callbackMixin.adjPointDiameter));
      callbackMixin.height = callbackMixin.depth;
      callbackMixin.width = callbackMixin.lineLength + callbackMixin.adjPointLength / 2.0 + callbackMixin.adjTailLength / 2.0;

      mixin.width = callbackMixin.width;
      mixin.height = callbackMixin.height;
      mixin.depth = callbackMixin.depth;

      generateConnectorLine = true;
    }
  }
  blockShapeChange() {
    this.shapeDetailsPanel.style.display = 'none';
    this.stretchDetailsPanel.style.display = 'none';
    let shape = this.blockShapePicker.value;

    if (shape !== 'Box' && shape !== 'Cube')
      this.shapeDetailsPanel.style.display = '';

    if (shape === 'Cone' || shape === 'Cylinder')
      this.stretchDetailsPanel.style.display = '';
  }
  blockGenerateLight(blockKey, blockTitle, mixin) {
    this.context.createObject('blockchild', '', null, {
      childType: 'light',
      childName: 'Hemispheric',
      parentKey: blockKey
    }).then(results => {
      this.context.createObject('frame', '', null, {
        frameTime: '',
        frameOrder: '10',
        parentKey: results.key,
        lightDiffuseR: '1',
        lightIntensity: '.35',
        lightDiffuseG: '1',
        lightDiffuseB: '1',
        lightSpecularR: '1',
        lightSpecularG: '1',
        lightSpecularB: '1',
        lightDirectionX: '0',
        lightDirectionY: '1',
        lightDirectionZ: '0'
      })
    });

  }
  blockGenerateGround(blockKey, blockTitle, mixin, imgPath) {
    let textureName = blockTitle + '_groundtexture';
    let materialName = blockTitle + '_groundmaterial';
    this.context.createObject('texture', textureName, null, {
      url: imgPath,
      vScale: mixin.depth,
      uScale: mixin.width
    }).then(results => {});
    this.context.createObject('material', materialName, null, {
      diffuseTextureName: textureName
    }).then(results => {});
  }
  __handleGroundChange() {
    let cloudImage = this.cloudImageInput.value.trim();

    this.groundImagePreview.style.display = '';
    if (cloudImage !== '') {
      let url = cloudImage;
      if (url.substring(0, 3) === 'sb:') {
        url = gAPPP.cdnPrefix + 'textures/' + url.substring(3);
      }
      this.groundImagePreview.setAttribute('src', url);
    } else {
      this.groundImagePreview.style.display = 'none';
    }

  }
  __handleSkyboxChange() {
    let skybox = this.skyBoxInput.value.trim();

    if (skybox === '')
      this.skyBoxImages.style.display = 'none';
    else {
      this.skyBoxImages.style.display = '';
      let imgs = this.skyBoxImages.querySelectorAll('img');

      let skyboxPath = gAPPP.cdnPrefix + 'box/' + skybox + '/skybox';

      imgs[0].setAttribute('src', skyboxPath + '_nx.jpg');
      imgs[1].setAttribute('src', skyboxPath + '_px.jpg');
      imgs[2].setAttribute('src', skyboxPath + '_ny.jpg');
      imgs[3].setAttribute('src', skyboxPath + '_py.jpg');
      imgs[4].setAttribute('src', skyboxPath + '_nz.jpg');
      imgs[5].setAttribute('src', skyboxPath + '_pz.jpg');
    }
  }
  __handleBlockTypeSelectChange() {
    this.blockShapePanel.style.display = 'none';
    this.sceneBlockPanel.style.display = 'none';
    this.emptyBlockPanel.style.display = 'none';
    this.animatedDashPanel.style.display = 'none';
    this.connectorLinePanel.style.display = 'none';
    this.storeItemPanel.style.display = 'none';

    let sel = this.blockOptionsPicker.value;
    if (sel === 'Text and Shape')
      this.blockShapePanel.style.display = '';
    else if (sel === 'Scene')
      this.sceneBlockPanel.style.display = '';
    else if (sel === 'Connector Line')
      this.connectorLinePanel.style.display = '';
    else if (sel === 'Animated Line')
      this.animatedDashPanel.style.display = '';
    else if (sel === 'Store Item')
      this.storeItemPanel.style.display = '';
    else
      this.emptyBlockPanel.style.display = '';
  }

  createItem() {
    let newName = this.panelInput.value.trim();
    if (newName === '') {
      alert('Please enter a name');
      return;
    }
    this.panelInput.value = '';
    let file = null;
    let scene = gAPPP.mV.scene;
    let tag = this.addElementType.toLowerCase();
    this.createMesage.style.display = 'block';

    let mixin = {};
    let generate2DTexture = false;
    let callbackMixin = {};
    let generateGround = false;
    let generateLight = false;
    let generateShapeAndText = false;
    let generateAnimatedLine = false;
    let generateConnectorLine = false;

    this.context.createObject(tag, newName, file, mixin).then(results => {
      if (generateAnimatedLine)
        this.generateAnimatedLine(this.context, results.key, newName, mixin);

      if (generateGround)
        this.blockGenerateGround(results.key, newName, mixin, this.cloudImageInput.value.trim());
      if (generateLight)
        this.blockGenerateLight(results.key, newName, mixin);
      if (generateShapeAndText)
        this.generateShapeAndText(this.context, results.key, newName, mixin);
      if (generateConnectorLine)
        this.generateConnectorLine(this.context, results.key, newName, callbackMixin);
      if (generate2DTexture)
        this.generate2DTexture(this.context, results.key, newName, callbackMixin);

      setTimeout(() => {
        gAPPP.dialogs[tag + '-edit'].show(results.key);
        this.createMesage.style.display = 'none';
      }, 300);
    });
  }

  static generateShapeAndText(context, blockId, blockTitle, options) {
    let shapeTextName = blockTitle + '_shapeText';
    let shapeTextNameLine2 = blockTitle + '_shapeTextLine2';
    let textLen = Math.max(options.textText.length, options.textTextLine2.length);
    let scale = 2 * options.width / textLen;
    let textDepth = GLOBALUTIL.getNumberOrDefault(options.textDepth, .25);
    let height = GLOBALUTIL.getNumberOrDefault(options.height, 1);
    let depth = textDepth;
    if (!depth) depth = '.001';
    let positionY = scale * .5;
    if (options.textTextLine2 === '')
      positionY = 0;
    context.createObject('shape', shapeTextName, null, {
      textText: options.textText,
      shapeType: 'text',
      textFontFamily: options.textFontFamily,
      materialName: options.textMaterial,
      scalingX: scale,
      scalingZ: scale,
      positionY: positionY.toFixed(3),
      textDepth: depth
    }).then(results => {
      context.createObject('blockchild', '', null, {
        childType: 'shape',
        childName: shapeTextName,
        parentKey: blockId
      }).then(innerResults => {
        context.createObject('frame', '', null, {
          frameTime: '',
          frameOrder: '10',
          parentKey: innerResults.key,
          rotationY: '-90deg',
          rotationZ: '-90deg',
          positionZ: (textDepth / 2.0).toFixed(3)
        });
      });
    });

    if (options.textTextLine2 !== '') {
      context.createObject('shape', shapeTextNameLine2, null, {
        textText: options.textTextLine2,
        shapeType: 'text',
        textFontFamily: options.textFontFamily,
        materialName: options.textMaterial,
        scalingX: scale,
        scalingZ: scale,
        positionY: (-1 * positionY).toFixed(3),
        textDepth: depth
      }).then(results => {
        context.createObject('blockchild', '', null, {
          childType: 'shape',
          childName: shapeTextNameLine2,
          parentKey: blockId
        }).then(innerResults => {
          context.createObject('frame', '', null, {
            frameTime: '',
            frameOrder: '10',
            parentKey: innerResults.key,
            rotationY: '-90deg',
            rotationZ: '-90deg',
            positionZ: (textDepth / 2.0).toFixed(3)
          });
        });
      });
    }

    let shapeOptions = {
      width: GLOBALUTIL.getNumberOrDefault(options.width, 1),
      height: GLOBALUTIL.getNumberOrDefault(options.height, 1),
      depth: GLOBALUTIL.getNumberOrDefault(options.depth, 1),
      createShapeType: options.createShapeType,
      materialName: options.shapeMaterial,
      shapeDivs: options.shapeDivs,
      cylinderHorizontal: options.cylinderHorizontal,
      rotationZ: ''
    }

    this.createShapeBlockChild(context, blockId, blockTitle + '_shapeShape', shapeOptions).then(resultsObj => {
      let newObj = {
        frameTime: '',
        frameOrder: '10',
        parentKey: resultsObj.blockChildResults.key
      };

      for (let i in resultsObj.firstFrameOptions)
        newObj[i] = resultsObj.firstFrameOptions[i];

      context.createObject('frame', '', null, newObj).then(resultB => {});
    });
  }
  static createShapeBlockChild(context, blockId, shapeBlockName, shapeOptions, createShape = true) {
    let width = shapeOptions.width;
    let height = shapeOptions.height;
    let depth = shapeOptions.depth;
    let minDim = Math.min(Math.min(width, height), depth);
    let maxDim = Math.max(Math.max(width, height), depth);
    let firstFrameOptions = {};

    firstFrameOptions.positionZ = (-1.0 * minDim / 2.0).toFixed(3);

    if (shapeOptions.createShapeType === 'Cube') {
      shapeOptions.shapeType = 'box';
      shapeOptions.boxSize = minDim;
      shapeOptions.boxWidth = '';
      shapeOptions.boxHeight = '';
      shapeOptions.boxDepth = '';
      firstFrameOptions.positionZ = (-1.0 * minDim / 2.0).toFixed(3);
    }
    if (shapeOptions.createShapeType === 'Box') {
      shapeOptions.shapeType = 'box';
      shapeOptions.boxSize = '';
      shapeOptions.boxWidth = width.toFixed(3);
      shapeOptions.boxHeight = height.toFixed(3);
      shapeOptions.boxDepth = depth.toFixed(3);
    }
    if (shapeOptions.createShapeType === 'Cone' || shapeOptions.createShapeType === 'Cylinder') {
      if (shapeOptions.cylinderHorizontal) {
        firstFrameOptions.rotationZ = '90deg';
        let h = height;
        height = width;
        width = h;
      }

      shapeOptions.shapeType = 'cylinder';
      shapeOptions.cylinderHeight = height.toFixed(3);
      shapeOptions.cylinderDiameter = width.toFixed(3);
      if (width !== depth) {
        firstFrameOptions.scalingZ = (depth / width).toFixed(3);
      }

      shapeOptions.cylinderTessellation = shapeOptions.shapeDivs;
      firstFrameOptions.positionZ = (-1.0 * depth / 2.0).toFixed(3);

      if (shapeOptions.createShapeType === 'Cone')
        shapeOptions.cylinderDiameterTop = 0;
    }
    if (shapeOptions.createShapeType === 'Sphere') {
      shapeOptions.shapeType = 'sphere';
      shapeOptions.sphereDiameter = minDim;
      shapeOptions.sphereSegments = shapeOptions.shapeDivs;
      shapeOptions.boxWidth = '';
      shapeOptions.boxHeight = '';
      shapeOptions.boxDepth = '';
      firstFrameOptions.positionZ = (-1.0 * minDim / 2.0).toFixed(3);
    }
    if (shapeOptions.createShapeType === 'Ellipsoid') {
      shapeOptions.shapeType = 'sphere';
      shapeOptions.sphereDiameter = '';
      shapeOptions.sphereDiameterX = width.toFixed(3);
      shapeOptions.sphereDiameterY = height.toFixed(3);
      shapeOptions.sphereDiameterZ = depth.toFixed(3);
      shapeOptions.sphereSegments = shapeOptions.shapeDivs;
    }

    let createShapePromise = new Promise((resolve) => resolve({}));
    if (createShape)
      createShapePromise = context.createObject('shape', shapeBlockName, null, shapeOptions);

    return new Promise((resolve, reject) => {
      createShapePromise.then(results => {
        context.createObject('blockchild', '', null, {
          childType: 'shape',
          childName: shapeBlockName,
          parentKey: blockId
        }).then(innerResults => resolve({
          blockChildResults: innerResults,
          shapeOptions,
          firstFrameOptions
        }));
      });
    });
  }
  static generateConnectorLine(context, blockId, blockTitle, options) {
    let lineShapeOptions = {
      width: options.lineDiameter,
      shapeDivs: options.lineSides,
      height: options.lineLength,
      depth: options.lineDiameter,
      materialName: options.lineMaterial,
      cylinderHorizontal: false,
      createShapeType: 'Cylinder'
    };
    this.createShapeBlockChild(context, blockId, blockTitle + '_connectorLineShape', lineShapeOptions).then(resultsObj => {
      let frameOrder = 10;
      let newObj = {
        parentKey: resultsObj.blockChildResults.key
      };
      newObj.rotationZ = '90deg';
      newObj.rotationX = '90deg';
      newObj.frameOrder = frameOrder.toString();
      newObj.frameTime = "0";
      context.createObject('frame', '', null, newObj).then(resultB => {});
    });
    let pointShapeOptions = {
      width: options.pointDiameter,
      shapeDivs: options.pointSides,
      height: options.pointDiameter,
      depth: options.pointLength,
      materialName: options.pointMaterial,
      createShapeType: options.pointShape
    };

    if (options.pointShape !== 'None')
      this.createShapeBlockChild(context, blockId, blockTitle + '_connectorPointShape', pointShapeOptions).then(resultsObj => {
        let frameOrder = 10;
        let newObj = {
          parentKey: resultsObj.blockChildResults.key
        };
        if (options.pointShape !== 'Cone' && options.pointShape !== 'Cylinder')
          newObj.rotationY = '90deg';
        newObj.rotationZ = '90deg';
        newObj.positionX = -1.0 * (options.lineLength) / 2.0;
        newObj.frameOrder = frameOrder.toString();
        newObj.frameTime = "0";
        context.createObject('frame', '', null, newObj).then(resultB => {});
      });
    let tailShapeOptions = {
      width: options.tailDiameter,
      shapeDivs: options.tailSides,
      height: options.tailDiameter,
      depth: options.tailLength,
      materialName: options.tailMaterial,
      createShapeType: options.tailShape
    };
    if (options.tailShape !== 'None')
      this.createShapeBlockChild(context, blockId, blockTitle + '_connectorTailShape', tailShapeOptions).then(resultsObj => {
        let frameOrder = 10;
        let newObj = {
          parentKey: resultsObj.blockChildResults.key
        };
        if (options.tailShape !== 'Cone' && options.tailShape !== 'Cylinder')
          newObj.rotationY = '90deg';
        newObj.rotationZ = '90deg';
        newObj.positionX = (options.lineLength) / 2.0;
        newObj.frameOrder = frameOrder.toString();
        newObj.frameTime = "0";
        context.createObject('frame', '', null, newObj).then(resultB => {});
      });
  }
  static generateAnimatedLine(context, blockId, blockTitle, options) {
    let barLength = GLOBALUTIL.getNumberOrDefault(options.depth, 10);
    let shapeOptions = {
      width: GLOBALUTIL.getNumberOrDefault(options.width, 1),
      depth: GLOBALUTIL.getNumberOrDefault(options.dashDepth, 1),
      height: GLOBALUTIL.getNumberOrDefault(options.height, 1),
      createShapeType: options.createShapeType,
      materialName: options.materialName,
      shapeDivs: options.shapeDivs,
      cylinderHorizontal: false,
      rotationZ: ''
    }
    if (shapeOptions.width <= 0.0)
      shapeOptions.width = 0.001;
    if (shapeOptions.height <= 0.0)
      shapeOptions.height = 0.001;
    if (shapeOptions.depth <= 0.0)
      shapeOptions.depth = 0.001;

    let moreOptions = {};
    if (shapeOptions.createShapeType === 'Cone' || shapeOptions.createShapeType === 'Cylinder') {
      let h = shapeOptions.height;
      shapeOptions.height = shapeOptions.depth;
      shapeOptions.depth = h;
      if (shapeOptions.width !== shapeOptions.height) {
        moreOptions.scalingX = (shapeOptions.width / shapeOptions.height).toFixed(3);
        shapeOptions.width = shapeOptions.height;
      }
      moreOptions.rotationX = '90deg';
    }
    if (shapeOptions.createShapeType === 'Ellispoid') {
      let width = shapeOptions.width;
      let height = shapeOptions.height;
      let depth = shapeOptions.depth;
      shapeOptions.depth = width;
      shapeOptions.width = depth;
    }

    moreOptions.positionZ = barLength / 2.0;

    moreOptions.runTime = GLOBALUTIL.getNumberOrDefault(options.runTime, 2000);
    moreOptions.dashCount = GLOBALUTIL.getNumberOrDefault(options.dashCount, 1);
    moreOptions.endTime = moreOptions.runTime;
    moreOptions.timePerDash = moreOptions.runTime / moreOptions.dashCount;

    for (let i = 0; i < moreOptions.dashCount; i++)
      this.__createLineNode(context, blockId, blockTitle, shapeOptions, moreOptions, i, (i === 0));

    let blockFrame = {
      frameTime: moreOptions.endTime.toFixed(3),
      frameOrder: '10',
      parentKey: blockId
    };
    context.createObject('frame', '', null, blockFrame).then(resultB => {});
  }
  static __createLineNode(context, blockId, blockTitle, shapeOptions, moreOptions, index, createShape = true) {
    this.createShapeBlockChild(context, blockId, blockTitle + '_shapeShape', shapeOptions, createShape).then(resultsObj => {
      let frameOrder = 10;
      let newObj = {
        parentKey: resultsObj.blockChildResults.key
      };

      for (let i in resultsObj.firstFrameOptions)
        newObj[i] = resultsObj.firstFrameOptions[i];
      for (let i in moreOptions)
        newObj[i] = moreOptions[i];

      let zLen = newObj.positionZ * 2;
      let minZTime = index * moreOptions.timePerDash;

      let startPos = (-0.5 * zLen) + (index * moreOptions.timePerDash / moreOptions.endTime * zLen);

      newObj.positionZ = startPos;
      newObj.frameOrder = frameOrder.toString();
      newObj.frameTime = "0";
      context.createObject('frame', '', null, newObj).then(resultB => {});
      frameOrder += 10;

      if (minZTime > .001) {
        let zh = zLen / 2.0;
        let iTime = moreOptions.endTime - minZTime;
        newObj.frameTime = (iTime / moreOptions.endTime * 100.0).toFixed(2).toString() + '%';
        newObj.frameOrder = frameOrder.toString();
        newObj.positionZ = zh.toFixed(3);
        context.createObject('frame', '', null, newObj).then(resultB => {});
        frameOrder += 10;

        newObj.frameTime = ((iTime + 5) / moreOptions.endTime * 100.0).toFixed(2).toString() + '%';
        newObj.frameOrder = frameOrder.toString();
        newObj.positionZ = (-1.0 * zh).toFixed(3);
        context.createObject('frame', '', null, newObj).then(resultB => {});
        frameOrder += 10;
      }

      newObj.positionZ = startPos + zLen;
      if (newObj.positionZ > (zLen / 2.0))
        newObj.positionZ -= zLen;
      newObj.frameOrder = frameOrder.toString();
      newObj.frameTime = '100%';
      context.createObject('frame', '', null, newObj).then(resultB => {});
    });
  }
  static generate2DTexture(context, shapeId, shapeTitle, textOptions) {
    context.createObject('material', shapeTitle + '_2d_material', null, {
      diffuseTextureName: shapeTitle + '_2d_texture',
      emissiveTextureName: shapeTitle + '_2d_texture'
    }).then(() => {});
    textOptions.isText = true;
    textOptions.hasAlpha = true;
    context.createObject('texture', shapeTitle + '_2d_texture', null, textOptions).then(() => {});
  }
}
