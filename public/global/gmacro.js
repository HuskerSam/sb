class gMacro {
  constructor() {

    this.addPanelTypeRadios = this.createPanel.querySelector('.block-type-radio-wrapper').querySelectorAll('input[type="radio"]');
    for (let i = 0; i < this.addPanelTypeRadios.length; i++) {
      let value = this.addPanelTypeRadios[i].value;
      this.addPanelTypeRadios[i].addEventListener('change', e => this.handleAddTypeSelect(value));
    }
    this.addElementType = 'Block';

    this.createPanelCreateBtn = this.createPanel.querySelector('.add-button');
    this.createPanelCreateBtn.addEventListener('click', e => this.createItem());
    this.createPanelInput = this.createPanel.querySelector('.add-item-name');
    this.createPanelInput.addEventListener('keypress', e => this.titleKeyPress(e), false);
    this.createMesage = this.createPanel.querySelector('.creating-message');

    this.createPanelCreateBtn = this.createPanel.querySelector('.add-button');
    this.createPanelCreateBtn.addEventListener('click', e => this.createItem());
    this.createPanelInput = this.createPanel.querySelector('.add-item-name');
    this.createPanelInput.addEventListener('keypress', e => this.titleKeyPress(e), false);
    this.createMesage = this.createPanel.querySelector('.creating-message');

  }
  updateFontField(textDom) {
    textDom.style.fontFamily = textDom.value;
  }
  titleKeyPress(e) {
    if (e.code === 'Enter')
      this.createItem();
  }

  textureTemplate() {
    return `<select class="texture-type-select">
        <option>Upload</option>
        <option>Path</option>
      </select>
      <input type="file" class="file-upload-texture" />
      <label class="texture-path-label"><span>Path</span><input type="text" style="width:17em;" class="text-path-texture" list="sbimageslist" /></label>`;
  }
  textureRegister() {
    this.texturePanel = this.createPanel.querySelector('.texture-add-options');
    this.selectTextureType = this.createPanel.querySelector('.texture-type-select');
    this.selectTextureType.addEventListener('input', e => this.textureTypeChange());
    this.textureFile = this.createPanel.querySelector('.file-upload-texture');
    this.texturePathInputLabel = this.createPanel.querySelector('.texture-path-label');
    this.texturePathInput = this.createPanel.querySelector('.text-path-texture');
    this.textureTypeChange();
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
      <br>
      <label><span>Texture</span><input type="text" style="width:15em;" class="texture-picker-select" list="texturedatatitlelookuplist" /></label>`;
  }
  materialRegister() {
    this.addMaterialOptionsPanel = this.createPanel.querySelector('.material-add-options');
    this.materialColorInput = this.createPanel.querySelector('.material-color-add');
    this.materialColorPicker = this.createPanel.querySelector('.material-color-add-colorinput');
    this.diffuseCheckBox = this.createPanel.querySelector('.diffuse-color-checkbox');
    this.emissiveCheckBox = this.createPanel.querySelector('.emissive-color-checkbox');
    this.ambientCheckBox = this.createPanel.querySelector('.ambient-color-checkbox');
    this.specularCheckBox = this.createPanel.querySelector('.specular-color-checkbox');
    this.texturePickerMaterial = this.createPanel.querySelector('.texture-picker-select');

    this.materialColorPicker.addEventListener('input', e => this.materialColorInputChange());
    this.materialColorInput.addEventListener('input', e => this.materialColorTextChange());
    this.materialColorTextChange();
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
    this.addMeshOptionsPanel = this.createPanel.querySelector('.mesh-add-options');
    this.meshMaterialSelectPicker = this.createPanel.querySelector('.mesh-material-picker-select');
    this.meshFile = this.createPanel.querySelector('.mesh-file-upload');
    this.selectMeshType = this.createPanel.querySelector('.mesh-type-select');
    this.selectMeshType.addEventListener('input', e => this.meshTypeChange());
    this.meshPathInputLabel = this.createPanel.querySelector('.mesh-path-label');
    this.meshPathInput = this.createPanel.querySelector('.text-path-mesh');

    this.meshTypeChange();
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
    this.addShapeOptionsPanel = this.createPanel.querySelector('.shape-add-options');
    this.add2dTextPanel = this.createPanel.querySelector('.create-2d-text-plane');
    this.createBoxOptions = this.addShapeOptionsPanel.querySelector('.create-box-options');
    this.createSphereOptions = this.addShapeOptionsPanel.querySelector('.create-sphere-options');
    this.createTextOptions = this.addShapeOptionsPanel.querySelector('.create-text-options');
    this.createCylinderOptions = this.addShapeOptionsPanel.querySelector('.create-cylinder-options');
    this.createShapesSelect = this.createPanel.querySelector('.shape-type-select');
    this.createShapesSelect.addEventListener('input', e => this.shapeTypeChange());
    this.shapeMaterialSelectPicker = this.createPanel.querySelector('.shape-material-picker-select');
    this.shapeAddFontFamily = this.createPanel.querySelector('.font-family-shape-add');
    this.shapeAddFontFamily.addEventListener('input', e => this.updateFontField(this.shapeAddFontFamily));
    this.shapeAddFontFamily2D = this.createPanel.querySelector('.font-family-2d-add');
    this.shapeAddFontFamily2D.addEventListener('input', e => this.updateFontField(this.shapeAddFontFamily2D));
    this.shapeTypeChange();
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

    this.addBlockOptionsPanel = this.createPanel.querySelector('.block-add-options');
    this.blockOptionsPicker = this.createPanel.querySelector('.block-type-select');
    this.blockOptionsPicker.addEventListener('input', e => this.__handleBlockTypeSelectChange());

    this.blockShapePicker = this.createPanel.querySelector('.block-add-shape-type-options');
    this.blockShapePicker.addEventListener('input', e => this.blockShapeChange());
    this.blockShapePanel = this.createPanel.querySelector('.shape-and-text-block-options');
    this.sceneBlockPanel = this.createPanel.querySelector('.scene-block-add-options');
    this.emptyBlockPanel = this.createPanel.querySelector('.scene-empty-block-add-options');
    this.connectorLinePanel = this.createPanel.querySelector('.connector-line-block-add-options');
    this.animatedDashPanel = this.createPanel.querySelector('.animated-line-block-add-options');
    this.storeItemPanel = this.createPanel.querySelector('.store-item-block-add-options');

    this.blockAddFontFamily = this.blockShapePanel.querySelector('.font-family-block-add');
    this.blockAddFontFamily.addEventListener('input', e => this.updateFontField(this.blockAddFontFamily));

    this.skyBoxImages = this.createPanel.querySelector('.skybox-preview-images');
    this.skyBoxInput = this.createPanel.querySelector('.block-skybox-picker-select');
    this.skyBoxInput.addEventListener('input', e => this.__handleSkyboxChange());

    this.cloudImageInput = this.createPanel.querySelector('.block-scene-cloudfile-picker-input');
    this.groundImagePreview = this.createPanel.querySelector('.cloud-file-ground-preview');
    this.generateGroundMaterial = this.createPanel.querySelector('.block-generate-ground');
    this.cloudImageInput.addEventListener('input', e => this.__handleGroundChange());

    this.addSceneLight = this.createPanel.querySelector('.block-add-hemi-light');
    this.shapeDetailsPanel = this.createPanel.querySelector('.block-shape-add-label');
    this.stretchDetailsPanel = this.createPanel.querySelector('.block-stretch-along-width-label');

    this.__handleBlockTypeSelectChange();
    this.blockShapeChange();
    this.__handleSkyboxChange();
    this.handleAddTypeSelect('Block');

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
    let newName = this.createPanelInput.value.trim();
    if (newName === '') {
      alert('Please enter a name');
      return;
    }
    this.createPanelInput.value = '';
    let file = null;
    let scene = gAPPP.mV.scene;
    let tag = this.addElementType.toLowerCase();

    this.createMesage.style.display = 'block';

    let mixin = {};
    if (tag === 'material') {
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

    let generate2DTexture = false;
    let callbackMixin = {};
    if (tag === 'shape') {
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

      if (shapeType === 'plane') {
        mixin.width = this.addShapeOptionsPanel.querySelector('.font-2d-plane-size').value;
        mixin.height = mixin.width;
        mixin.materialName = newName + '_2d_material';

        callbackMixin.textureText = this.addShapeOptionsPanel.querySelector('.text-2d-line-1').value;
        callbackMixin.textureText2 = this.addShapeOptionsPanel.querySelector('.text-2d-line-2').value;
        callbackMixin.textureText3 = this.addShapeOptionsPanel.querySelector('.text-2d-line-3').value;
        callbackMixin.textureText4 = this.addShapeOptionsPanel.querySelector('.text-2d-line-4').value;
        callbackMixin.textFontFamily = this.addShapeOptionsPanel.querySelector('.font-family-2d-add').value;
        callbackMixin.textFontColor = this.addShapeOptionsPanel.querySelector('.font-2d-color').value;
        callbackMixin.textFontSize = this.addShapeOptionsPanel.querySelector('.font-2d-text-size').value;
        generate2DTexture = true;
      }
    }

    if (tag === 'mesh') {
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

    if (tag === 'texture') {
      let sel = this.selectTextureType.value;
      if (sel === 'Upload') {
        if (this.textureFile.files.length > 0)
          file = this.textureFile.files[0];
      }
      if (sel === 'Path') {
        mixin.url = this.texturePathInput.value.trim();
      }
    }

    let generateGround = false;
    let generateLight = false;
    let generateShapeAndText = false;
    let generateAnimatedLine = false;
    let generateConnectorLine = false;
    if (tag === 'block') {
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

    this.context.createObject(tag, newName, file, mixin).then(results => {
      if (generateAnimatedLine)
        wGenerate.generateAnimatedLine(this.context, results.key, newName, mixin);

      if (generateGround)
        this.blockGenerateGround(results.key, newName, mixin, this.cloudImageInput.value.trim());
      if (generateLight)
        this.blockGenerateLight(results.key, newName, mixin);
      if (generateShapeAndText)
        wGenerate.generateShapeAndText(this.context, results.key, newName, mixin);
      if (generateConnectorLine)
        wGenerate.generateConnectorLine(this.context, results.key, newName, callbackMixin);
      if (generate2DTexture)
        wGenerate.generate2DTexture(this.context, results.key, newName, callbackMixin);

      setTimeout(() => {
        gAPPP.dialogs[tag + '-edit'].show(results.key);
        this.createMesage.style.display = 'none';
      }, 300);
    });
  }

}
