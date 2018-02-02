class wBlock {
  constructor(context, parent = null, sceneObject = null) {
    this._blockKey = null;
    this.blockTargetKey = null;
    this.sceneObject = sceneObject;
    this.childBlocks = {};
    this.context = context;
    this.parent = parent;
    this.staticType = '';
    this.blockRenderData = {};
    this.blockRawData = {};
    this.currentMaterialName = '';
    this.containerFieldList = ['width', 'height', 'depth', 'skybox', 'groundMaterial'];
    this.containerCache = {};
    this.containerCenter = {
      x: 0,
      y: 0,
      z: 0
    };
    this.containerDirection = {
      x: 1,
      y: 0,
      z: .5
    };
    this.framesHelper = new wFrames(this.context);
    this.skyboxObject = null;
    this.groundObject = null;
  }
  set blockKey(key) {
    this._blockKey = key;
    this.framesHelper.setParentKey(key, this);
  }
  get blockKey() {
    return this._blockKey;
  }
  _addSkyBox() {
    if (this.skyboxObject)
      this.skyboxObject.dispose();
    this.skyboxObject = null;
    if (!this.blockRawData.skybox)
      return;
    let skyboxPath = 'https://s3.amazonaws.com/sceneassets/skybox/' + this.blockRawData.skybox + '/skybox';
    let skybox = BABYLON.Mesh.CreateBox("skyBox", 800.0, this.context.scene);
    let skyboxMaterial = new BABYLON.StandardMaterial(skyboxPath, this.context.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(skyboxPath, this.context.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    this.skyboxObject = skybox;
  }
  _addGround() {
    if (this.groundObject)
      this.groundObject.dispose();
    this.groundObject = null;
    if (!this.blockRenderData.groundMaterial)
      return;

    let groundMaterial = this.__getGroundMaterialFromParent(this.blockRenderData.groundMaterial);
    let tD = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', groundMaterial);
    if (!tD)
      return;
    this.groundObject = BABYLON.Mesh.CreateGround("ground1", this.blockRenderData.width, this.blockRenderData.depth, 1, this.context.scene, false);
    //  this.groundObject.position.y = -1.0 * Number(this.blockRenderData.height) / 2.0;
    this.groundObject.material = this.__material(tD);
    this.groundObject.parent = this.sceneObject;
  }
  handleDataUpdate(tag, values, type, fireData) {
    if (tag === 'frame') {
      if (type === 'remove') {} else
      if (values.parentKey === this._blockKey) {
        this.framesHelper.compileFrames();
        this.__applyFirstFrameValues();
      }

      for (let i in this.childBlocks)
        this.childBlocks[i].handleDataUpdate(tag, values, type, fireData);
      return;
    }

    if (values) {
      if (this._blockKey === fireData.key)
        this.setData(values);

      if (tag === 'blockchild') {
        if (this.cachedInheritGround !== values.inheritGround) {
          //    this.cachedInheritMaterial = values.inheritMaterial;
          this.cachedInheritGround = values.inheritGround;
          //this.setData(values);
          this._addGround();
        }
      }

      if (this.blockRawData.childType === tag)
        if (values.title === this.blockRawData.childName)
          return this.setData();

      let materialList = [];
      if (tag === 'material')
        if (values.title)
          materialList.push(values.title);

      if (tag === 'texture') {
        let allMaterials = gAPPP.a.modelSets['material'].fireDataValuesByKey;

        for (let i in allMaterials) {
          if (allMaterials[i].diffuseTextureName === values.title)
            materialList.push(allMaterials[i].title);
          if (allMaterials[i].emissiveTextureName === values.title)
            materialList.push(allMaterials[i].title);
          if (allMaterials[i].specularTextureName === values.title)
            materialList.push(allMaterials[i].title);
          if (allMaterials[i].ambientTextureName === values.title)
            materialList.push(allMaterials[i].title);
        }
      }


      let materialDirty = false;
      if (this.currentMaterialName !== this.blockRenderData.materialName) {
        materialDirty = true;
        this.currentMaterialName = this.blockRenderData.materialName;
      }
      if (tag === 'material' && this.blockRenderData.materialName === values.title)
        materialDirty = true;

      if (materialDirty)
        return this.setData();

      if (type === 'add' && tag === 'blockchild')
        if (values.parentKey === this._blockKey)
          return this.setData();
    }
    for (let i in this.childBlocks) {
      if (type === 'remove') {
        if (i === fireData.key) {
          this.childBlocks[i].dispose();
          delete this.childBlocks[i];
          break;
        }
        continue;
      }

      if (i === fireData.key && values) {
        this.childBlocks[i].setData(values);
      }
      this.childBlocks[i].handleDataUpdate(tag, values, type, fireData);
    }
  }
  recursiveGetBlockForKey(key) {
    if (this._blockKey === key)
      return this;
    for (let i in this.childBlocks) {
      if (i === key)
        return this.childBlocks[key];

      let block = this.childBlocks[i].recursiveGetBlockForKey(key);
      if (block !== null)
        return block;
    }
    return null;
  }
  _createShape() {
    this.dispose();
    let name = 'singleShapeObject';

    let options = {};
    let fields = sDataDefinition.bindingFields('shape');
    for (let i in fields) {
      let field = fields[i];
      if (field.shapeOption)
        if (field.displayGroup === this.blockRenderData['shapeType']) {
          if (field.displayType === 'number') {
            if (GLOBALUTIL.isNumeric(this.blockRenderData[field.fireSetField]))
              options[field.shapeOption] = Number(this.blockRenderData[field.fireSetField]);
          } else
            options[field.shapeOption] = this.blockRenderData[field.fireSetField];
        }
    }

    if (this.blockRenderData['shapeType'] === 'sphere')
      return this.sceneObject = BABYLON.MeshBuilder.CreateSphere(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'box')
      return this.sceneObject = BABYLON.MeshBuilder.CreateBox(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'cylinder')
      return this.sceneObject = BABYLON.MeshBuilder.CreateCylinder(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'text')
      return this.__createTextMesh(name, options);

    this.sceneObject = BABYLON.MeshBuilder.CreateBox(name, options, this.context.scene);
  }
  __applyFirstFrameValues() {
    if (!this.sceneObject)
      return;
    let values = this.framesHelper.firstFrameValues();

    let fields = sDataDefinition.bindingFields('baseMesh').slice(0);
    fields = fields.concat(sDataDefinition.bindingFields('framep2')).slice(0);
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.contextObjectField)
        if (value !== '')
          this.__updateObjectValue(field, value, this.sceneObject);
    }
  }
  createGuides(size) {
    this.dispose();

    let wrapper = null;
    let sObjects = [];
    let axisX = BABYLON.Mesh.CreateLines("axisX", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    ], this.context.scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    wrapper = axisX;

    let xChar = this.__make2DTextMesh("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    xChar.setParent(wrapper);

    let axisY = BABYLON.Mesh.CreateLines("axisY", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    ], this.context.scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    axisY.setParent(wrapper);

    let yChar = this.__make2DTextMesh("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    yChar.setParent(wrapper);

    let axisZ = BABYLON.Mesh.CreateLines("axisZ", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    ], this.context.scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    axisZ.setParent(wrapper);

    let zChar = this.__make2DTextMesh("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    zChar.setParent(wrapper);

    this.sceneObject = wrapper;
  }
  createGrid(gridDepth) {
    this.dispose();
    let grid = BABYLON.Mesh.CreateGround("ground1", gridDepth, gridDepth, 2, this.context.scene);
    let material = new BABYLON.StandardMaterial('scenematerialforfloorgrid', this.context.scene);
    let texture = new BABYLON.Texture('greengrid.png', this.context.scene);
    texture.hasAlpha = true;
    material.diffuseTexture = texture;
    texture.vScale = gridDepth;
    texture.uScale = gridDepth;
    grid.material = material;
    this.sceneObject = grid;
  }
  dispose() {
    if (this.sceneObject)
      this.sceneObject.dispose();
    this.sceneObject = null;
    for (let i in this.childBlocks)
      this.childBlocks[i].dispose();
    this.childBlocks = {};
  }
  loadMesh() {
    return new Promise((resolve, reject) => {
      let path = gAPPP.storagePrefix;
      let url = this.blockRenderData['url'];
      let filename = '';
      let texture;
      if (url.substring(0, 3) === 'sb:') {
        path = 'https://s3.amazonaws.com/sceneassets/sbmeshes/';
        filename = url.substring(3);
      } else
        filename = this.context._url(url);

      BABYLON.SceneLoader.ImportMesh('', path, filename, this.context.scene,
        (newMeshes, particleSystems, skeletons) => {
          this.dispose();
          this.sceneObject = newMeshes[0];
          resolve();
        },
        progress => {},
        (scene, msg, err) => {
          console.log('wBlock.loadMesh', msg, err);
          reject({
            error: true,
            message: msg,
            errorObject: err,
            scene: scene
          });
        });
    });
  }
  __setpreviewshape(values) {
    let shape = values['previewShape'];
    if (!shape)
      shape = 'box';
    this.blockRenderData = {
      shapeType: shape,
      cylinderDiameter: 5,
      cylinderHeight: 5,
      sphereDiameter: 10,
      boxSize: 5,
      textText: 'Preview',
      textDepth: 2,
      textSize: 30
    };
  }
  setData(values = null) {
    if (this.context !== gAPPP.activeContext)
      return;

    if (this.staticType === 'texture') {
      this.__setpreviewshape(values);
      this._createShape();
      let m = new BABYLON.StandardMaterial('texturepopupmaterial');
      m.diffuseTexture = this.__texture(values);
      this.context.__setMaterialOnObj(this.sceneObject, m);
      return;
    }
    if (this.staticType === 'material') {
      this.__setpreviewshape(values);
      this._createShape();
      this.context.__setMaterialOnObj(this.sceneObject, this.__material(values));
      return;
    }

    if (values) {
      this.blockRawData = values;
      if (values.childType === 'light') {
        this.staticLoad = true;
        this.staticType = values.childType;
      }
    }
    if (this.staticLoad) {
      this.blockRenderData = this.blockRawData;
      this.blockRenderData.childType = this.staticType;
      this.framesHelper.parentBlock = this;
      this._renderBlock();
    } else
      this._loadBlock();

    this.context.refreshFocus();
  }
  _circularTest(blockName) {
    if (!this.parent)
      return false;

    if (this.parent.blockRawData.title === blockName)
      return true;

    return this.parent._circularTest(this.blockRawData.childName);
  }
  _loadBlock() {
    let children = {};
    if (this._circularTest(this.blockRawData.childName)) {
      console.log('Circular Reference Error');
      return;
    }
    if (gAPPP.a.modelSets[this.blockRawData.childType])
      children = gAPPP.a.modelSets[this.blockRawData.childType].queryCache('title', this.blockRawData.childName);

    let keys = Object.keys(children);
    if (keys.length === 0) {
      //  console.log('_loadBlock:: fetchList 0 results', this);
      return;
    }
    if (keys.length > 1) {
      //console.log('_loadBlock:: fetchList > 1 results', this);
    }
    this.blockTargetKey = keys[0];
    this.blockRenderData = children[keys[0]];
    if (this.blockRawData.childType === 'mesh')
      this.loadMesh().then(r => {
        this._renderBlock();
        this.context.refreshFocus();
      });
    else
      this._renderBlock();
  }
  _renderBlock() {
    if (this.blockRawData.childType === 'mesh')
      this.__renderMeshBlock();
    if (this.blockRawData.childType === 'shape')
      this.__renderShapeBlock();
    if (this.blockRawData.childType === 'block')
      this.__renderContainerBlock();
    if (this.blockRawData.childType === 'light')
      this.__renderLightBlock();

    this.currentMaterialName = this.blockRenderData.materialName;
    this.cachedInheritGround = this.blockRawData.inheritGround;

    this.__applyFirstFrameValues();

    if (this.parent) {
      if (this.sceneObject) {
        this.sceneObject.parent = this.parent.sceneObject;
        this.framesHelper.updateAnimation();
      }
    } else {
      this.framesHelper.updateAnimation();
    }
  }
  __renderMeshBlock() {
    let fields = sDataDefinition.bindingFields('mesh');
    for (let i in fields) {
      let field = fields[i];
      let value = this.blockRenderData[field.fireSetField];

      if (field.contextObjectField)
        if (this.sceneObject)
          this.__updateObjectValue(field, value, this.sceneObject);
    }
  }
  __renderShapeBlock() {
    this.dispose();
    let newShape = this._createShape();
    if (!this.sceneObject)
      return;

    let fields = sDataDefinition.bindingFields('shape');
    for (let i in fields) {
      let field = fields[i];
      let value = this.blockRenderData[field.fireSetField];

      if (field.contextObjectField)
        this.__updateObjectValue(field, value, this.sceneObject);
    }
  }
  __renderContainerBlock() {
    if (!this._blockKey)
      return;

    let oldContainerMesh = null;
    let width = this.blockRenderData['width'];
    let height = this.blockRenderData['height'];
    let depth = this.blockRenderData['depth'];

    let fieldDirty = false;
    for (let i in this.containerFieldList) {
      let f = this.containerFieldList[i];
      if (this.containerCache[f] !== this.blockRenderData[f]) {
        fieldDirty = true;
        this.containerCache[f] = this.blockRenderData[f];
      }
    }
    if (fieldDirty) {
      oldContainerMesh = this.sceneObject;
      this.sceneObject = BABYLON.MeshBuilder.CreateBox(this._blockKey, {
        width,
        height,
        depth
      }, this.context.scene);
      let material = new BABYLON.StandardMaterial(this._blockKey + 'material', this.context.scene);
      material.alpha = 0;
      this.sceneObject.material = material;

      if (!this.parent) {
        this._addSkyBox();
      }

      this._addGround();
    }

    let containerKey = this.blockKey;
    if (!this.staticLoad) {
      containerKey = this.blockTargetKey;
    }
    let children = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', containerKey);
    for (let i in children)
      this.__updateChild(i, children[i]);

    if (!this.parent) {
      this.updateCamera();
    }

    if (oldContainerMesh !== null)
      oldContainerMesh.dispose();
  }
  __renderLightBlock() {
    let oldContainerMesh = null;
    let from = GLOBALUTIL.getVector(this.blockRawData['lightFrom'], 100, 100, 100);
    let dir = GLOBALUTIL.getVector(this.blockRawData['lightDirection'], 0, -1, 0);
    let intensity = this.blockRawData['lightIntensity'];
    let angle = this.blockRawData['lightAngle'];
    let decay = this.blockRawData['lightDecay'];
    let light = this.blockRawData['childName'];

    if (this.lightObject) {
      this.lightObject.dispose();
      this.lightObject = null;
    }

    if (light === 'Hemispheric') {
      dir = GLOBALUTIL.getVector(this.blockRawData['lightDirection'], 0, 1, 0);
      this.lightObject = new BABYLON.HemisphericLight("HemiLight", dir, this.context.scene);
    }
    if (light === 'Point') {
      this.lightObject = new BABYLON.PointLight("PointLight", from, this.context.scene);
    }
    if (light === 'Directional') {
      this.lightObject = new BABYLON.DirectionalLight("DirectionalLight", dir, this.context.scene);
    }
    if (light === 'Spot') {
      if (angle)
        angle = Number(intensity);
      else
        angle = Math.PI / 2;
      if (decay)
        decay = Number(decay);
      else
        decay = 1;
      from = GLOBALUTIL.getVector(this.blockRawData['lightFrom'], 100, 100, 100);
      dir = GLOBALUTIL.getVector(this.blockRawData['lightDirection'], -100, -100, -100);

      this.lightObject = new BABYLON.SpotLight("SpotLight", from, dir, angle, decay, this.context.scene);
    }

    if (!this.lightObject)
      return;
    let specular = GLOBALUTIL.color(this.blockRawData['lightSpecular']);
    let diffuse = GLOBALUTIL.color(this.blockRawData['lightDiffuse']);
    let gS = this.blockRawData['lightGroundColor'];
    if (!gS)
      gS = '0,0,0';
    let groundC = GLOBALUTIL.color(gS);
    this.lightObject.diffuse = diffuse;
    this.lightObject.specular = specular;
    this.lightObject.groundColor = groundC;

    if (intensity === '')
      this.lightObject.intensity = 1;
    else
      this.lightObject.intensity = Number(intensity);
  }
  __updateChild(key, data) {
    if (!this.childBlocks[key])
      this.childBlocks[key] = new wBlock(this.context, this);
    this.childBlocks[key].blockKey = key;
    this.childBlocks[key].setData(data);
  }
  __createTextMesh(name, options) {
    this.dispose();
    let canvas = document.getElementById("highresolutionhiddencanvas");
    let context2D = canvas.getContext("2d");
    let size = 100;
    let vectorOptions = {
      polygons: true,
      textBaseline: "top",
      fontStyle: 'normal',
      fontVariant: 'normal',
      fontWeight: 'normal',
      fontFamily: 'Arial',
      size: size,
      stroke: false
    };
    for (let i in vectorOptions)
      if (options[i])
        vectorOptions[i] = options[i];
    if (options['size'])
      size = Number(options['size']);

    let vectorData = vectorizeText(options['text'], canvas, context2D, vectorOptions);
    let x = 0;
    let y = 0;
    let z = 0;
    let thick = 10;
    if (options['depth'])
      thick = Number(options['depth']);
    let scale = size / 10;
    let lenX = 0;
    let lenY = 0;
    let textWrapperMesh = null;
    for (var i = 0; i < vectorData.length; i++) {
      var letter = vectorData[i];
      var conners = [];
      for (var k = 0; k < letter[0].length; k++) {
        conners[k] = new BABYLON.Vector2(scale * letter[0][k][1], scale * letter[0][k][0]);
        if (lenX < conners[k].x) lenX = conners[k].x;
        if (lenY < conners[k].y) lenY = conners[k].y;
      }
      var polyBuilder = new BABYLON.PolygonMeshBuilder("pBuilder" + i, conners, this.context.scene);

      for (var j = 1; j < letter.length; j++) {
        var hole = [];
        for (var k = 0; k < letter[j].length; k++) {
          hole[k] = new BABYLON.Vector2(scale * letter[j][k][1], scale * letter[j][k][0]);
        }
        hole.reverse();
        polyBuilder.addHole(hole);
      }
      var polygon = polyBuilder.build(false, thick);
      polygon.receiveShadows = true;

      if (textWrapperMesh)
        polygon.setParent(textWrapperMesh);
      else
        textWrapperMesh = polygon;
    }

    if (lenY === 0)
      lenY = 0.001;
    if (lenX === 0)
      lenX = 0.001;

    this.sceneObject = textWrapperMesh;
  }
  __make2DTextMesh(text, color, size) {
    let dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, this.context.scene, true);
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
    let plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, this.context.scene, true);
    plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this.context.scene);
    plane.material.backFaceCulling = false;
    plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    plane.material.diffuseTexture = dynamicTexture;
    return plane;
  }
  __material(values) {
    let material = new BABYLON.StandardMaterial('material', this.context.scene);
    let fields = sDataDefinition.bindingFields('material');
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.contextObjectField)
        this.__updateObjectValue(field, value, material);
    }
    return material;
  }
  __getMaterialFromParent(value) {
    let parent = this;

    while (parent.parent) {
      if (parent.blockRawData.inheritMaterial)
        if (parent.parent.blockRenderData.materialName)
          value = parent.parent.blockRenderData.materialName;

      parent = parent.parent;
    }

    return value;
  }
  __getGroundMaterialFromParent(value) {
    let parent = this;

    while (parent.parent) {
      if (parent.blockRawData.inheritGround)
        if (parent.parent.blockRenderData.groundMaterial)
          value = parent.parent.blockRenderData.groundMaterial;

      parent = parent.parent;
    }

    return value;
  }
  __updateObjectValue(field, value, object) {
    try {
      if (value === undefined) return;
      if (field.type === undefined) return GLOBALUTIL.path(object, field.contextObjectField, value);

      if (field.type === 'material') {
        value = this.__getMaterialFromParent(value);

        let tD = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', value);
        let m;
        if (!tD)
          m = new BABYLON.StandardMaterial('material', this.context.scene);
        else
          m = this.__material(tD);
        this.context.__setMaterialOnObj(object, m);
        return;
      }

      if (value === '') return;

      if (field.type === 'visibility') return this.context.__fadeObject(object, value);

      if (field.type === 'color') {
        let parts = value.split(',');
        let cA = [];
        let color = new BABYLON.Color3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
        return GLOBALUTIL.path(object, field.contextObjectField, color);
      }

      if (field.type === 'texture') {
        let tD = gAPPP.a.modelSets['texture'].getValuesByFieldLookup('title', value);
        if (tD === undefined)
          return;

        let t = this.__texture(tD);
        return GLOBALUTIL.path(object, field.contextObjectField, t);
      }

      //default
      GLOBALUTIL.path(object, field.contextObjectField, value);
    } catch (e) {
      console.log('set ui object error', e, field, object, value);
    }
  }
  __texture(values) {
    let url = values['url'];
    let texture;
    if (url.substring(0, 3) === 'sb:')
      url = 'https://s3.amazonaws.com/sceneassets/sbtextures/' + url.substring(3);

    if (values.isVideo)
      texture = new BABYLON.VideoTexture("video", [url], this.context.scene, false);
    else
      texture = new BABYLON.Texture(url, this.context.scene);

    if (GLOBALUTIL.isNumeric(values['vScale']))
      texture.vScale = Number(values['vScale']);
    if (GLOBALUTIL.isNumeric(values['uScale']))
      texture.uScale = Number(values['uScale']);
    if (GLOBALUTIL.isNumeric(values['vOffset']))
      texture.vOffset = Number(values['vOffset']);
    if (GLOBALUTIL.isNumeric(values['uOffset']))
      texture.uOffset = Number(values['uOffset']);

    texture.hasAlpha = values['hasAlpha'];
    return texture;
  }
  getBlockDimDesc() {
    let width = 1;
    if (GLOBALUTIL.isNumeric(this.blockRawData.width))
      width = Math.round(Number(this.blockRawData.width));
    let height = 1;
    if (GLOBALUTIL.isNumeric(this.blockRawData.height))
      height = Math.round(Number(this.blockRawData.height));
    let depth = 1;
    if (GLOBALUTIL.isNumeric(this.blockRawData.depth))
      depth = Math.round(Number(this.blockRawData.depth));

    return width + ' x ' + depth + ' x ' + height;
  }
  get activeAnimation() {
    if (!this.framesHelper.activeAnimation)
      this.framesHelper.compileFrames();
    return this.framesHelper.activeAnimation;
  }
  playAnimation(startPercent = 0) {
    if (this.activeAnimation) {
      if (this.activeAnimation._paused)
        this.activeAnimation.restart();
      else {
        let frameIndex = startPercent / 100.0 * this.framesHelper.lastFrame;
        this.framesHelper.startAnimation(frameIndex);
        if (frameIndex === 0)
          this.setAnimationPosition(0);
      }
    }

    this.framesHelper.playState = 1;

    for (let i in this.childBlocks)
      this.childBlocks[i].playAnimation(startPercent);
  }
  setAnimationPosition(currentPercent = 0) {
    if (this.activeAnimation) {
      let frame = Math.round(currentPercent / 100.0 * this.framesHelper.lastFrame);
      this.activeAnimation.goToFrame(frame);
    }

    for (let i in this.childBlocks)
      this.childBlocks[i].setAnimationPosition(currentPercent);
  }
  pauseAnimation() {
    if (this.activeAnimation)
      this.activeAnimation.pause();
    this.framesHelper.playState = 2;
    for (let i in this.childBlocks)
      this.childBlocks[i].pauseAnimation();
  }
  stopAnimation() {
    if (this.activeAnimation) {
      this.activeAnimation.stop();
      this.activeAnimation.reset();
      this.setAnimationPosition(0);
      this.context.scene._animationTime = 0;
      this.context.scene._animationTimeLast = BABYLON.Tools.Now;
    }
    this.framesHelper.playState = 0;

    for (let i in this.childBlocks)
      this.childBlocks[i].stopAnimation();
  }
  updateCamera() {
    let cameras = this.traverseCameraList();
    let camerasS = JSON.stringify(cameras);
    if (camerasS !== this.cameraS) {
      let sel = this.context.canvasHelper.cameraSelect;
      this.camerasCache = cameras;
      let startValue = sel.value;
      this.context.canvasHelper.cameraDetails = cameras;
      this.context.canvasHelper.camerasS = camerasS;
      let html = '';
      for (let i in this.context.canvasHelper.cameraDetails)
        html += `<option value="${i}">${this.context.canvasHelper.cameraDetails[i].cameraName}</option>`;

      sel.innerHTML = html;
      sel.value = startValue;
      if (sel.selectedIndex === -1)
        sel.selectedIndex = 0;
    }
  }
  traverseCameraList(cameras = null) {
    if (cameras === null)
      cameras = this.context.canvasHelper.defaultCameras;

    if (this.blockRawData.childType === 'camera')
      cameras[this._blockKey] = this.blockRawData;

    for (let i in this.childBlocks)
      this.childBlocks[i].traverseCameraList(cameras);

    return cameras;
  }
  _findBestTargetObject(findString) {
    let parts = findString.split(':');
    let childType = parts[0].trim();
    let childName = parts[1].trim();
    for (let i in this.childBlocks) {
      if (this.childBlocks[i].blockRawData.childType === childType)
        if (this.childBlocks[i].blockRawData.childName === childName)
          return this.childBlocks[i];
      let childResult = this.childBlocks[i]._findBestTargetObject(findString);
      if (childResult)
        return childResult;
    }
    return null;
  }
}
