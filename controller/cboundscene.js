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
  _url(fireUrl) {
    return fireUrl.replace(gAPPP.storagePrefix, '');
  }
  _loadSceneMesh(meshData) {
    let me = this;
    return new Promise((resolve, reject) => {
      gAPPP.renderEngine.loadMesh(meshData['meshName'], gAPPP.storagePrefix,
          me._url(meshData['url']), me.sceneDetails.scene)
        .then((mesh) => resolve({
          type: 'mesh',
          mesh,
          scene: me.sceneDetails.scene
        }));
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
}
