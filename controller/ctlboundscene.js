/* binding controller for babylon scene to mdlFirebaseList */
'use strict';
class ctlBoundScene {
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
          mesh
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
      let s = scBabylonUtility.addSphere('sphere1', 15, 5, me.sceneDetails.scene, false);
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
      let s = gAPPP.renderEngine.addGround('ground1', 6, 6, 20, me.sceneDetails.scene);
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
      this.gridShown = true;
      let width = 10;
      let length = 10;
      let x = -10;
      let z = -10;
      let grid = scBabylonUtility.addGround('ground1', 6, 6, 3, this.sceneDetails.scene);
      this._addObject('grid', grid);
    } else {
      this.gridShown = false;
      this._removeObject('grid');
    }
  }
  showGuides(hide) {

  }
}
