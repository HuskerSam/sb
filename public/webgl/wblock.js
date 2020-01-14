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
    this.containerFieldList = ['width', 'height', 'depth', 'childName', 'childType'];
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
    this.updateVideoCallback = () => {};

    this.updateNoBump();
  }
  updateNoBump() {
    this.noBump = false;
    if (this.context.info.version.indexOf('1.0') !== -1)
      return this.noBump = true;

    if (gAPPP.a.profile.noBumpMaps)
      return this.noBump = true;

    for (let i in this.childBlocks)
      this.childBlocks[i].updateNoBump();
  }
  set blockKey(key) {
    this._blockKey = key;
    this.framesHelper.setParentKey(key, this);
  }
  get blockKey() {
    return this._blockKey;
  }
  _addSkyBox() {
    if (this.lastSkyBox === this.blockRawData.skybox &&
      this.lastskyboxSize === this.blockRawData.skyboxSize)
      return;
    this.lastSkyBox = this.blockRawData.skybox;
    this.lastskyboxSize = this.blockRawData.skyboxSize;

    if (this.skyboxObject)
      this.skyboxObject.dispose();
    this.skyboxObject = null;

    if (!this.blockRawData.skybox)
      return;

    let skyboxPath = gAPPP.cdnPrefix + 'box/' + this.blockRawData.skybox + '/skybox';
    let skyboxSize = GLOBALUTIL.getNumberOrDefault(this.blockRawData.skyboxSize, 800.0);
    let skybox = BABYLON.Mesh.CreateBox("skyBox", skyboxSize, this.context.scene);
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
  containsLight() {
    if (this.blockRawData.childType === 'light')
      return true;
    for (let i in this.childBlocks)
      if (this.childBlocks[i].containsLight())
        return true;
    return false;
  }
  _renderGround() {
    let gMat = this.blockRawData.groundMaterial;
    if (!gMat)
      gMat = '';

    if (gMat === '') {
      if (this.groundObject)
        this.groundObject.dispose();
      this.groundObject = null;
      return;
    }

    let bWidth = this.blockRawData.width;
    let bDepth = this.blockRawData.depth;
    let setMat = false;
    if (!this.groundObject || this.lastbWidth !== bWidth || this.lastbDepth !== bDepth) {
      if (this.groundObject)
        this.groundObject.dispose();
      this.lastbWidth = bWidth;
      this.thislastbDepth = bDepth;
      this.groundObject = BABYLON.Mesh.CreateGround("sceneblocksdefaultground", bWidth, bDepth, 1, this.context.scene, false);
      this.groundObject.parent = this.sceneObject;
      setMat = true;
    }

    if (this.lastGroundMaterial !== this.blockRawData.groundMaterial || setMat) {
      this.lastGroundMaterial = this.blockRawData.groundMaterial;
      this.groundObject.material = this._materialFromName(this.blockRawData.groundMaterial);
    }
  }
  handleDataUpdate(tag, values, type, fireData) {
    if (!this.parent)
      this.context.canvasHelper.logMessage('event - ' + tag + ' ' + type, true);

    if (type === 'moved')
      return;
    else if (tag === 'texture') {
      return this._handleTextureUpdate(values);
    } else if (tag === 'material') {
      if (!values || !values.title)
        return;
      let materialName = values.title;
      if (materialName === this.blockRenderData.materialName)
        return this.setData();
      if (materialName === this.blockRenderData.groundMaterial) {
        this.lastGroundMaterial = undefined;
        this._renderGround();
      }
    } else if (type === 'remove' && tag === 'blockchild') {
      if (values && values.parentKey === this._blockKey)
        return this.setData(this.blockRawData, true);

      if (this.parent)
        if (values.parentKey === this.blockRawData.parentKey) {
          this.parent.containerCache = {};
          return this.parent.setData();
        }
    } else if (type === 'remove' && this.blockRawData.childType === 'block') {
      if (tag === 'shape' || tag === 'block' || tag === 'mesh') {
        for (let cb in this.childBlocks) {
          if (this.childBlocks[cb].blockTargetKey === fireData.key) {
            return this.setData();
          }
        }
      }
    } else if ((type === 'add' || type === 'change') && tag === 'blockchild') {
      if (values.parentKey === this._blockKey) {
        if (type === 'change') {
          let childBlock = this.childBlocks[fireData.key];
          if (childBlock) {
            let oldType = childBlock.blockRawData.childType;
            let newType = values.childType;

            let oldAsset = wBlock._fetchChildAssetData(oldType, childBlock.blockRawData.childName);
            let newAsset = wBlock._fetchChildAssetData(newType, values.childName);

            if (!oldAsset && !newAsset)
              return; //skip if asset didn't and still doesn't exist
          }
        }

        return this.setData();
      }

      if (this.parent)
        if (values.parentKey === this.blockRawData.parentKey)
          return this.parent.setData();
    } else if (tag === 'frame') {
      let parentKey = null;
      if (values)
        parentKey = values.parentKey;
      if (type === 'remove' && gAPPP.a.modelSets['frame'].lastValuesDeleted)
        parentKey = gAPPP.a.modelSets['frame'].lastValuesDeleted.parentKey;

      if (parentKey === this._blockKey) {
        if (this.blockRawData.childType === 'block') {
          this.framesHelper.compileFrames();
          this.__applyFirstFrameValues();
          return this.setData(); //recalc block child frames if % values used
        }
        this.framesHelper.compileFrames();
        this.__applyFirstFrameValues();
        return;
      }
    }

    if (values) {
      if (this._blockKey === fireData.key) {
        if (tag === 'block') {
          return this.setData(values);
        }
      }

      if (values.title) {
        if (fireData.lastValuesChanged) {
          let oldTitle = fireData.lastValuesChanged.title;
          if (values.title !== oldTitle) {
            if (this.blockRawData.childType === tag && oldTitle === this.blockRawData.childName) {
              if (this.parent)
                return this.parent.setData();
            }
          }
        }

        if (this.blockRawData.childType === tag && values.title === this.blockRawData.childName) {
          if (type === 'add' && this.blockRawData.childType === 'block') {
            return setTimeout(() => this.setData(), 100);
          }

          return this.setData();
        }
      }
    }

    for (let i in this.childBlocks) {
      if (type === 'remove') {
        if (i === fireData.key) {
          if (tag === 'blockchild')
            return this.setData();

          this.childBlocks[i].dispose();
          delete this.childBlocks[i];
          break;
        }
      }

      this.childBlocks[i].handleDataUpdate(tag, values, type, fireData);
    }
  }
  _handleTextureUpdate(values) {
    if (!values || !values.title)
      return;
    let textureName = values.title;
    let matDetails = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', this.blockRenderData.materialName);
    let gnd = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', this.blockRenderData.groundMaterial);
    if (matDetails)
      if (matDetails.diffuseTextureName === textureName || matDetails.emissiveTextureName === textureName ||
        matDetails.specularTextureName === textureName || matDetails.ambientTextureName === textureName ||
        matDetails.bumpTextureName === textureName || matDetails.reflectionTextureName === textureName
      )
        return this.setData();

    if (gnd)
      if (gnd.diffuseTextureName === textureName || gnd.emissiveTextureName === textureName ||
        gnd.specularTextureName === textureName || gnd.ambientTextureName === textureName ||
        gnd.bumpTextureName === textureName || gnd.reflectionTextureName === textureName
      ) {
        this.lastGroundMaterial = undefined;
        this._renderGround();
      }

    for (let i in this.childBlocks)
      this.childBlocks[i]._handleTextureUpdate(values);
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
      if (field.shapeOption) {
        let addKey = false;
        if (Array.isArray(field.displayGroup))
          if (field.displayGroup.indexOf(this.blockRenderData['shapeType']) !== -1)
            addKey = true;

        if (field.displayGroup === this.blockRenderData['shapeType'])
          addKey = true;

        if (addKey)
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

    if (this.blockRenderData['shapeType'] === 'plane')
      return this.sceneObject = BABYLON.MeshBuilder.CreatePlane(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'cylinder')
      return this.sceneObject = BABYLON.MeshBuilder.CreateCylinder(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'text')
      return this.__createTextMesh(name, options);

    if (this.blockRenderData['shapeType'] === 'torus')
      return this.sceneObject = BABYLON.MeshBuilder.CreateTorus(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'torusknot')
      return this.sceneObject = BABYLON.MeshBuilder.CreateTorusKnot(name, options, this.context.scene);

    this.sceneObject = BABYLON.MeshBuilder.CreateBox(name, options, this.context.scene);
  }
  __applyFirstFrameValues() {
    if (!this.sceneObject)
      return;

    let values = this.framesHelper.firstFrameValues();
    for (let i in this.framesHelper.fieldsData) {
      let field = this.framesHelper.fieldsData[i];
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

    let localScene = this.context.scene;

    function __make2DTextMesh(text, color, size) {
      let dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, localScene, true);
      dynamicTexture.hasAlpha = true;
      dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
      let plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, localScene, true);
      plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", localScene);
      plane.material.backFaceCulling = false;
      plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
      plane.material.diffuseTexture = dynamicTexture;
      return plane;
    }

    let xChar = __make2DTextMesh("X", "red", size / 10);
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

    let yChar = __make2DTextMesh("Y", "green", size / 10);
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

    let zChar = __make2DTextMesh("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    zChar.setParent(wrapper);

    this.sceneObject = wrapper;
  }
  createGrid(gridDepth) {
    this.dispose();
    let grid = BABYLON.Mesh.CreateGround("ground1", gridDepth, gridDepth, 2, this.context.scene);
    let material = new BABYLON.StandardMaterial('scenematerialforfloorgrid', this.context.scene);
    let texture = new BABYLON.Texture('/images/greengrid.png', this.context.scene);
    texture.hasAlpha = true;
    material.diffuseTexture = texture;
    texture.vScale = gridDepth;
    texture.uScale = gridDepth;
    grid.material = material;
    this.sceneObject = grid;
  }
  dispose() {
    for (let i in this.childBlocks)
      this.childBlocks[i].dispose();
    this.childBlocks = {};

    if (this.sceneObject)
      this.sceneObject.dispose();
    this.sceneObject = null;

    this.containerCache = {};
  }
  async loadMesh() {
    return new Promise((resolve, reject) => {
      let path = gAPPP.storagePrefix;
      let url = this.blockRenderData['url'];
      let filename = '';
      let texture;
      if (url.substring(0, 3) === 'sb:') {
        path = gAPPP.cdnPrefix + 'meshes/';
        filename = url.substring(3);
      } else if (url.indexOf(gAPPP.storagePrefix) === -1) {
        let parts = url.split('/');
        filename = parts[parts.length - 1];
        path = url.replace(filename, '');
      } else {
        filename = this.context._url(url);
      }

      if (filename === '') {
        this.dispose();
        return resolve();
      }

      BABYLON.SceneLoader.ImportMesh('', path, filename, this.context.scene,
        (newMeshes, particleSystems, skeletons) => {
          this.dispose();
          this.sceneObject = newMeshes[0];
          this.sceneObjectMeshData = {};
          let newMesh = this.sceneObject;
          let objectData = this.sceneObjectMeshData;

          objectData.scalingX = newMesh.scaling.x;
          objectData.scalingY = newMesh.scaling.y;
          objectData.scalingZ = newMesh.scaling.z;

          objectData.positionX = newMesh.position.x;
          objectData.positionY = newMesh.position.y;
          objectData.positionZ = newMesh.position.z;

          objectData.rotationX = newMesh.rotation.x;
          objectData.rotationY = newMesh.rotation.y;
          objectData.rotationZ = newMesh.rotation.z;

          resolve({
            error: false
          });
        },
        progress => {},
        (scene, msg, err) => {
          this.context.logError('wBlock.loadMesh');
          resolve({
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
      cylinderDiameter: 2,
      cylinderHeight: 2,
      sphereDiameter: 3,
      width: 2,
      height: 2,
      boxSize: 2,
      textText: 'Preview',
      textDepth: 1,
      textSize: 30
    };
  }
  setData(values = null, forceRedraw = false) {
    if (this.context !== gAPPP.activeContext)
      return;

    this.updateNoBump();

    if (this.staticType === 'texture') {
      this.__setpreviewshape(values);
      this._createShape();

      let objectData = sDataDefinition.getDefaultDataCloned('material');
      let m = this.__material(objectData);
      m.diffuseTexture = this.__texture(values);
      m.emissiveTexture = this.__texture(values);
      this.context.__setMaterialOnObj(this.sceneObject, m);
      return;
    }
    if (this.staticType === 'material') {
      this.__setpreviewshape(values);
      this._createShape();
      let m = this.__material(values);
      this.context.__setMaterialOnObj(this.sceneObject, m);
      return;
    }

    if (values) {
      this.blockRawData = values;
      if (values.childType === 'light') {
        this.staticLoad = true;
        this.staticType = values.childType;
      }
      if (values.childType === 'camera') {
        this.staticLoad = true;
        this.staticType = values.childType;
      }
    }
    if (this.staticLoad) {
      this.blockRenderData = this.blockRawData;
      this.blockRenderData.childType = this.staticType;
      this.framesHelper._validateFieldList(this.blockRenderData.childType);
      this.framesHelper.blockWrapper = this;
      this._renderBlock(forceRedraw);
    } else
      this._loadBlock();

    this.context.refreshFocus();
  }
  get rootBlock() {
    if (this.parent)
      return this.parent.rootBlock;
    return this;
  }
  _circularTest(blockName) {
    return false;

    if (!this.parent)
      return false;

    if (this.parent.blockRawData.title === blockName)
      return true;

    return this.parent._circularTest(this.blockRawData.childName);
  }
  static _fetchChildAssetData(childType, childName) {
    let fireSet = gAPPP.a.modelSets[childType];
    let data = null;

    if (fireSet)
      data = fireSet.getValuesByFieldLookup('title', childName);

    return data;
  }
  _loadBlock() {
    let children = {};
    if (this._circularTest(this.blockRawData.childName)) {
      this.context.logError('Circular Reference Error  :' + this.__getParentRoute());
      return;
    }
    if (gAPPP.a.modelSets[this.blockRawData.childType])
      children = gAPPP.a.modelSets[this.blockRawData.childType].queryCache('title', this.blockRawData.childName);

    let keys = Object.keys(children);
    if (keys.length === 0) {
      this.dispose();
      this.context.logError('no block found: ' + this.__getParentRoute());
      return;
    }

    if (keys.length > 1) {
      this.context.logError('duplicate block name found: ' + this.__getParentRoute());
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
  __getParentRoute() {
    let thisPart = '[' + this.blockRawData.childName + ' / ' + this.blockRawData.childType + ']';
    if (this.parent)
      thisPart += this.parent.__getParentRoute();
    else
      return '';
    return thisPart;
  }
  _renderBlock(forceRedraw = false) {
    if (this.blockRawData.childType === 'mesh')
      this.__renderMeshBlock();
    if (this.blockRawData.childType === 'shape')
      this.__renderShapeBlock();
    if (this.blockRawData.childType === 'block')
      this.__renderContainerBlock(forceRedraw);
    if (this.blockRawData.childType === 'light')
      this.__renderLightBlock();

    this.currentMaterialName = this.blockRenderData.materialName;

    if (this.parent && this.sceneObject)
      this.sceneObject.parent = this.parent.sceneObject;

    this.framesHelper.activeAnimation = null;
    this.framesHelper.setParentKey(this.blockKey, this);

    this.__applyFirstFrameValues();

    if (!this.parent)
      this.context.canvasHelper.logAnimDetails();
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
  __renderContainerBlock(forceRedraw = false) {
    if (!this._blockKey)
      return;

    let oldContainerMesh = null;
    let width = this.blockRenderData['width'];
    let height = this.blockRenderData['height'];
    let depth = this.blockRenderData['depth'];

    let fieldDirty = false;
    for (let i = 0; i < this.containerFieldList.length; i++) {
      let f = this.containerFieldList[i];
      if (this.containerCache[f] !== this.blockRenderData[f]) {
        fieldDirty = true;
        this.containerCache[f] = this.blockRenderData[f];
      }
    }
    if (fieldDirty || forceRedraw) {
      oldContainerMesh = this.sceneObject;
      this.sceneObject = BABYLON.MeshBuilder.CreateBox(this._blockKey, {
        width,
        height,
        depth
      }, this.context.scene);
      this.sceneObject.isPickable = false;
      this.sceneObject.isContainerBlock = true;
      this.sceneObject._blockKey = this._blockKey;
      this.sceneObject.isVisible = false;
      this.sceneObject.blockWrapper = this;
      this.sceneObject.material = new BABYLON.StandardMaterial(this._blockKey + 'material', this.context.scene);
      this.sceneObject.material.alpha = 0;
    }

    this.__renderSceneOptions(this.blockRenderData);

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
  __renderSceneOptions(renderData) {
    this._renderGround();

    if (this.parent)
      return;

    if (!renderData) {
      if (gAPPP.a.profile.canvasColor)
        this.context.scene.clearColor = GLOBALUTIL.color(gAPPP.a.profile.canvasColor);

      return;
    }

    this._addSkyBox();
    let fogMode = renderData.fogType;

    this.context.scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
    if (!fogMode)
      fogMode === 'none';
    if (fogMode != 'none') {
      if (fogMode === 'EXP')
        this.context.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
      if (fogMode === 'EXP2')
        this.context.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
      if (fogMode === 'LINEAR')
        this.context.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
      this.context.scene.fogDensity = GLOBALUTIL.getNumberOrDefault(renderData.fogDensity, .2);
      this.context.scene.fogStart = GLOBALUTIL.getNumberOrDefault(renderData.fogStart, 20.0);
      this.context.scene.fogEnd = GLOBALUTIL.getNumberOrDefault(renderData.fogEnd, 60.0);

      if (renderData.fogColor)
        this.context.scene.fogColor = GLOBALUTIL.color(renderData.fogColor);
      else
        this.context.scene.fogColor = GLOBALUTIL.color('0.2,0.2,0.3');
    }

    if (renderData.ambientColor)
      this.context.scene.ambientColor = GLOBALUTIL.color(renderData.ambientColor);
    else
      this.context.scene.ambientColor = GLOBALUTIL.color('0,0,0');

    if (renderData.clearColor)
      this.context.scene.clearColor = GLOBALUTIL.color(renderData.clearColor);
    else {
      if (gAPPP.a.profile.canvasColor) {
        this.context.scene.clearColor = GLOBALUTIL.color(gAPPP.a.profile.canvasColor);
      } else
        this.context.scene.clearColor = GLOBALUTIL.color('.2,.4,.4');
    }

    this.updateVideoCallback(renderData);
  }
  __renderLightBlock() {
    let values = this.framesHelper.firstFrameValues();
    let lP = this.framesHelper.__getLightDetails(values);

    let light = this.blockRawData['childName'];
    if (this.lightObject) {
      this.lightObject.dispose();
      this.lightObject = null;
      this.sceneObject = null;
    }

    if (light === 'Hemispheric') {
      this.lightObject = new BABYLON.HemisphericLight("HemiLight", lP.direction, this.context.scene);
      this.lightObject.position = new BABYLON.Vector3.Zero();
    }
    if (light === 'Point') {
      this.lightObject = new BABYLON.PointLight("PointLight", lP.origin, this.context.scene);
      this.lightObject.direction = new BABYLON.Vector3.Zero();
    }
    if (light === 'Directional') {
      this.lightObject = new BABYLON.DirectionalLight("DirectionalLight", lP.direction, this.context.scene);
      this.lightObject.position = new BABYLON.Vector3.Zero();
    }
    if (light === 'Spot') {
      this.lightObject = new BABYLON.SpotLight("SpotLight", lP.origin, lP.direction, lP.angle, lP.decay, this.context.scene);
    }

    if (!this.lightObject)
      return;

    this.sceneObject = this.lightObject;

    this.lightObject.diffuse = lP.diffuse;
    this.lightObject.specular = lP.specular;
    this.lightObject.groundColor = lP.ground;
    this.lightObject.intensity = lP.intensity;
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
    if (!canvas) {
      let cWrapper = document.createElement('div');
      cWrapper.innerHTML = `<canvas id="highresolutionhiddencanvas" width="4500" height="1500" style="display:none"></canvas>`;
      canvas = cWrapper.firstChild;
      document.body.appendChild(canvas);
    }
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
    let scale = size / 100;
    let lenX = 0;
    let lenY = 0;
    let polies = [];

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

      try {
        var polygon = polyBuilder.build(false, thick);
        //polygon.receiveShadows = true;

        polies.push(polygon);
      } catch (e) {
        console.log('text 3d render polygon error', e);
      }
    }

    if (lenY < .001 && lenX < .001)
      this.context.logError('Zero Length result for text shape ' + this.__getParentRoute());
    if (lenY === 0)
      lenY = 0.001;
    if (lenX === 0)
      lenX = 0.001;

    let deltaY = thick / 2.0;
    let deltaX = lenX / 2.0;
    let deltaZ = lenY / 2.0;

    let textWrapperMesh = BABYLON.MeshBuilder.CreateBox(this._blockKey + 'textdetailswrapper', {
      width: lenX,
      height: thick,
      depth: lenY
    }, this.context.scene);
    textWrapperMesh.isVisible = false;
    for (let i = 0, l = polies.length; i < l; i++) {
      polies[i].position.x -= deltaX;
      polies[i].position.y += deltaY;
      polies[i].position.z -= deltaZ;
      polies[i].setParent(textWrapperMesh);
    }

    this.sceneObject = textWrapperMesh;
  }
  __material(values) {
    let material = new BABYLON.StandardMaterial('material' + Math.random().toFixed(4), this.context.scene);
    let fields = sDataDefinition.bindingFields('material');

    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (this.noBump)
        if (field.fireSetField === 'bumpTextureName')
          continue;

      if (field.contextObjectField)
        this.__updateObjectValue(field, value, material);
    }
    return material;
  }
  __getMaterialFromParent(value) {
    let parent = this;

    while (parent.parent) {
      if (parent.blockRawData.inheritMaterial) {
        if (parent.parent.blockRenderData.materialName)
          value = parent.parent.blockRenderData.materialName;
      } else {
        return value;
      }

      parent = parent.parent;
    }

    return value;
  }
  __updateObjectValue(field, value, object) {
    try {
      if (value === undefined) return;

      if (field.displayType === 'number')
        value = GLOBALUTIL.getNumberOrDefault(value, 0.0);

      if (field.type === undefined) return GLOBALUTIL.path(object, field.contextObjectField, value);

      if (field.type === 'material') {
        this.__updateMaterial(value, object);

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
        let t = this._textureFromName(value);
        return GLOBALUTIL.path(object, field.contextObjectField, t);
      }

      GLOBALUTIL.path(object, field.contextObjectField, value);
    } catch (e) {
      this.context.logError('set ui object error: ' + field.contextObjectField + ' : ' + value + '  ' + this.__getParentRoute());
    }
  }
  _materialFromName(materialName) {
    if (materialName.substring(0, 8) === 'decolor:') {
      let color = materialName.substring(8).trim();
      let objectData = sDataDefinition.getDefaultDataCloned('material');
      let m = this.__material(objectData);

      m.diffuseColor = GLOBALUTIL.color(color);
      m.emissiveColor = GLOBALUTIL.color(color);
      return m;
    } else if (materialName.substring(0, 7) === 'ecolor:') {
      let color = materialName.substring(7).trim();
      let objectData = sDataDefinition.getDefaultDataCloned('material');
      let m = this.__material(objectData);

      m.emissiveColor = GLOBALUTIL.color(color);
      return m;
    } else if (materialName.substring(0, 6) === 'color:') {
      let color = materialName.substring(6).trim();
      let objectData = sDataDefinition.getDefaultDataCloned('material');
      let m = this.__material(objectData);

      m.diffuseColor = GLOBALUTIL.color(color);
      return m;
    } else {
      let tD = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', materialName);
      let m;
      if (!tD) {
        m = new BABYLON.StandardMaterial('material', this.context.scene);
        if (materialName !== '' && materialName !== 'inherit')
          this.context.logError('material missing ' + materialName);
      } else
        m = this.__material(tD);

      return m;
    }
  }
  __updateMaterial(materialName, object) {
    materialName = this.__getMaterialFromParent(materialName);
    let m = this._materialFromName(materialName);
    this.context.__setMaterialOnObj(object, m);
  }
  _textureFromName(textureName) {
    let texture;
    if (textureName.substring(0, 3) === 'sb:') {
      let url = gAPPP.cdnPrefix + 'textures/' + textureName.substring(3);
      return new BABYLON.Texture(url, this.context.scene);
    }

    let tD = gAPPP.a.modelSets['texture'].getValuesByFieldLookup('title', textureName);
    if (tD === undefined)
      return;

    return this.__texture(tD);
  }
  __texture(values) {
    let url = values['url'];
    let texture;
    if (url.substring(0, 3) === 'sb:')
      url = gAPPP.cdnPrefix + 'textures/' + url.substring(3);

    if (values.isFittedText) {
      let renderSize = GLOBALUTIL.getNumberOrDefault(values.textureTextRenderSize, 512);
      texture = new BABYLON.DynamicTexture("dynamic texture", renderSize, this.context.scene, true);

      let fontWeight = 'normal';
      if (values.textFontWeight)
        fontWeight = values.textFontWeight;
      let textFontFamily = 'Geneva';
      if (values.textFontFamily)
        textFontFamily = values.textFontFamily;
      let textFontSize = GLOBALUTIL.getNumberOrDefault(values.textFontSize, 75);
      let textFontSizeOrig = textFontSize;

      if (!values.textureText)
        values.textureText = '';
      if (!values.textureText2)
        values.textureText2 = '';
      let numChar = values.textureText.length;
      let minFontSize = Math.ceil(renderSize * 1.5 / numChar);

      let numChar2 = values.textureText2.length;
      let minFontSize2 = Math.ceil(renderSize * 1.5 / numChar2);

      let minFontTotalSize = Math.max(minFontSize2, minFontSize);
      textFontSize = Math.min(textFontSize, minFontSize);

      let font = fontWeight + ' ' + textFontSize + 'px ' + textFontFamily;
      let invertY = true;
      let clearColor = "transparent";
      let color = "white"

      if (values.textFontColor)
        color = GLOBALUTIL.colorRGB255(values.textFontColor);
      if (values.textFontClearColor)
        clearColor = GLOBALUTIL.colorRGB255(values.textFontClearColor);
      let x = 0;
      let y = GLOBALUTIL.getNumberOrDefault(textFontSize, 50);

      texture._context.font = font;
      let wResult = texture._context.measureText(values.textureText);
      let text1Width = wResult.width;
      let leftOffset = (renderSize - text1Width) / 2.0;
      texture.drawText(values.textureText, x + leftOffset, y, font, color, clearColor);

      if (values.textureText2) {
        y += minFontSize2;
        let textFontSize2 = GLOBALUTIL.getNumberOrDefault(values.textFontSize, 75);

        textFontSize2 = Math.min(textFontSize2, minFontSize2);
        x = 0;

        font = fontWeight + ' ' + textFontSize2 + 'px ' + textFontFamily;

        texture._context.font = font;
        let wResult = texture._context.measureText(values.textureText2);
        let text1Width = wResult.width;
        let leftOffset2 = (renderSize - text1Width) / 2.0;

        texture.drawText(values.textureText2, x + leftOffset2, y, font, color, clearColor);
      }
    } else if (values.isText) {
      let renderSize = GLOBALUTIL.getNumberOrDefault(values.textureTextRenderSize, 512);
      texture = new BABYLON.DynamicTexture("dynamic texture", renderSize, this.context.scene, true);

      let fontWeight = 'normal';
      if (values.textFontWeight)
        fontWeight = values.textFontWeight;
      let textFontFamily = 'Geneva';
      if (values.textFontFamily)
        textFontFamily = values.textFontFamily;
      let textFontSize = GLOBALUTIL.getNumberOrDefault(values.textFontSize, 75);
      let font = fontWeight + ' ' + textFontSize + 'px ' + textFontFamily;
      let invertY = true;
      let clearColor = "transparent";
      let color = "white"

      if (values.textFontColor)
        color = GLOBALUTIL.colorRGB255(values.textFontColor);
      if (values.textFontClearColor)
        clearColor = GLOBALUTIL.colorRGB255(values.textFontClearColor);
      let x = 10;
      let y = GLOBALUTIL.getNumberOrDefault(textFontSize, 50);

      texture.drawText(values.textureText, x, y, font, color, clearColor);

      if (values.textureText2)
        texture.drawText(values.textureText2, x, y * 2, font, color, clearColor);
      if (values.textureText3)
        texture.drawText(values.textureText3, x, y * 3, font, color, clearColor);
      if (values.textureText4)
        texture.drawText(values.textureText4, x, y * 4, font, color, clearColor);

    } else if (values.isVideo)
      texture = new BABYLON.VideoTexture("video", [url], this.context.scene, true);
    else if (url === '')
      return null;
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
        this.context.scene._animationTimeLast = BABYLON.Tools.now;
        this.context.scene._animationTime = 0;
        this.framesHelper.startAnimation(frameIndex);
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
      this.setAnimationPosition(0);
      this.activeAnimation.stop();
      this.activeAnimation.reset();
      this.activeAnimation._paused = false;
    }

    this.framesHelper.playState = 0;

    for (let i in this.childBlocks)
      this.childBlocks[i].stopAnimation();


  }
  updateCamera() {
    let cameras = this.traverseCameraList();
    let camerasS = JSON.stringify(cameras);
    let sel = this.context.canvasHelper.cameraSelect;
    let startValue = sel.value;
    if (camerasS !== this.context.canvasHelper.camerasS) {
      this.camerasCache = cameras;
      this.context.canvasHelper.cameraDetails = cameras;
      this.context.canvasHelper.camerasS = camerasS;
      let html = '';
      let count = 0;
      for (let i in this.context.canvasHelper.cameraDetails) {
        html += `<option value="${i}">${this.context.canvasHelper.cameraDetails[i].cameraName}</option>`;
        count++;
      }
      sel.innerHTML = html;
      sel.value = startValue;
      if (sel.selectedIndex === -1)
        sel.selectedIndex = 0;
      if (count > 2)
        sel.selectedIndex = count - 1;
    }

    if (this.context.canvasHelper.cameraSelect.value !== startValue)
      this.context._updateCamera(this.context.canvasHelper.cameraSelect.value);
  }
  traverseCameraList(cameras = null) {
    if (cameras === null)
      cameras = this.context.canvasHelper.defaultCameras;

    if (this.blockRawData.childType === 'camera') {
      cameras[this._blockKey] = this.blockRawData;
      this.blockRawData.firstFrameValues = this.framesHelper.firstFrameValues();
    }

    for (let i in this.childBlocks)
      this.childBlocks[i].traverseCameraList(cameras);

    return cameras;
  }
  _findBestTargetObject(findString) {
    let parts = findString.split(':');
    if (parts.length < 2)
      return null;
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
  generateTargetFollowList() {
    let resultTargets = [];
    for (let i in this.childBlocks)
      resultTargets = resultTargets.concat(this.childBlocks[i].generateTargetFollowList());

    if (this.parent)
      resultTargets.push(this.blockRawData.childType + ':' + this.blockRawData.childName);

    return resultTargets;
  }
}
