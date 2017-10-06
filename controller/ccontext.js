class cContext {
  constructor(canvas, initEngine) {
    this.extraSceneObjects = {};
    this.gridShown = false;
    this.gridObject = null;
    this.light = null;
    this.camera = null;
    this.scene = null;
    this.activeContextObject = null;
    this.canvas = canvas;
    this.engine = null;

    if (initEngine) {
      this.engine = new BABYLON.Engine(this.canvas, false, {
        preserveDrawingBuffer: true
      });
      this.engine.enableOfflineSupport = false;
    }
  }
  activate() {
    if (gAPPP.activeContext)
      gAPPP.activeContext.engine.stopRenderLoop();

    if (gAPPP.activeContext !== this) {
      gAPPP.activeContext = this;
      this.engine = new BABYLON.Engine(this.canvas, false, {
        preserveDrawingBuffer: true
      });
      this.engine.enableOfflineSupport = false;
    }
    if (this.camera)
      this.camera.attachControl(this.canvas, false);

    if (this.scene)
      this.scene.executeWhenReady(() => {
        this.engine.runRenderLoop(() => this.scene.render());
      });
    this.engine.resize();
  }
  clear() {
    this.loadedSceneURL = '';
    this._createEmptyScene();
    this.activate();
  }
  createObject(objectType, title, file) {
    let objectData = sStatic.getDefaultDataCloned(objectType);
    let fireSet = gAPPP.a.modelSets[objectType];
    objectData.title = title;

    if (!file)
      return fireSet.createWithBlobString(objectData);

    let filename = file.name;

    if (objectType !== 'mesh')
      return fireSet.createWithBlob(objectData, file, filename);

    return new Promise((resolve, reject) => {
      sUtility.fileToURI(file).then(
        fileBlobString => this._sceneLoadMesh("", "data:" + fileBlobString).then(
          mesh => {
            let sceneJSON = this._serializeScene();
            fireSet.createWithBlobString(objectData, sceneJSON, filename).then(
              r => resolve(r));
          }));
    });
  }
  loadScene(sceneType, values) {
    this._createEmptyScene();
    this.extraSceneObjects = [];

    if (sceneType === 'mesh')
      return this._loadSceneMesh(values);

    if (sceneType === 'scene')
      return this._loadSceneFromData(values);

    if (sceneType === 'material')
      return this._loadSceneMaterial(values);

    if (sceneType === 'texture')
      return this._loadSceneTexture(values);

    return new Promise((resolve) => resolve(null));
  }
  renderPreview(objectType, key) {
    let fireSet = gAPPP.a.modelSets[objectType];
    BABYLON.Tools.CreateScreenshot(this.engine, this.camera, {
      width: 500
    }, base64ImageURI => {
      let blob = sUtility.dataURItoBlob(base64ImageURI);
      fireSet.setBlob(key, blob, 'sceneRenderImage.jpg').then(uploadResult =>
        fireSet.commitUpdateList([{
          field: 'renderImageURL',
          newValue: uploadResult.downloadURL
        }], key));
    });
  }
  _sceneLoadMesh(path, URI) {
    let scene = this.scene;
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ImportMesh('', path, URI, scene,
        (newMeshes, particleSystems, skeletons) => {
          return resolve(newMeshes[0]);
        }, progress => {},
        err => resolve(null));
    });
  }
  setSceneToolsDetails(contextObject, valueCache) {
    let fields = sStatic.bindingFields['sceneToolsBar'];
    for (let i in fields) {
      let field = fields[i];
      let value = valueCache[field.fireSetField];

      if (field.fireSetField === 'lightIntensity') {
        contextObject.context.light.intensity = Number(value);
      }
      if (field.fireSetField === 'lightVector') {
        contextObject.context.light.direction = sUtility.getVector(value, 0, 1, 0);
      }
      if (field.fireSetField === 'cameraVector') {
        contextObject.context.camera.position = sUtility.getVector(value, 0, 10, -10);
      }
      if (field.fireSetField === 'showFloorGrid') {
        contextObject.context._showGrid(!value);
      }
      if (field.fireSetField === 'showSceneGuides') {
        contextObject.context._showGuides(!value);
      }
      // field.fireSetField === 'gridAndGuidesDepth'
    }
  }
  updateObjectURL(objectType, key, file) {
    return new Promise((resolve, reject) => {
      sUtility.fileToURI(file).then(
        fileBlobString => this._sceneLoadMesh("", "data:" + fileBlobString).then(
          mesh => {
            let filename = file.name;
            let fireSet = gAPPP.a.modelSets[objectType];
            let sceneJSON = this._serializeScene();
            fireSet.updateBlobString(key, sceneJSON, filename).then(
              r => resolve(r));
          }));
    });
  }
  updateSelectedObject(contextObject, valueCache) {
    if (this !== gAPPP.activeContext)
      return;

    if (contextObject.type === 'texture') {
      contextObject.material.diffuseTexture = this._texture(valueCache);
      return;
    }
    if (contextObject.type === 'material') {
      contextObject.mesh.material = this._material(valueCache);
      return;
    }
    if (contextObject.type === 'mesh')
      return this._setMesh(valueCache, contextObject.mesh);
    if (contextObject.type === 'sceneTools') {
      return this.setSceneToolsDetails(contextObject, valueCache);
    }
  }
  updateSceneObjects() {
    if (gAPPP.a.profile.lightIntensity !== undefined)
      this.light.intensity = gAPPP.a.profile.lightIntensity;
    let cameraVector = sUtility.getVector(gAPPP.a.profile.cameraVector, 0, 10, -10);
    this.camera.position = cameraVector;
  }

  _addObject(key, obj) {
    if (this.extraSceneObjects[key])
      this.remove(this.extraSceneObjects[key]);
    this.extraSceneObjects[key] = obj;
  }
  _addSphere(name, faces, diameter) {
    let s = BABYLON.Mesh.CreateSphere(name, faces, diameter, this.scene);
    s.position.y = diameter / 2.0;
    return s;
  }
  _createEmptyScene() {
    this.scene = new BABYLON.Scene(this.engine);
    this._sceneAddDefaultObjects();
  }
  _loadSceneMesh(objectData) {
    return new Promise((resolve, reject) => {
      let path = gAPPP.storagePrefix;
      let filename = this._url(objectData['url']);
      BABYLON.SceneLoader.ImportMesh('', path, filename, this.scene,
        (newMeshes, particleSystems, skeletons) => resolve({
          type: 'mesh',
          mesh: newMeshes[0],
          context: this
        }),
        progress => {},
        err => {
          console.log('failed to load mesh');
          resolve({
            type: 'mesh',
            mesh: null,
            context: this,
            error: true,
            message: 'failed to load mesh'
          });
        });
    });
  }
  _loadSceneFromData(sceneData) {
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ShowLoadingScreen = false;
      BABYLON.SceneLoader.Load(gAPPP.storagePrefix, this._url(sceneData['url']), this.engine, newScene => {
        this.scene = newScene;
        this._sceneAddDefaultObjects();
        resolve({
          type: 'scene',
          context: this
        });
      });
    });
  }
  _loadSceneMaterial(materialData) {
    return new Promise((resolve, reject) => {
      let s = this._addSphere('sphere1', 15, 5, this.scene, false);
      let material = new BABYLON.StandardMaterial('material', this.scene);
      s.material = material;
      this.extraSceneObjects.push(s);
      resolve({
        type: 'material',
        mesh: s,
        material,
        context: this
      });
    });
  }
  _loadSceneTexture(textureData) {
    return new Promise((resolve, reject) => {
      let s = BABYLON.Mesh.CreateGround("ground1", 12, 12, 2, this.scene);

      this.extraSceneObjects.push(s);

      let material = new BABYLON.StandardMaterial('material', this.scene);
      s.material = material;

      resolve({
        type: 'texture',
        mesh: s,
        material,
        context: this
      });
    });
  }
  _makeTextPlane(text, color, size) {
    let dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, this.scene, true);
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
    let plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, this.scene, true);
    plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this.scene);
    plane.material.backFaceCulling = false;
    plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    plane.material.diffuseTexture = dynamicTexture;
    return plane;
  }
  _material(values) {
    let material = new BABYLON.StandardMaterial('material', this.scene);

    let fields = sStatic.bindingFields['material'];
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.contextObjectField)
        this._updateObjectValue(field, value, material);
    }
    return material;
  }
  _texture(values) {
    let texture = new BABYLON.Texture(values['url'], this.scene);

    function isNumeric(v) {
      return !isNaN(parseFloat(Number(v))) && isFinite(Number(v));
    }
    if (isNumeric(values['vScale']))
      texture.vScale = Number(values['vScale']);
    if (isNumeric(values['uScale']))
      texture.uScale = Number(values['uScale']);
    if (isNumeric(values['vOffset']))
      texture.vOffset = Number(values['vOffset']);
    if (isNumeric(values['uOffset']))
      texture.uOffset = Number(values['uOffset']);

    texture.hasAlpha = values['hasAlpha'];
    return texture;
  }
  _removeObject(key) {
    if (this.extraSceneObjects[key]) {
      this.extraSceneObjects[key].dispose();
      delete this.extraSceneObjects[key];
    }
  }
  _sceneAddDefaultObjects() {
    this.scene.clearColor = sUtility.color(gAPPP.a.profile.canvasColor);

    let cameraVector = sUtility.getVector(gAPPP.a.profile.cameraVector, 0, 10, -10);
    this.camera = new BABYLON.FreeCamera("defaultSceneBuilderCamera", cameraVector, this.scene);
    this.camera.setTarget(BABYLON.Vector3.Zero());

    let lightVector = sUtility.getVector(gAPPP.a.profile.lightVector, 0, 1, 0);
    this.light = new BABYLON.HemisphericLight("defaultSceneBuilderLight", lightVector, this.scene);
    this.light.intensity = .7;

    this.updateSceneObjects();
  }
  _serializeScene() {
    return JSON.stringify(BABYLON.SceneSerializer.Serialize(this.scene));
  }
  _setMesh(values, mesh) {
    if (!mesh)
      return;
    let fields = sStatic.bindingFields['mesh'];
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.fireSetField === 'name')
        continue;
      if (field.contextObjectField)
        this._updateObjectValue(field, value, mesh);
    }
  }
  _showAxis(size) {
    let sObjects = [];
    let axisX = BABYLON.Mesh.CreateLines("axisX", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    ], this.scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    sObjects.push(axisX);
    let xChar = this._makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    sObjects.push(xChar);

    let axisY = BABYLON.Mesh.CreateLines("axisY", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
      new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    ], this.scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    sObjects.push(axisY);
    let yChar = this._makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    sObjects.push(yChar);

    let axisZ = BABYLON.Mesh.CreateLines("axisZ", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
      new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    ], this.scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    sObjects.push(axisZ);

    let zChar = this._makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    sObjects.push(zChar);
    return sObjects;
  }
  _showGrid(hide) {
    return;
    if (!hide) {
      if (this.gridShown) {
        this._showGrid(true);
      }

      this.gridShown = true;
      let gridDepth = sUtility.getNumberOrDefault(gAPPP.a.profile['gridAndGuidesDepth'], 5);
      let grid = BABYLON.Mesh.CreateGround("ground1", gridDepth, gridDepth, 2, this.scene);
      let material = new BABYLON.StandardMaterial('scenematerialforfloorgrid', this.scene);
      let texture = new BABYLON.Texture('greengrid.png', this.scene);
      texture.hasAlpha = true;
      material.diffuseTexture = texture;
      texture.vScale = gridDepth;
      texture.uScale = gridDepth;
      grid.material = material;
      this._addObject('grid', grid);
    } else {
      if (!this.gridShown)
        return;
      this.gridShown = false;
      this._removeObject('grid');
    }
  }
  _showGuides(hide) {
    return;
    if (!hide) {
      if (this.guidesShown) {
        this.showGuides(true);
      }
      let gridDepth = sUtility.getNumberOrDefault(gAPPP.a.profile['gridAndGuidesDepth'], 5);
      this.guideObjects = this._showAxis(gridDepth, this.scene);

      for (let i in this.guideObjects)
        this.extraSceneObjects['guideObject' + i.toString()] = this.guideObjects[i];
      this.guidesShown = true;
    } else {
      if (!this.guidesShown)
        return;
      this.guidesShown = false;
      for (let i in this.guideObjects)
        this._removeObject('guideObject' + i.toString());
      this.guideObjects = [];
    }
  }
  _updateObjectValue(field, value, object) {
    try {
      if (value === '')
        return;
      if (value === undefined)
        return;
      if (field.type === undefined)
        return sUtility.path(object, field.contextObjectField, value);

      if (field.type === 'color') {
        let parts = value.split(',');
        let cA = [];
        let color = new BABYLON.Color3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
        return sUtility.path(object, field.contextObjectField, color);
      }

      if (field.type === 'texture') {
        let tD = gAPPP.a.modelSets['texture'].getValuesByFieldLookup('title', value);
        if (tD === undefined)
          return;

        let t = this._texture(tD);
        return sUtility.path(object, field.contextObjectField, t);
      }

      if (field.type === 'material') {
        let tD = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', value);
        if (tD === undefined) {
          let m = new BABYLON.StandardMaterial('material');
          object.material = m;
          return;
        }

        let m = this._material(tD);
        object.material = m;
        return;
      }

      //default
      sUtility.path(object, field.contextObjectField, value);
    } catch (e) {
      console.log('set ui object error', e, field, object, value);
    }
  }
  _url(fireUrl) {
    return fireUrl.replace(gAPPP.storagePrefix, '');
  }
}
