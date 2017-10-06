class cContext {
  constructor(canvas, initEngine) {
    this.extraSceneObjects = {};
    this.gridShown = false;
    this.gridObject = null;
    this.light = null;
    this.camera = null;
    this.scene = null;
    this.activeObject = null;
    this.canvas = canvas;
    //this.loadedSceneURL = '';
    //this.loadedSceneKey = null;
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
  updateCamera() {
    if (this.camera)
      this.camera.dispose();
    let cameraVector = sBabylonUtility.getVector(gAPPP.a.profile.cameraVector, 0, 10, -10);
    this.camera = new BABYLON.FreeCamera("defaultSceneBuilderCamera", cameraVector, this.scene);
    this.camera.setTarget(BABYLON.Vector3.Zero());
  }
  _url(fireUrl) {
    return fireUrl.replace(gAPPP.storagePrefix, '');
  }
  _loadSceneMesh(meshData) {
    let me = this;
    return new Promise((resolve, reject) => {
      this.loadMesh(gAPPP.storagePrefix, this._url(meshData['url']), this.scene)
        .then((mesh) => {
          me.meshObj = mesh;
          me.meshLoadedURL = meshData['url'];
          resolve({
            type: 'mesh',
            mesh,
            context: me
          });
        }, (scene) => {
          console.log('failed to load mesh');
          resolve({
            type: 'mesh',
            mesh: null,
            context: me,
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
      let s = sBabylonUtility.addSphere('sphere1', 15, 5, this.scene, false);
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
      let gridDepth = sBabylonUtility.getNumberOrDefault(gAPPP.a.profile['gridAndGuidesDepth'], 5);
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
      let gridDepth = sBabylonUtility.getNumberOrDefault(gAPPP.a.profile['gridAndGuidesDepth'], 5);
      this.guideObjects = sBabylonUtility.showAxis(gridDepth, this.scene);

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
    this.scene.clearColor = sBabylonUtility.color(gAPPP.a.profile.canvasColor);

    let cameraVector = sBabylonUtility.getVector(gAPPP.a.profile.cameraVector, 0, 10, -10);
    this.camera = new BABYLON.FreeCamera("defaultSceneBuilderCamera", cameraVector, this.scene);
    this.camera.setTarget(BABYLON.Vector3.Zero());

    let lightVector = sBabylonUtility.getVector(gAPPP.a.profile.lightVector, 0, 1, 0);
    this.light = new BABYLON.HemisphericLight("defaultSceneBuilderLight", lightVector, this.scene);
    this.light.intensity = .7;

    this.updateSceneObjects();
  }
  updateSceneObjects() {
    if (gAPPP.a.profile.lightIntensity !== undefined)
      this.light.intensity = gAPPP.a.profile.lightIntensity;
    let cameraVector = sBabylonUtility.getVector(gAPPP.a.profile.cameraVector, 0, 10, -10);
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
  loadMesh(path, fileName, scene) {
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ImportMesh('', path, fileName, scene,
        (newMeshes, particleSystems, skeletons) => {
          return resolve(newMeshes[0]);
        }, progress => {},
        err => reject(err));
    });
  }
  serializeMesh(path, fileName) {
    var me = this;
    return new Promise((resolve, reject) => {
      let scene = new BABYLON.Scene(me.engine);
      me.loadMesh(path, fileName, scene).then(newMesh => {
        resolve(BABYLON.SceneSerializer.Serialize(scene));
        scene.dispose();
      });
    });
  }
}
