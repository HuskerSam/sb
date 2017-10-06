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

    gAPPP.activeContext = this;
    this.engine = new BABYLON.Engine(this.canvas, false, {
      preserveDrawingBuffer: true
    });
    this.engine.enableOfflineSupport = false;

    if (this.camera)
      this.camera.attachControl(this.canvas, false);

    if (this.scene)
      this.scene.executeWhenReady(() => {
        this.engine.runRenderLoop(() => this.scene.render());
      });
    this.engine.resize();
  }
  createEmptyScene() {
    this.scene = new BABYLON.Scene(this.engine);
    this.sceneAddDefaultObjects();
  }
  getNewSceneSerialized(fileDom) {
    let me = this;
    let file = null;
    if (fileDom)
      file = fileDom.files[0];

    if (file) {
      return new Promise((resolve, reject) => {
        sUtility.fileToURI(file)
          .then((sceneSerial) => resolve(sceneSerial));
      });
    } else {
      return new Promise((resolve, reject) => {
        let s = new BABYLON.Scene(this.engine);
        let sS = BABYLON.SceneSerializer.Serialize(s);
        resolve(JSON.stringify(sS));
      });
    }
  }
  _addObject(key, obj) {
    if (this.extraSceneObjects[key])
      this.remove(this.extraSceneObjects[key]);
    this.extraSceneObjects[key] = obj;
  }
  _removeObject(key) {
    if (this.extraSceneObjects[key]) {
      this.extraSceneObjects[key].dispose();
      delete this.extraSceneObjects[key];
    }
  }
  _url(fireUrl) {
    return fireUrl.replace(gAPPP.storagePrefix, '');
  }
  _loadSceneMesh(meshData) {
    return new Promise((resolve, reject) => {
      this.loadMesh(gAPPP.storagePrefix, this._url(meshData['url']), this.scene)
        .then(mesh => {
          this.meshObj = mesh;
          this.meshLoadedURL = meshData['url'];
          resolve({
            type: 'mesh',
            mesh,
            context: this
          });
        }, scene => {
          console.log('failed to load mesh');
          resolve({
            type: 'mesh',
            mesh: null,
            context: this,
            error: 'failed to load mesh'
          });
        });
    });
  }
  _loadSceneFromData(sceneData) {
    return new Promise((resolve, reject) => {
      this.loadSceneFromURL(gAPPP.storagePrefix, this._url(sceneData['url']))
        .then((scene) => {
          this.scene = scene;
          this.sceneAddDefaultObjects();
          resolve({
            type: 'scene',
            context: this
          });
        });
    });
  }
  _loadSceneMaterial(materialData) {
    return new Promise((resolve, reject) => {
      let s = this.addSphere('sphere1', 15, 5, this.scene, false);
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
  loadScene(sceneType, values) {
    if (sceneType !== 'scene') {
      this.createEmptyScene();
    }

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
  showGrid(hide) {
    return;
    if (!hide) {
      if (this.gridShown) {
        this.showGrid(true);
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
  showGuides(hide) {
    return;
    if (!hide) {
      if (this.guidesShown) {
        this.showGuides(true);
      }
      let gridDepth = sUtility.getNumberOrDefault(gAPPP.a.profile['gridAndGuidesDepth'], 5);
      this.guideObjects = sUtility.showAxis(gridDepth, this.scene);

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
  uploadObject(type, title, fileDom) {
    let me = this;
    if (type === 'mesh') {
      return new Promise((resolve, reject) => {
        let meshData = sStatic.getDefaultDataCloned('mesh');
        meshData.title = title;

        if (fileDom.files.length > 0)
          this.importMesh(fileDom.files[0]).then(mesh => {
            let strMesh = null;
            if (mesh)
              strMesh = JSON.stringify(mesh);
            gAPPP.a.modelSets['mesh'].createWithBlobString(meshData, strMesh, 'mesh.babylon').then((r) => resolve(r));
          });
        else
          gAPPP.a.modelSets['mesh'].createWithBlobString(meshData).then((r) => resolve(r));
      });
    }
    if (type === 'scene') {
      return new Promise((resolve, reject) => {
        this.getNewSceneSerialized(fileDom).then((sceneSerial) => {
          gAPPP.a.modelSets['scene'].newScene(sceneSerial, title).then((r) => resolve(r));
        });
      });
    }
    if (type === 'texture') {
      return new Promise((resolve, reject) => {
        let textureData = sStatic.getDefaultDataCloned('texture');
        textureData.title = title;

        if (fileDom.files.length > 0)
          gAPPP.a.modelSets['texture'].createWithBlob(textureData, fileDom.files[0],
            'texturefileimage' + fileDom.files[0].name)
          .then((r) => resolve(r));
        else
          gAPPP.a.modelSets['texture'].createWithBlob(textureData).then((r) => resolve(r));
      });
    }
    if (type === 'material') {
      return new Promise((resolve, reject) => {
        gAPPP.a.modelSets['material'].newMaterial(title).then((r) => resolve(r));
      });
    }

    return new Promise(resolve => resolve());
  }
  sceneAddDefaultObjects() {
    this.scene.clearColor = sUtility.color(gAPPP.a.profile.canvasColor);

    let cameraVector = sUtility.getVector(gAPPP.a.profile.cameraVector, 0, 10, -10);
    this.camera = new BABYLON.FreeCamera("defaultSceneBuilderCamera", cameraVector, this.scene);
    this.camera.setTarget(BABYLON.Vector3.Zero());

    let lightVector = sUtility.getVector(gAPPP.a.profile.lightVector, 0, 1, 0);
    this.light = new BABYLON.HemisphericLight("defaultSceneBuilderLight", lightVector, this.scene);
    this.light.intensity = .7;

    this.updateSceneObjects();
  }
  updateSceneObjects() {
    if (gAPPP.a.profile.lightIntensity !== undefined)
      this.light.intensity = gAPPP.a.profile.lightIntensity;
    let cameraVector = sUtility.getVector(gAPPP.a.profile.cameraVector, 0, 10, -10);
    this.camera.position = cameraVector;
  }
  loadSceneFromURL(path, fileName) {
    let me = this;
    return new Promise(function(resolve, reject) {
      BABYLON.SceneLoader.Load(path, fileName, me.engine, scene => {
        return resolve(scene);
      });
    });
  }
  getJPGDataURL() {
    return new Promise((resolve, reject) => {
      BABYLON.Tools.CreateScreenshot(this.engine, this.camera, {
        width: 500
      }, (base64Image) => resolve(base64Image));
    });
  }
  importMesh(file) {
    let me = this;
    return new Promise((resolve, reject) => {
      sUtility.fileToURI(file)
        .then(d => me.serializeMesh("", "data:" + d)
          .then(strMesh => resolve(strMesh)));
    });
  }
  loadMesh(path, fileName) {
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ImportMesh('', path, fileName, this.scene,
        (newMeshes, particleSystems, skeletons) => {
          return resolve(newMeshes[0]);
        }, progress => {},
        err => reject(err));
    });
  }
  serializeMesh(path, fileName) {
    var me = this;
    return new Promise((resolve, reject) => {
      let temp_scene = new BABYLON.Scene(me.engine);
      me.loadMesh(path, fileName, temp_scene).then(newMesh => {
        resolve(BABYLON.SceneSerializer.Serialize(scene));
        temp_scene.dispose();
      });
    });
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

        let t = this.texture(tD);
        return sUtility.path(object, field.contextObjectField, t);
      }

      if (field.type === 'material') {
        let tD = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', value);
        if (tD === undefined) {
          let m = new BABYLON.StandardMaterial('material');
          object.material = m;
          return;
        }

        let m = this.material(tD);
        object.material = m;
        return;
      }

      //default
      sUtility.path(object, field.contextObjectField, value);
    } catch (e) {
      console.log('set ui object error', e, field, object, value);
    }
  }
  updateSelectedObject(contextObject, valueCache) {
    if (this !== gAPPP.activeContext)
      return;

    if (contextObject.type === 'texture') {
      contextObject.material.diffuseTexture = this.texture(valueCache);
      return;
    }
    if (contextObject.type === 'material') {
      contextObject.mesh.material = this.material(valueCache);
      return;
    }
    if (contextObject.type === 'mesh')
      return this.setMesh(valueCache, contextObject.mesh);
    if (contextObject.type === 'sceneTools') {
      return this.setSceneToolsDetails(contextObject, valueCache);
    }
  }
  setMesh(values, mesh) {
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
  material(values) {
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
  texture(values) {
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
        contextObject.context.showGrid(!value);
      }
      if (field.fireSetField === 'showSceneGuides') {
        contextObject.context.showGuides(!value);
      }
      // field.fireSetField === 'gridAndGuidesDepth'
    }
  }
  addSphere(name, faces, diameter) {
    let s = BABYLON.Mesh.CreateSphere(name, faces, diameter, this.scene);
    s.position.y = diameter / 2.0;
    return s;
  }
  makeTextPlane(text, color, size) {
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
  showAxis(size) {
    let sObjects = [];
    let axisX = BABYLON.Mesh.CreateLines("axisX", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    ], this.scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    sObjects.push(axisX);
    let xChar = this.makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    sObjects.push(xChar);

    let axisY = BABYLON.Mesh.CreateLines("axisY", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
      new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    ], this.scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    sObjects.push(axisY);
    let yChar = this.makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    sObjects.push(yChar);

    let axisZ = BABYLON.Mesh.CreateLines("axisZ", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
      new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    ], this.scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    sObjects.push(axisZ);

    let zChar = this.makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    sObjects.push(zChar);
    return sObjects;
  }
}
