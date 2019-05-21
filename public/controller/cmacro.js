class cMacro {
  constructor(panel, tag, view) {
    this.panel = panel;
    this.tag = tag;
    this.view = view;
    this.webFonts = [
      'Work Sans',
      'IBM Plex Sans',
      'Space Mono',
      'Libre Franklin',
      'Rubik',
      'Cormorant',
      'Fira Sans',
      'Eczar',
      'Alegreya Sans',
      'Alegreya',
      'Chivo',
      'Lora',
      'Source Sans Pro',
      'Source Serif Pro',
      'Roboto',
      'Roboto Slab',
      'BioRhyme',
      'Poppins',
      'Achivo Narrow',
      'Libre Baskerville',
      'Playfair Display',
      'Karla',
      'Montserrat',
      'Proza Libre',
      'Spectral',
      'Domine',
      'Crimson Text',
      'Inknut Antiqua',
      'PT Sans',
      'PT Serif',
      'Lato',
      'Cardo',
      'Newton',
      'Open Sans',
      'Inconsolata',
      'Cabin',
      'Anonymous Pro',
      'Raleway',
      'Arvo',
      'Merriweather'
    ];
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
    return `<label><b>${this.tag} name</b>
     <input class="add-item-name" /></label>
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
    let existingTitles = gAPPP.a.modelSets[this.tag].queryCache('title', this.newName);
    let keys = Object.keys(existingTitles);
    if (keys.length > 0) {
      alert(this.tag + ' asset already exists with title ' + this.newName);
      return;
    }

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
     <option>Scene</option>
     <option>Text and Shape</option>
     <option>Animated Line</option>
     <option>Connector Line</option>
     <option>Web Font</option>
    </select>
    <div class="web-font-block-add-options" style="display:none;">
      <label><span>Font Name</span><input type="text" class="genericblockdata" list="webfontsuggestionlist" style="width:15em;" value="" /></label>
    </div>
    <div class="connector-line-block-add-options" style="display:none;">
      <label><span>length</span><input type="text" class="length" value="10" /></label>
      <label><span>diameter</span><input type="text" class="diameter" value=".5" /></label>
      <br>
      <label><span>tessellation</span><input type="text" class="tessellation" value="" /></label>
      <br>
      <label><span>material</span>&nbsp;<input type="text" style="width:15em;" class="material" list="materialdatatitlelookuplist" /></label>
      <br>
      <label>
        <span>pointshape</span>
        <select class="pointshape">
          <option>none</option>
          <option>cylinder</option>
          <option selected>cone</option>
          <option>sphere</option>
        </select>
      </label>
      <br>
      <label><span>pointlength</span><input type="text" class="pointlength" value="1" /></label>
      <label><span>pointdiameter</span><input type="text" class="pointdiameter" value="2" /></label>
      <br>
      <label><span>pointtessellation</span><input type="text" class="pointtessellation" value="" /></label>
      <br>
      <label><span>pointmaterial</span><input type="text" style="width:15em;" class="pointmaterial" list="materialdatatitlelookuplist" /></label>
      <br>
      <label>
        <span>tailshape</span>
        <select class="tailshape">
          <option>none</option>
          <option>cylinder</option>
          <option>cone</option>
          <option selected>sphere</option>
        </select>
      </label>
      <br>
      <label><span>taillength</span><input type="text" class="taillength" value="1" /></label>
      <label><span>taildiameter</span><input type="text" class="taildiameter" value="1" /></label>
      <br>
      <label><span>tailtessellation</span><input type="text" class="tailtessellation" value="" /></label>
      <br>
      <label><span>tailmaterial</span><input type="text" style="width:15em;" class="tailmaterial" list="materialdatatitlelookuplist" /></label>
    </div>
    <div class="animated-line-block-add-options">
      <label><span>dashes</span><input type="text" class="dashes" value="5" /></label>
      <label><span>runlength</span><input type="text" class="runlength" value="1500" /></label>
      <br>
      <label>
        <span>dotshape</span>
        <select class="dotshape">
          <option>cylinder</option>
          <option selected>cone</option>
          <option>ellipsoid</option>
        </select>
      </label>
      <label><span>dashlength</span><input type="text" class="dashlength" value=".5" /></label>
      <br>
      <label><span>tessellation</span><input type="text" class="tessellation" value="" /></label>
      <br>
      <label><span>material</span><input type="text" style="width:15em;" class="material"" list="materialdatatitlelookuplist" /></label>
      <br>
      <label><span>width</span><input type="text" class="width" value="1" /></label>
      <label><span>height</span><input type="text" class="height" value="2" /></label>
      <label><span>depth</span><input type="text" class="depth" value="10" /></label>
    </div>
    <div class="shape-and-text-block-options">
      <label><span>texttext</span><input type="text" style="width:15em;" class="texttext" value="Block Text" /></label>
      <br>
      <label><span>texttextline2</span><input type="text" style="width:15em;" class="texttextline2" value="" /></label>
      <br>
      <label><span>textfontfamily</span><input class="textfontfamily" list="fontfamilydatalist" /></label>
      <label><span>textdepth</span><input type="text" class="textdepth" value=".1" /></label>
      <br>
      <label><span>textmaterial</span>&nbsp;<input type="text" style="width:15em;" class="textmaterial" list="materialdatatitlelookuplist" /></label>
      <br>
      <label><span>createshapetype</span><select class="createshapetype">
        <option>cube</option>
        <option>box</option>
        <option selected>cone</option>
        <option>cylinder</option>
        <option>sphere</option>
        <option>ellipsoid</option>
      </select></label>
      <label><span>tessellation</span><input type="text" class="tessellation" /></label>
      <label><input type="checkbox" class="cylinderhorizontal" />cylinderhorizontal</label>
      <br>
      <label><span>shapematerial</span><input type="text" style="width:15em;" class="shapematerial" list="materialdatatitlelookuplist" /></label>
      <br>
      <label><span>width</span><input type="text" class="width" value="4" /></label>
      <label><span>height</span><input type="text" class="height" value="1" /></label>
      <label><span>depth</span><input type="text" class="depth" value="1" /></label>
    </div>
      <div class="scene-block-add-options" style="text-align:center;">
      <label><span>width</span><input type="text" class="width" value="50" /></label>
      <label><span>height</span><input type="text" class="height" value="16" /></label>
      <label><span>depth</span><input type="text" class="depth" value="50" /></label>
      <br>
      <label><input type="checkbox" class="hemilight" /><span>Add Hemispheric Light</span></label>
      <br>
      <label><input type="checkbox" class="generateground" /><span>Ground</span>
      <input type="text" style="width:15em;" class="groundimage" list="sbimageslist" /></label>
      <img class="cloud-file-ground-preview" crossorigin="anonymous" style="width:5em;height:5em;display:none;">
      <br>
      <label><span>Skybox</span><input type="text" style="width:15em;" class="skybox" list="skyboxlist" /></label>
      <div class="skybox-preview-images"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"><img crossorigin="anonymous"></div>
    </div>
    <div class="csv_block_import_preview"></div>
    <datalist id="webfontsuggestionlist"></datalist>`;
  }
  blockRegister() {

    this.blockOptionsPicker = this.panel.querySelector('.block-type-select');
    this.blockOptionsPicker.addEventListener('input', e => this.blockHelperChange());

    this.blockShapePanel = this.panel.querySelector('.shape-and-text-block-options');
    this.sceneBlockPanel = this.panel.querySelector('.scene-block-add-options');
    this.connectorLinePanel = this.panel.querySelector('.connector-line-block-add-options');
    this.animatedDashPanel = this.panel.querySelector('.animated-line-block-add-options');
    this.webFontPanel = this.panel.querySelector('.web-font-block-add-options');

    this.blockAddFontFamily = this.blockShapePanel.querySelector('.textfontfamily');
    this.blockAddFontFamily.addEventListener('input', e => this.updateFontField(this.blockAddFontFamily));

    this.skyBoxImages = this.sceneBlockPanel.querySelector('.skybox-preview-images');
    this.skyBoxInput = this.sceneBlockPanel.querySelector('.skybox');
    this.skyBoxInput.addEventListener('input', e => this.blockSkyboxChange());

    this.cloudImageInput = this.sceneBlockPanel.querySelector('.groundimage');
    this.groundImagePreview = this.sceneBlockPanel.querySelector('.cloud-file-ground-preview');
    this.generateGroundMaterial = this.panel.querySelector('.generateground');
    this.cloudImageInput.addEventListener('input', e => this.blockGroundChange());

    this.addSceneLight = this.panel.querySelector('.block-add-hemi-light');
    this.stretchDetailsPanel = this.panel.querySelector('.block-stretch-along-width-label');
    this.csv_block_import_preview = this.panel.querySelector('.csv_block_import_preview');

    this.webfontsuggestionlist = this.panel.querySelector('#webfontsuggestionlist');
    let html = '';
    this.webFonts.forEach(font => html += `<option>${font}</option>`);
    this.webfontsuggestionlist.innerHTML = html;

    this.panel.querySelectorAll('input').forEach(i => i.addEventListener('input', e => this.blockUpdateCSV()));
    this.panel.querySelectorAll('select').forEach(i => i.addEventListener('input', e => this.blockUpdateCSV()));

    this.panelInput = document.createElement('input'); //place holder
    this.blockHelperChange();
    this.blockSkyboxChange();
    this.blockUpdateCSV();
  }
  _blockScrapeTextAndShape() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      asset: 'shapeandtext',
      name: this.newName
    };
    let textshapefields = [
      'texttext', 'texttextline2', 'textfontfamily', 'textdepth', 'textmaterial', 'shapematerial',
      'width', 'height', 'depth', 'tessellation', 'cylinderhorizontal', 'createshapetype'
    ];
    textshapefields.forEach(field => {
      let f = this.blockShapePanel.querySelector('.' + field);
      if (f.getAttribute('type') === 'checkbox')
        csv_row[field] = f.checked ? '1' : '';
      else
        csv_row[field] = f.value;
    });
    return csv_row;
  }
  _blockScrapeConnectorLine() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      asset: 'connectorline',
      name: this.newName
    };
    let fields = [
      'length', 'diameter', 'tessellation', 'material', 'pointshape', 'pointlength',
      'pointdiameter', 'pointtessellation', 'pointmaterial', 'tailshape', 'taillength',
      'taildiameter', 'tailtessellation', 'tailmaterial'
    ];
    fields.forEach(field => {
      let f = this.connectorLinePanel.querySelector('.' + field);
      if (f.getAttribute('type') === 'checkbox')
        csv_row[field] = f.checked ? '1' : '';
      else
        csv_row[field] = f.value;
    });
    return csv_row;
  }
  _blockScrapeAnimatedline() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      asset: 'animatedline',
      name: this.newName
    };
    let fields = [
      'dashes', 'runlength', 'dotshape', 'dashlength', 'tessellation', 'material', 'width', 'height', 'depth'
    ];
    fields.forEach(field => {
      let f = this.animatedDashPanel.querySelector('.' + field);
      if (f.getAttribute('type') === 'checkbox')
        csv_row[field] = f.checked ? '1' : '';
      else
        csv_row[field] = f.value;
    });
    return csv_row;
  }
  _blockScrapeWebFont() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      asset: 'block',
      name: this.newName,
      blockflag: 'googlefont'
    };
    let fields = [
      'genericblockdata'
    ];
    fields.forEach(field => {
      let f = this.webFontPanel.querySelector('.' + field);
      if (f.getAttribute('type') === 'checkbox')
        csv_row[field] = f.checked ? '1' : '';
      else
        csv_row[field] = f.value;
    });
    return csv_row;
  }
  _blockScrapeScene() {
    this.newName = this.panelInput.value.trim();
    let csv_row = {
      asset: 'sceneblock',
      name: this.newName
    };
    let fields = [
      'hemilight', 'generateground', 'groundimage', 'skybox', 'width', 'height', 'depth'
    ];
    fields.forEach(field => {
      let f = this.sceneBlockPanel.querySelector('.' + field);
      if (f.getAttribute('type') === 'checkbox')
        csv_row[field] = f.checked ? '1' : '';
      else
        csv_row[field] = f.value;
    });
    return csv_row;
  }
  async blockCreate() {
    let bType = this.blockOptionsPicker.value;
    this.mixin = {};
    this.file = null;
    this.mixin.materialName = '';

    if (bType === 'Web Font') {
      let row = this._blockScrapeWebFont();

      let blockResult = await (new gCSVImport(gAPPP.a.profile.selectedWorkspace)).addCSVRow(row);
      gAPPP._updateGoogleFonts();
      return blockResult.key;
    }
    if (bType === 'Text and Shape') {
      let row = this._blockScrapeTextAndShape();

      let blockResult = await (new gCSVImport(gAPPP.a.profile.selectedWorkspace)).addCSVRow(row);
      return blockResult.key;
    }
    if (bType === 'Scene') {
      let row = this._blockScrapeScene();

      let blockResult = await (new gCSVImport(gAPPP.a.profile.selectedWorkspace)).addCSVRow(row);
      return blockResult.key;
    }
    if (bType === 'Animated Line') {
      let row = this._blockScrapeAnimatedline();

      let blockResult = await (new gCSVImport(gAPPP.a.profile.selectedWorkspace)).addCSVRow(row);
      return blockResult.key;
    }
    if (bType === 'Connector Line') {
      let row = this._blockScrapeConnectorLine();

      let blockResult = await (new gCSVImport(gAPPP.a.profile.selectedWorkspace)).addCSVRow(row);
      return blockResult.key;
    }

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
    this.animatedDashPanel.style.display = 'none';
    this.connectorLinePanel.style.display = 'none';
    this.webFontPanel.style.display = 'none';

    let sel = this.blockOptionsPicker.value;
    if (sel === 'Text and Shape')
      this.blockShapePanel.style.display = '';
    else if (sel === 'Scene')
      this.sceneBlockPanel.style.display = '';
    else if (sel === 'Connector Line')
      this.connectorLinePanel.style.display = '';
    else if (sel === 'Animated Line')
      this.animatedDashPanel.style.display = '';
    else if (sel === 'Web Font')
      this.webFontPanel.style.display = '';
  }
  blockUpdateCSV() {
    let macrotype = this.blockOptionsPicker.value;
    let r = null;
    if (macrotype === 'Text and Shape')
      r = this._blockScrapeTextAndShape();
    if (macrotype === 'Connector Line')
      r = this._blockScrapeConnectorLine();
    if (macrotype === 'Animated Line')
      r = this._blockScrapeAnimatedline();
    if (macrotype === 'Web Font')
      r = this._blockScrapeWebFont();
    if (macrotype === 'Scene')
      r = this._blockScrapeScene();

    if (r) {
      this.csv_block_import_preview.innerHTML = Papa.unparse([r]);
    } else
      this.csv_block_import_preview.innerHTML = new Date();
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
}
