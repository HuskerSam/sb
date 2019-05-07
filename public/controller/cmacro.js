class cMacro {
  constructor(panel, tag, view) {
    this.panel = panel;
    this.tag = tag;
    this.view = view;
    if (!tag)
      return this.panel.innerHTML = '';

    let base = '';
    if (tag !== 'workspace')
      base = this.baseTemplate();

    panel.innerHTML = base + this[tag + 'Template']() + `<hr>`;
    this[tag + 'Register']();

    if (tag !== 'workspace') {
      this.panelCreateBtn = this.panel.querySelector('.add-button');
      this.panelCreateBtn.addEventListener('click', e => this.createItem());
      this.panelCreateBtn2 = this.panel.querySelector('.add-newwindow-button');
      this.panelCreateBtn2.addEventListener('click', e => this.createItem(true));
      this.panelInput = this.panel.querySelector('.add-item-name');
      this.createMesage = this.panel.querySelector('.creating-message');
    }
  }
  updateFontField(textDom) {
    textDom.style.fontFamily = textDom.value;
  }
  baseTemplate() {
    return `<label><b>Add ${this.tag} asset</b>
     <input style="width:20em;" class="add-item-name" /></label>
      <button class="add-button btn-sb-icon"><i class="material-icons">add_circle</i></button>
      <button class="add-newwindow-button btn-sb-icon"><i class="material-icons">open_in_new</i></button>
      <br>
      <div class="creating-message" style="display:none;background:silver;padding: .25em;">Creating...</div>`;
  }
  static assetJSON(tag, key) {
    if (!tag)
      return '';
    if (!key)
      return '';

    let asset = gAPPP.a.modelSets[tag].getCache(key);
    if (!asset)
      return '';
    let ele = Object.assign({}, asset);

    if (tag === 'block') {
      let frames = gAPPP.a.modelSets['frame'].queryCache('parentKey', key);
      let framesArray = [];
      for (let i in frames)
        framesArray.push(frames[i]);
      ele.frames = framesArray;

      let children = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', key);
      let childArray = [];
      for (let childKey in children) {
        let childFrames = gAPPP.a.modelSets['frame'].queryCache('parentKey', childKey);
        let childFramesArray = [];
        for (let i in childFrames)
          childFramesArray.push(childFrames[i]);
        children[childKey].frames = childFramesArray;
        childArray.push(children[childKey]);
      }
      ele.children = childArray;

    }
    delete ele.renderImageURL;
    ele.assetExportTag = tag;
    ele.assetExportKey = key;
    return JSON.stringify(ele, null, 4);
  }
  createItem(newWindow) {
    this.newName = this.panelInput.value.trim();
    if (this.newName === '') {
      alert('Please enter a name');
      return;
    }
    this.panelInput.value = '';
    this.createMesage.style.display = 'block';

    this[this.tag + 'Create']()
      .then(newKey => {
        this.view.selectItem(newKey, newWindow);
        this.createMesage.style.display = 'none';
      });
  }

  shapeTemplate() {
    return `<select class="shape-type-select">
         <option>Box</option>
         <option>2D Text Plane</option>
         <option>3D Text</option>
         <option>Sphere</option>
         <option>Cylinder</option>
        </select>
        <div class="create-sphere-options" style="display:inline-block">
      <label><span>Diameter</span><input type="text" class="sphere-diameter" /></label>
    </div>
    <div class="create-2d-text-plane">
      <label><span>Text</span><input class="text-2d-line-1" value="Text Line" /></label>
      <label><span>Line 2</span><input class="text-2d-line-2" value="" /></label>
      <label><span>Line 3</span><input class="text-2d-line-3" value="" /></label>
      <label><span>Line 4</span><input class="text-2d-line-4" value="" /></label>
      <label><span>Font</span><input class="font-family-2d-add" list="fontfamilydatalist" /></label>
      <label><span>Color</span><input class="font-2d-color" color="0,0,0" /></label>
      <label><span>Text Size</span><input class="font-2d-text-size" value="100" /></label>
      <label><span>Plane Size</span><input class="font-2d-plane-size" value="4" /></label>
    </div>
    <div class="create-cylinder-options">
      <label><span>Diameter</span><input type="text" class="cylinder-diameter"></label>
      <label><span>Height</span><input type="text" class="cylinder-height"></label>
    </div>
    <div class="create-text-options">
      <label><span>Text</span><input class="text-shape-add" value="3D Text" /></label>
      <label><span>Font</span><input class="font-family-shape-add" list="fontfamilydatalist" /></label>
    </div>
    <label><span>Material</span><input type="text" style="width:15em;" class="shape-material-picker-select" list="materialdatatitlelookuplist" /></label>
    <div class="create-box-options" style="display:inline-block;">
      <label><span>Width</span>&nbsp;<input type="text" class="box-width" /></label>
      <label><span>Height</span>&nbsp;<input type="text" class="box-height" /></label>
      <label><span>Depth</span>&nbsp;<input type="text" class="box-depth" /></label>
    </div>`;
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
  async shapeCreate() {
    this.mixin = {};
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

    this.mixin.shapeType = shapeType;
    if (shapeType === 'text') {
      this.mixin.textText = this.createTextOptions.querySelector('.text-shape-add').value;
      this.mixin.textFontFamily = this.createTextOptions.querySelector('.font-family-shape-add').value;
    }
    if (shapeType === 'sphere') {
      this.mixin.sphereDiameter = this.panel.querySelector('.sphere-diameter').value;
    }
    if (shapeType === 'box') {
      this.mixin.boxWidth = this.panel.querySelector('.box-width').value;
      this.mixin.boxHeight = this.panel.querySelector('.box-height').value;
      this.mixin.boxDepth = this.panel.querySelector('.box-depth').value;
    }
    if (shapeType === 'cylinder') {
      this.mixin.cylinderDiameter = this.panel.querySelector('.cylinder-diameter').value;
      this.mixin.cylinderHeight = this.panel.querySelector('.cylinder-height').value;
    }
    this.mixin.materialName = this.shapeMaterialSelectPicker.value;

    if (shapeType === 'plane') {
      this.mixin.width = this.panel.querySelector('.font-2d-plane-size').value;
      this.mixin.height = this.mixin.width;
      this.mixin.materialName = this.newName + '_2d_material';

      this.callbackMixin = {};
      this.callbackMixin.textureText = this.panel.querySelector('.text-2d-line-1').value;
      this.callbackMixin.textureText2 = this.panel.querySelector('.text-2d-line-2').value;
      this.callbackMixin.textureText3 = this.panel.querySelector('.text-2d-line-3').value;
      this.callbackMixin.textureText4 = this.panel.querySelector('.text-2d-line-4').value;
      this.callbackMixin.textFontFamily = this.panel.querySelector('.font-family-2d-add').value;
      this.callbackMixin.textFontColor = this.panel.querySelector('.font-2d-color').value;
      this.callbackMixin.textFontSize = this.panel.querySelector('.font-2d-text-size').value;

      this.blockCreate2DTexture(gAPPP.activeContext, this.newName, this.callbackMixin);
    }

    let results = await gAPPP.activeContext.createObject(this.tag, this.newName, this.file, this.mixin);
    return results.key;
  }
  shapeTypeChange() {
    this.createBoxOptions.style.display = this.createShapesSelect.value === 'Box' ? '' : 'none';
    this.createSphereOptions.style.display = this.createShapesSelect.value === 'Sphere' ? '' : 'none';
    this.createTextOptions.style.display = this.createShapesSelect.value === '3D Text' ? '' : 'none';
    this.createCylinderOptions.style.display = this.createShapesSelect.value === 'Cylinder' ? '' : 'none';
    this.add2dTextPanel.style.display = this.createShapesSelect.value === '2D Text Plane' ? '' : 'none';
    this.shapeMaterialSelectPicker.parentElement.style.display = this.createShapesSelect.value != '2D Text Plane' ? '' : 'none';
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
  async textureCreate() {
    this.file = null;
    this.mixin = {};
    let sel = this.selectTextureType.value;
    if (sel === 'Upload') {
      if (this.textureFile.files.length > 0)
        this.file = this.textureFile.files[0];
    }
    if (sel === 'Path') {
      this.mixin.url = this.texturePathInput.value.trim();
    }
    let results = await gAPPP.activeContext.createObject(this.tag, this.newName, this.file, this.mixin);
    return results.key;
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
  async materialCreate() {
    this.mixin = {};
    let color = this.materialColorInput.value;
    let texture = this.texturePickerMaterial.value;
    if (this.diffuseCheckBox.checked) {
      this.mixin.diffuseColor = color;
      this.mixin.diffuseTextureName = texture;
    }
    if (this.emissiveCheckBox.checked) {
      this.mixin.emissiveColor = color;
      this.mixin.emissiveTextureName = texture;
    }
    if (this.ambientCheckBox.checked) {
      this.mixin.ambientColor = color;
      this.mixin.ambientTextureName = texture;
    }
    if (this.specularCheckBox.checked) {
      this.mixin.specularColor = color;
      this.mixin.specularTextureName = texture;
    }
    let results = await gAPPP.activeContext.createObject(this.tag, this.newName, this.file, this.mixin);
    return results.key;
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
  async meshCreate() {
    this.mixin = {};
    this.file = null;
    this.mixin.materialName = this.meshMaterialSelectPicker.value;
    let sel = this.selectMeshType.value;
    if (sel === 'Upload') {
      if (this.meshFile.files.length > 0)
        this.file = this.meshFile.files[0];
    }
    if (sel === 'Path') {
      this.mixin.url = this.meshPathInput.value.trim();
    }
    let results = await gAPPP.activeContext.createObject(this.tag, this.newName, this.file, this.mixin);
    return results.key;
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

  blockTemplate() {
    return `<select class="block-type-select">
     <option>Empty</option>
     <option>Scene</option>
     <option>Text and Shape</option>
     <option>Animated Line</option>
     <option>Connector Line</option>
    </select>
    <div class="scene-empty-block-add-options">
      <label><span>W</span><input type="text" class="block-box-width" value="" /></label>
      <label><span>H</span><input type="text" class="block-box-height" value="" /></label>
      <label><span>D</span><input type="text" class="block-box-depth" value="" /></label>
    </div>
    <div class="connector-line-block-add-options" style="display:none;">
      <label><span>Length</span><input type="text" class="line-length" value="10" /></label>
      <label><span>Diameter</span><input type="text" class="line-diameter" value=".5" /></label>
      <label><span>Sides</span><input type="text" class="line-sides" value="" /></label>
      <br>
      <label><span>Material</span>&nbsp;<input type="text" style="width:15em;" class="line-material" list="materialdatatitlelookuplist" /></label>
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
      <label><span>Material</span><input type="text" style="width:15em;" class="tail-material" list="materialdatatitlelookuplist" /></label>
    </div>
    <div class="store-item-block-add-options" style="text-align:right;display:none;">
      <b>Highlight Details</b>
      <br>
      <label><span>Description</span><textarea style="width:15em;" rows="2" cols="1"  class="store-item-block-description"></textarea></label>
      <br>
      <label><span>Image</span><input style="width:15em;"  class="store-item-block-description-image" /></label>
      <br>
      <label><span>Video</span><input style="width:15em;"  class="store-item-block-description-video" /></label>
      <br>
      <b>Item Details</b>
      <br>
      <label><span>Price</span><input type="text" style="width:7em;"  class="store-item-block-price" value="$1.00" /></label>
      &nbsp;
      <label><span>Name</span><input type="text" style="width:10em;"  class="store-item-block-name" value="" /></label>
      <br>
      <label>
        <span></span>
        <select class="store-item-block-type-options">
          <option selected>Block</option>
          <option>Mesh</option>
          <option>Shape</option>
        </select>
      </label>
      <label><span></span><input type="text" style="width:15em;"  class="store-item-block-block" list="blockdatatitlelookuplist" /></label>

      <label><span></span><input type="text" style="width:15em;"  class="store-item-block-mesh" list="sbmesheslist" /></label>
      <br>
      <label><span></span><input type="text" style="width:15em;"  class="store-item-block-shape" list="shapedatatitlelookuplist" /></label>
      <br>
      <br>
      <label><span>Location</span><input type="text" style="width:6em;" class="store-item-block-location" value="0,0,0" /></label>
      &nbsp;
      <label><span>Rotation</span><input type="text" style="width:8em;" class="store-item-block-rotation" value="" /></label>
      <br>
      <label><span>Parent Block</span><input type="text" style="width:15em;"  class="store-item-parent-block" list="blockdatatitlelookuplist"  /></label>
    </div>
    <div class="animated-line-block-add-options">
      <label><span>Dashes</span><input type="text" class="animated-line-dash-count" value="5" /></label>
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
      <label><span>Len</span><input type="text" class="block-box-depth" value="10" /></label>
    </div>
    <div class="shape-and-text-block-options">
      <label><span>Line 1</span><input type="text" style="width:15em;" class="block-box-text" value="Block Text" /></label>
      <label><span>Line 2</span><input type="text" style="width:15em;" class="block-box-text-line2" value="" /></label>
      <br>
      <label><span>Font</span><input class="font-family-block-add" list="fontfamilydatalist" /></label>
      <label><span>Depth</span><input type="text" class="block-text-depth" value=".1" /></label>
      <label><span>Material</span>&nbsp;<input type="text" style="width:15em;" class="block-material-picker-select" list="materialdatatitlelookuplist" /></label>
      <br>
      <label><span>Shape</span><select class="block-add-shape-type-options"><option>Cube</option><option>Box</option><option selected>Cone</option>
        <option>Cylinder</option><option>Sphere</option><option>Ellipsoid</option></select></label>
      <label class="block-shape-add-label"><span>Divs</span><input type="text" class="block-add-shape-sides" /></label>
      <label class="block-stretch-along-width-label"><input type="checkbox" class="shape-stretch-checkbox" />Horizontal</label>
      <br>
      <label><span>Material</span><input type="text" style="width:15em;" class="block-shapematerial-picker-select" list="materialdatatitlelookuplist" /></label>
      <br>
      <label><span>W</span><input type="text" class="block-box-width" value="4" /></label>
      <label><span>H</span><input type="text" class="block-box-height" value="1" /></label>
      <label><span>D</span><input type="text" class="block-box-depth" value="1" /></label>
    </div>
    <div class="scene-block-add-options" style="text-align:center;">
      <label><input type="checkbox" class="block-add-hemi-light" /><span>Add Hemispheric Light</span></label>
      <label><input type="checkbox" class="block-generate-ground" /><span>Create Ground Material</span></label>
      <label><span>Image Path</span><input type="text" style="width:15em;" class="block-scene-cloudfile-picker-input" list="sbimageslist" /></label>
      <br>
      <img class="cloud-file-ground-preview" crossorigin="anonymous" style="width:5em;height:5em;display:none;">
      <br>
      <label><span>Skybox</span><input type="text" style="width:15em;" class="block-skybox-picker-select" list="skyboxlist" /></label>
      <div class="skybox-preview-images"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"></div>
      <br>
      <label><span>W</span><input type="text" class="block-box-width" value="50" /></label>
      <label><span>H</span><input type="text" class="block-box-height" value="16" /></label>
      <label><span>D</span><input type="text" class="block-box-depth" value="50" /></label>
    </div>`;
  }
  blockRegister() {

    this.blockOptionsPicker = this.panel.querySelector('.block-type-select');
    this.blockOptionsPicker.addEventListener('input', e => this.blockHelperChange());

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
    this.skyBoxInput.addEventListener('input', e => this.blockSkyboxChange());

    this.cloudImageInput = this.panel.querySelector('.block-scene-cloudfile-picker-input');
    this.groundImagePreview = this.panel.querySelector('.cloud-file-ground-preview');
    this.generateGroundMaterial = this.panel.querySelector('.block-generate-ground');
    this.cloudImageInput.addEventListener('input', e => this.blockGroundChange());

    this.addSceneLight = this.panel.querySelector('.block-add-hemi-light');
    this.shapeDetailsPanel = this.panel.querySelector('.block-shape-add-label');
    this.stretchDetailsPanel = this.panel.querySelector('.block-stretch-along-width-label');

    this.blockHelperChange();
    this.blockShapeChange();
    this.blockSkyboxChange();
  }
  async blockCreate() {
    let bType = this.blockOptionsPicker.value;
    this.mixin = {};
    this.file = null;
    this.mixin.materialName = '';

    if (bType === 'Empty') {
      this.mixin.width = this.emptyBlockPanel.querySelector('.block-box-width').value;
      this.mixin.height = this.emptyBlockPanel.querySelector('.block-box-height').value;
      this.mixin.depth = this.emptyBlockPanel.querySelector('.block-box-depth').value;
      let results = await gAPPP.activeContext.createObject(this.tag, this.newName, this.file, this.mixin);
      return results.key;
    }
    if (bType === 'Text and Shape') {
      this.mixin.width = this.blockShapePanel.querySelector('.block-box-width').value;
      this.mixin.height = this.blockShapePanel.querySelector('.block-box-height').value;
      this.mixin.depth = this.blockShapePanel.querySelector('.block-box-depth').value;

      this.mixin.textText = this.blockShapePanel.querySelector('.block-box-text').value;
      this.mixin.textTextLine2 = this.blockShapePanel.querySelector('.block-box-text-line2').value;
      this.mixin.textFontFamily = this.blockShapePanel.querySelector('.font-family-block-add').value;
      this.mixin.textMaterial = this.blockShapePanel.querySelector('.block-material-picker-select').value;
      this.mixin.textDepth = this.blockShapePanel.querySelector('.block-text-depth').value;
      this.mixin.shapeMaterial = this.blockShapePanel.querySelector('.block-shapematerial-picker-select').value;
      this.mixin.shapeDivs = this.blockShapePanel.querySelector('.block-add-shape-sides').value;
      this.mixin.cylinderHorizontal = this.blockShapePanel.querySelector('.shape-stretch-checkbox').checked;
      this.mixin.createShapeType = this.blockShapePicker.value;
      let results = await gAPPP.activeContext.createObject(this.tag, this.newName, this.file, this.mixin);
      this.blockCreateShapeAndText(gAPPP.activeContext, results.key, this.newName);
      return results.key;
    }
    if (bType === 'Scene') {
      this.mixin.width = this.sceneBlockPanel.querySelector('.block-box-width').value;
      this.mixin.height = this.sceneBlockPanel.querySelector('.block-box-height').value;
      this.mixin.depth = this.sceneBlockPanel.querySelector('.block-box-depth').value;
      this.mixin.skybox = this.skyBoxInput.value.trim();
      if (this.generateGroundMaterial.checked)
        this.mixin.groundMaterial = this.newName + '_groundmaterial';
      let results = await gAPPP.activeContext.createObject(this.tag, this.newName, this.file, this.mixin);

      if (this.generateGroundMaterial.checked)
        this.blockGenerateGround(results.key, this.newName, this.cloudImageInput.value.trim());
      if (this.addSceneLight.checked)
        this.blockCreateLight(results.key, this.newName);

      return results.key;
    }
    if (bType === 'Animated Line') {
      this.mixin.width = this.animatedDashPanel.querySelector('.block-box-width').value;
      this.mixin.height = this.animatedDashPanel.querySelector('.block-box-height').value;
      this.mixin.depth = this.animatedDashPanel.querySelector('.block-box-depth').value;

      this.mixin.dashCount = this.animatedDashPanel.querySelector('.animated-line-dash-count').value;
      this.mixin.runTime = this.animatedDashPanel.querySelector('.animated-run-time').value;

      this.mixin.createShapeType = this.animatedDashPanel.querySelector('.block-add-dash-shape-type-options').value;
      this.mixin.dashDepth = this.animatedDashPanel.querySelector('.dash-box-depth').value;
      this.mixin.shapeDivs = this.animatedDashPanel.querySelector('.dash-shape-sides').value;
      this.mixin.materialName = this.animatedDashPanel.querySelector('.dash-shape-material-picker-select').value;

      let results = await gAPPP.activeContext.createObject(this.tag, this.newName, this.file, this.mixin);
      this.blockCreateAnimatedLine(gAPPP.activeContext, results.key, this.newName);
      return results.key;
    }
    if (bType === 'Connector Line') {
      this.callbackMixin = {};
      this.callbackMixin.lineLength = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.line-length').value, 1);
      this.callbackMixin.lineDiameter = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.line-diameter').value, 1);
      this.callbackMixin.lineMaterial = this.connectorLinePanel.querySelector('.line-material').value;
      this.callbackMixin.lineSides = this.connectorLinePanel.querySelector('.line-sides').value;

      this.callbackMixin.pointLength = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.point-length').value, 1);
      this.callbackMixin.pointDiameter = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.point-diameter').value, 1);
      this.callbackMixin.pointMaterial = this.connectorLinePanel.querySelector('.point-material').value;
      this.callbackMixin.pointSides = this.connectorLinePanel.querySelector('.point-sides').value;
      this.callbackMixin.pointShape = this.connectorLinePanel.querySelector('.point-shape').value;

      this.callbackMixin.tailLength = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.tail-length').value, 1);
      this.callbackMixin.tailDiameter = GLOBALUTIL.getNumberOrDefault(this.connectorLinePanel.querySelector('.tail-diameter').value, 1);
      this.callbackMixin.tailMaterial = this.connectorLinePanel.querySelector('.tail-material').value;
      this.callbackMixin.tailSides = this.connectorLinePanel.querySelector('.tail-sides').value;
      this.callbackMixin.tailShape = this.connectorLinePanel.querySelector('.tail-shape').value;

      this.callbackMixin.adjPointLength = this.callbackMixin.pointLength;
      this.callbackMixin.adjPointDiameter = this.callbackMixin.pointDiameter;
      if (this.callbackMixin.pointShape === 'None') {
        this.callbackMixin.adjPointLength = 0;
        this.callbackMixin.adjPointDiameter = 0;
      }
      this.callbackMixin.adjTailLength = this.callbackMixin.tailLength;
      this.callbackMixin.adjTailDiameter = this.callbackMixin.tailDiameter;
      if (this.callbackMixin.tailShape === 'None') {
        this.callbackMixin.adjTailLength = 0;
        this.callbackMixin.adjTailDiameter = 0;
      }
      this.callbackMixin.depth = Math.max(this.callbackMixin.lineDiameter, Math.max(this.callbackMixin.adjTailDiameter, this.callbackMixin.adjPointDiameter));
      this.callbackMixin.height = this.callbackMixin.depth;
      this.callbackMixin.width = this.callbackMixin.lineLength + this.callbackMixin.adjPointLength / 2.0 + this.callbackMixin.adjTailLength / 2.0;

      this.mixin.width = this.callbackMixin.width;
      this.mixin.height = this.callbackMixin.height;
      this.mixin.depth = this.callbackMixin.depth;

      let results = await gAPPP.activeContext.createObject(this.tag, this.newName, this.file, this.mixin);
      this.blockCreateConnectorLine(gAPPP.activeContext, results.key, this.newName);
      return results.key;
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
  blockGroundChange() {
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
  blockSkyboxChange() {
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
  blockHelperChange() {
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
  blockCreateLight(blockKey, blockTitle) {
    gAPPP.activeContext.createObject('blockchild', '', null, {
      childType: 'light',
      childName: 'Hemispheric',
      parentKey: blockKey
    }).then(results => {
      gAPPP.activeContext.createObject('frame', '', null, {
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
  blockGenerateGround(blockKey, blockTitle, imgPath) {
    let textureName = blockTitle + '_groundtexture';
    let materialName = blockTitle + '_groundmaterial';
    gAPPP.activeContext.createObject('texture', textureName, null, {
      url: imgPath,
      vScale: this.mixin.depth,
      uScale: this.mixin.width
    }).then(results => {});
    gAPPP.activeContext.createObject('material', materialName, null, {
      diffuseTextureName: textureName
    }).then(results => {});
  }
  blockCreateShapeAndText(context, blockId, blockTitle) {
    let shapeTextName = blockTitle + '_shapeText';
    let shapeTextNameLine2 = blockTitle + '_shapeTextLine2';
    let textLen = Math.max(this.mixin.textText.length, this.mixin.textTextLine2.length);
    let scale = 2 * this.mixin.width / textLen;
    let textDepth = GLOBALUTIL.getNumberOrDefault(this.mixin.textDepth, .25);
    let height = GLOBALUTIL.getNumberOrDefault(this.mixin.height, 1);
    let depth = textDepth;
    if (!depth) depth = '.001';
    let positionY = scale * .5;
    if (this.mixin.textTextLine2 === '')
      positionY = 0;
    context.createObject('shape', shapeTextName, null, {
      textText: this.mixin.textText,
      shapeType: 'text',
      textFontFamily: this.mixin.textFontFamily,
      materialName: this.mixin.textMaterial,
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

    if (this.mixin.textTextLine2 !== '') {
      context.createObject('shape', shapeTextNameLine2, null, {
        textText: this.mixin.textTextLine2,
        shapeType: 'text',
        textFontFamily: this.mixin.textFontFamily,
        materialName: this.mixin.textMaterial,
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
      width: GLOBALUTIL.getNumberOrDefault(this.mixin.width, 1),
      height: GLOBALUTIL.getNumberOrDefault(this.mixin.height, 1),
      depth: GLOBALUTIL.getNumberOrDefault(this.mixin.depth, 1),
      createShapeType: this.mixin.createShapeType,
      materialName: this.mixin.shapeMaterial,
      shapeDivs: this.mixin.shapeDivs,
      cylinderHorizontal: this.mixin.cylinderHorizontal,
      rotationZ: ''
    }

    this.blockCreateShapeChild(context, blockId, blockTitle + '_shapeShape', shapeOptions).then(resultsObj => {
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
  blockCreateConnectorLine(context, blockId, blockTitle) {
    let lineShapeOptions = {
      width: this.callbackMixin.lineDiameter,
      shapeDivs: this.callbackMixin.lineSides,
      height: this.callbackMixin.lineLength,
      depth: this.callbackMixin.lineDiameter,
      materialName: this.callbackMixin.lineMaterial,
      cylinderHorizontal: false,
      createShapeType: 'Cylinder'
    };
    this.blockCreateShapeChild(context, blockId, blockTitle + '_connectorLineShape', lineShapeOptions).then(resultsObj => {
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
      width: this.callbackMixin.pointDiameter,
      shapeDivs: this.callbackMixin.pointSides,
      height: this.callbackMixin.pointDiameter,
      depth: this.callbackMixin.pointLength,
      materialName: this.callbackMixin.pointMaterial,
      createShapeType: this.callbackMixin.pointShape
    };

    if (this.callbackMixin.pointShape !== 'None')
      this.blockCreateShapeChild(context, blockId, blockTitle + '_connectorPointShape', pointShapeOptions).then(resultsObj => {
        let frameOrder = 10;
        let newObj = {
          parentKey: resultsObj.blockChildResults.key
        };
        if (this.callbackMixin.pointShape !== 'Cone' && this.callbackMixin.pointShape !== 'Cylinder')
          newObj.rotationY = '90deg';
        newObj.rotationZ = '90deg';
        newObj.positionX = -1.0 * (this.callbackMixin.lineLength) / 2.0;
        newObj.frameOrder = frameOrder.toString();
        newObj.frameTime = "0";
        context.createObject('frame', '', null, newObj).then(resultB => {});
      });
    let tailShapeOptions = {
      width: this.callbackMixin.tailDiameter,
      shapeDivs: this.callbackMixin.tailSides,
      height: this.callbackMixin.tailDiameter,
      depth: this.callbackMixin.tailLength,
      materialName: this.callbackMixin.tailMaterial,
      createShapeType: this.callbackMixin.tailShape
    };
    if (this.callbackMixin.tailShape !== 'None')
      this.blockCreateShapeChild(context, blockId, blockTitle + '_connectorTailShape', tailShapeOptions).then(resultsObj => {
        let frameOrder = 10;
        let newObj = {
          parentKey: resultsObj.blockChildResults.key
        };
        if (this.callbackMixin.tailShape !== 'Cone' && this.callbackMixin.tailShape !== 'Cylinder')
          newObj.rotationY = '90deg';
        newObj.rotationZ = '90deg';
        newObj.positionX = (this.callbackMixin.lineLength) / 2.0;
        newObj.frameOrder = frameOrder.toString();
        newObj.frameTime = "0";
        context.createObject('frame', '', null, newObj).then(resultB => {});
      });
  }
  blockCreateShapeChild(context, blockId, shapeBlockName, shapeOptions, createShape = true) {
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
  blockCreateAnimatedLine(context, blockId, blockTitle) {
    let barLength = GLOBALUTIL.getNumberOrDefault(this.callbackMixin.depth, 10);
    let shapeOptions = {
      width: GLOBALUTIL.getNumberOrDefault(this.callbackMixin.width, 1),
      depth: GLOBALUTIL.getNumberOrDefault(this.callbackMixin.dashDepth, 1),
      height: GLOBALUTIL.getNumberOrDefault(this.callbackMixin.height, 1),
      createShapeType: this.callbackMixin.createShapeType,
      materialName: this.callbackMixin.materialName,
      shapeDivs: this.callbackMixin.shapeDivs,
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

    moreOptions.runTime = GLOBALUTIL.getNumberOrDefault(this.callbackMixin.runTime, 2000);
    moreOptions.dashCount = GLOBALUTIL.getNumberOrDefault(this.callbackMixin.dashCount, 1);
    moreOptions.endTime = moreOptions.runTime;
    moreOptions.timePerDash = moreOptions.runTime / moreOptions.dashCount;

    for (let i = 0; i < moreOptions.dashCount; i++)
      this.blockCreateLineNode(context, blockId, blockTitle, shapeOptions, moreOptions, i, (i === 0));

    let blockFrame = {
      frameTime: moreOptions.endTime.toFixed(3),
      frameOrder: '10',
      parentKey: blockId
    };
    context.createObject('frame', '', null, blockFrame).then(resultB => {});
  }
  blockCreate2DTexture(context, shapeTitle, textOptions) {
    context.createObject('material', shapeTitle + '_2d_material', null, {
      diffuseTextureName: shapeTitle + '_2d_texture',
      emissiveTextureName: shapeTitle + '_2d_texture'
    }).then(() => {});
    textOptions.isText = true;
    textOptions.hasAlpha = true;
    context.createObject('texture', shapeTitle + '_2d_texture', null, textOptions).then(() => {});
  }
  blockCreateLineNode(context, blockId, blockTitle, shapeOptions, moreOptions, index, createShape = true) {
    this.blockCreateShapeChild(context, blockId, blockTitle + '_shapeShape', shapeOptions, createShape).then(resultsObj => {
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
}
