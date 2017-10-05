class cBoundScene {
  constructor() {
    this.sceneDetails = {};
    this.extraSceneObjects = {};
    this.gridShown = false;
    this.gridObject = null;
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
  activate() {
    gAPPP.renderEngine.setSceneDetails(this.sceneDetails);
  }
  set(sceneDetails) {
    this.sceneDetails = sceneDetails;
  }
  updateCamera() {
    if (this.sceneDetails.camera)
      this.sceneDetails.camera.dispose();
    let cameraVector = sBabylonUtility.getVector(gAPPP.a.profile.cameraVector, 0, 10, -10);
    this.sceneDetails.camera = new BABYLON.FreeCamera("defaultSceneBuilderCamera", cameraVector, this.sceneDetails.scene);
    this.sceneDetails.camera.setTarget(BABYLON.Vector3.Zero());
  }
  _url(fireUrl) {
    return fireUrl.replace(gAPPP.storagePrefix, '');
  }
  _loadSceneMesh(meshData) {
    let me = this;
    return new Promise((resolve, reject) => {
      gAPPP.renderEngine.loadMesh(meshData['meshName'], gAPPP.storagePrefix,
          me._url(meshData['url']), me.sceneDetails.scene)
        .then((mesh) => {
          me.meshObj = mesh;
          me.meshLoadedName = meshData['meshName'];
          me.meshLoadedURL = meshData['url'];
          resolve({
            type: 'mesh',
            mesh,
            scene: me.sceneDetails.scene
          });
        }, (scene) => {
          console.log('failed to load mesh');
          resolve({
            type: 'mesh',
            mesh: null,
            scene: me.sceneDetails.scene,
            error: 'failed to load mesh'
          });
        });
    });
  }
  _loadSceneFromData(sceneData) {
    let me = this;
    return new Promise((resolve, reject) => {
      gAPPP.renderEngine.loadScene(gAPPP.storagePrefix, me._url(sceneData['url']))
        .then((scene) => {
          me.sceneDetails.scene = scene;
          me.sceneDetails.scene.clearColor = gAPPP.renderEngine.color(gAPPP.a.profile.canvasColor);
          resolve({
            type: 'scene',
            scene: me.sceneDetails.scene
          });
        });
    });
  }
  _loadSceneMaterial(materialData) {
    let me = this;
    return new Promise((resolve, reject) => {
      let s = sBabylonUtility.addSphere('sphere1', 15, 5, me.sceneDetails.scene, false);
      let material = new BABYLON.StandardMaterial('material', me.sceneDetails.scene);
      s.material = material;
      me.extraSceneObjects.push(s);
      resolve({
        type: 'material',
        mesh: s,
        material,
        scene: me.sceneDetails.scene
      });
    });
  }
  _loadSceneTexture(textureData) {
    let me = this;
    return new Promise((resolve, reject) => {
      let s = BABYLON.Mesh.CreateGround("ground1", 12, 12, 2, me.sceneDetails.scene);

      me.extraSceneObjects.push(s);

      let material = new BABYLON.StandardMaterial('material', me.sceneDetails.scene);
      s.material = material;

      resolve({
        type: 'texture',
        mesh: s,
        material,
        scene: me.sceneDetails.scene
      });
    });
  }
  loadScene(sceneType, values) {
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
    if (!hide) {
      if (this.gridShown) {
        this.showGrid(true);
      }

      this.gridShown = true;
      let gridDepth = sBabylonUtility.getNumberOrDefault(gAPPP.a.profile['gridAndGuidesDepth'], 5);
      let grid = BABYLON.Mesh.CreateGround("ground1", gridDepth, gridDepth, 2, this.sceneDetails.scene);
      let material = new BABYLON.StandardMaterial('scenematerialforfloorgrid', this.sceneDetails.scene);
      let texture = new BABYLON.Texture('greengrid.png');
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
    if (!hide) {
      if (this.guidesShown) {
        this.showGuides(true);
      }
      let gridDepth = sBabylonUtility.getNumberOrDefault(gAPPP.a.profile['gridAndGuidesDepth'], 5);
      this.guideObjects = sBabylonUtility.showAxis(gridDepth, this.sceneDetails.scene);

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
          gAPPP.renderEngine.importMesh(fileDom.files[0]).then(mesh => {
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
        sBabylonUtility.getNewSceneSerialized(fileDom).then((sceneSerial) => {
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
}
