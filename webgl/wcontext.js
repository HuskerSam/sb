class wContext {
  constructor(canvas, initEngine) {
    this.ghostBlocks = {};
    this.light = null;
    this.camera = null;
    this.cameraType = '';
    this.cameraVector = '';
    this._scene = null;
    this.activeBlock = null;
    this.canvas = canvas;
    this.engine = null;
    this.importedMeshes = [];
    this.importedMeshClones = [];

    if (initEngine) {
      this.engine = new BABYLON.Engine(this.canvas, false, {
        preserveDrawingBuffer: true
      });
      this.engine.enableOfflineSupport = false;
    }
  }
  setGhostBlock(name, block) {
    if (this.ghostBlocks[name] === block)
      return;

    if (this.ghostBlocks[name])
      this.ghostBlocks[name].dispose();
    this.ghostBlocks[name] = block;
  }
  clearGhostBlocks() {
    for (let i in this.ghostBlocks)
      if (this.ghostBlocks[i])
        this.ghostBlocks[i].dispose();
    this.ghostBlocks = [];
  }
  set scene(newScene) {
    if (gAPPP.activeContext)
      gAPPP.activeContext.engine.stopRenderLoop();

    if (this._scene)
      this._scene.dispose();

    this.gridObject = null;
    this.gridShown = false;
    this.clearGhostBlocks();
    this._scene = newScene;
  }
  get scene() {
    return this._scene;
  }
  activate(scene) {
    if (gAPPP.activeContext)
      gAPPP.activeContext.deactivate();

    if (gAPPP.activeContext !== this) {
      gAPPP.activeContext = this;
      this.engine = new BABYLON.Engine(this.canvas, false, {
        preserveDrawingBuffer: true
      });
      this.engine.enableOfflineSupport = false;
    }

    if (scene !== undefined) {
      this.gridObject = null;
      this.activeBlock = null;
      this.clearGhostBlocks();

      if (scene === null)
        this.scene = new BABYLON.Scene(this.engine);
      else if (scene !== undefined)
        this.scene = scene;

      this._sceneAddDefaultObjects();
    }

    this.scene.clearColor = GLOBALUTIL.color(gAPPP.a.profile.canvasColor);
    this.camera.attachControl(this.canvas, false);
    this.scene.executeWhenReady(() => {
      this.engine.runRenderLoop(() => this.scene.render());
    });
    this.engine.resize();
  }
  createObject(objectType, title, file) {
    let objectData = sDataDefinition.getDefaultDataCloned(objectType);
    let fireSet = gAPPP.a.modelSets[objectType];
    objectData.title = title;

    if (!file)
      return fireSet.createWithBlobString(objectData);

    let filename = file.name;

    if (objectType === 'scene')
      return fireSet.createWithBlob(objectData, file, filename);

    if (objectType === 'texture')
      return fireSet.createWithBlob(objectData, file, filename);

    return new Promise((resolve, reject) => {
      if (objectType === 'mesh') {
        this._loadMeshFromDomFile(file).then(
          meshes => {
            let newMesh = meshes[0];
            this.engine.stopRenderLoop();
            this._sceneDisposeDefaultObjects();

            let sceneJSON = this._serializeScene();
            this._sceneAddDefaultObjects();
            this.activate();

            objectData.scalingX = newMesh.scaling.x;
            objectData.scalingY = newMesh.scaling.y;
            objectData.scalingZ = newMesh.scaling.z;

            objectData.positionX = newMesh.position.x;
            objectData.positionY = newMesh.position.y;
            objectData.positionZ = newMesh.position.z;

            objectData.rotationX = newMesh.rotation.x;
            objectData.rotationY = newMesh.rotation.y;
            objectData.rotationZ = newMesh.rotation.z;

            fireSet.createWithBlobString(objectData, sceneJSON, filename).then(
              r => resolve(r));
          });
      }
    });
  }
  deactivate() {
    if (gAPPP.activeContext)
      gAPPP.activeContext.engine.stopRenderLoop();
  }
  refreshFocus(timeoutCall) {
    if (gAPPP.activeContext !== this)
      return;

    this._renderFocusDetails();
    this._updateScaffoldingData();

    if (!this.activeBlock)
      return;

    let event = new CustomEvent('contextRefreshActiveObject', {
      detail: {
        context: this,
        block: this.activeBlock
      },
      bubbles: true
    });
    document.dispatchEvent(event);

    if (!timeoutCall) //do this twice - once after it renders a frame
      setTimeout(() => this.refreshFocus(true), 50);
  }
  loadSceneFromDomFile(file) {
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ShowLoadingScreen = false;
      let URI = URL.createObjectURL(file);
      BABYLON.SceneLoader.Load('', URI, this.engine,
        newScene => {
          this.activate(newScene);
          resolve({
            type: 'scene',
            context: this
          });
        },
        p => {},
        e => reject(e));
    });
  }
  loadSceneURL(url) {
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ShowLoadingScreen = false;
      BABYLON.SceneLoader.Load(gAPPP.storagePrefix, this._url(url), this.engine,
        newScene => {
          this.activate(newScene);
          resolve({
            type: 'scene',
            context: this
          });
        },
        p => {},
        e => reject(e));
    });
  }
  renderPreview(objectType, key) {
    let fireSet = gAPPP.a.modelSets[objectType];
    BABYLON.Tools.CreateScreenshot(this.engine, this.camera, {
      width: 500
    }, base64ImageURI => {
      let blob = GLOBALUTIL.dataURItoBlob(base64ImageURI);
      fireSet.setBlob(key, blob, 'sceneRenderImage.jpg').then(uploadResult =>
        fireSet.commitUpdateList([{
          field: 'renderImageURL',
          newValue: uploadResult.downloadURL
        }], key));
    });
  }
  updateObjectURL(objectType, key, file) {
    return new Promise((resolve, reject) => {
      if (objectType === 'mesh') {
        this.activate(null);
        this._loadMeshFromDomFile(file).then(
          meshes => {
            let newMesh = meshes[0];
            this.engine.stopRenderLoop();
            this._sceneDisposeDefaultObjects();

            let filename = file.name;
            let fireSet = gAPPP.a.modelSets[objectType];
            let sceneJSON = this._serializeScene();
            this._sceneAddDefaultObjects();
            this.activate();
            //this.activeBlock = newMesh;
            fireSet.updateBlobString(key, sceneJSON, filename).then(
              r => resolve(r));
          });
      } else
        resolve({});
    });
  }
  _updateCamera() {
    let cameraVector = GLOBALUTIL.getVector(gAPPP.a.profile.cameraVector, 3, 15, 15);
    let cameraType = gAPPP.a.profile.cameraType;

    if (cameraType !== this.cameraType || !this.camera) {
      if (this.camera)
        this.camera.dispose();

      if (cameraType === 'Arc Rotate')
        this.camera = new BABYLON.ArcRotateCamera("defaultSceneBuilderCamera", 1, 0.8, cameraVector.y, new BABYLON.Vector3(0, 0, 0), this.scene)
      else
        this.camera = new BABYLON.FreeCamera("defaultSceneBuilderCamera", cameraVector, this.scene);

      this.cameraType = cameraType;
      this.camera.attachControl(this.canvas, false);

      this.cameraVector = null;
    }

    let strCameraVector = cameraVector.x + ',' + cameraVector.y + ',' + cameraVector.z;
    if (this.cameraVector !== strCameraVector) {
      if (cameraType === 'Arc Rotate') {
        this.camera.setPosition(cameraVector);
      } else {
        this.camera.position = cameraVector;
        this.camera.setTarget(BABYLON.Vector3.Zero());
      }
      this.cameraVector = strCameraVector;
    }
  }
  _updateScaffoldingData() {
    if (!this.scene)
      return;
    let profile = gAPPP.a.profile;
    this.scene.clearColor = GLOBALUTIL.color(profile.canvasColor);
    if (!this.camera)
      return;

    this.light.intensity = Number(profile.lightIntensity);
    this.light.direction = GLOBALUTIL.getVector(profile.lightVector, 0, 1, 0);

    this._updateCamera();
    this.showHideGrid(profile.showFloorGrid);
    this.showHideGuides(profile.showSceneGuides);
  }
  setActiveBlock(block) {
    this._clearActiveBlock();
    this.activeBlock = block;
    this.refreshFocus();
  }
  _addOriginalAndClone(originalMesh) {
    this.importedMeshes.push(originalMesh);
    let newMesh = originalMesh.clone(originalMesh);

  }
  _clearActiveBlock() {
    if (this.activeBlock) {
      this.__setBoundsBox(this.activeBlock, false);
      this.activeBlock = null;
    }
    this.clearGhostBlocks();
  }
  _loadMeshFromDomFile(file) {
    return new Promise((resolve, reject) => {
      let URI = URL.createObjectURL(file);
      BABYLON.SceneLoader.ImportMesh('', '', URI, this.scene,
        (newMeshes, particleSystems, skeletons) => resolve(newMeshes),
        progress => {},
        err => resolve(null));
    });
  }
  _loadSceneTexture(textureData) {
    return new Promise((resolve, reject) => {
      let s = BABYLON.Mesh.CreateGround("ground1", 12, 12, 2, this.scene);
      let material = new BABYLON.StandardMaterial('material', this.scene);
      s.material = material;
      resolve({
        type: 'texture',
        sceneObject: s,
        material,
        context: this
      });
    });
  }
  _renderFocusDetails() {
    if (gAPPP.a.profile.showForceWireframe)
      this.scene.forceWireframe = true;
    else
      this.scene.forceWireframe = false;

    if (!this.activeBlock)
      return;

    if (!this.activeBlock.sceneObject)
      return;

    this.__fadeSelectedObject();
    this.__updateBoundsBox();
  }
  __updateBoundsBox() {
    let sceneObject = this.activeBlock.sceneObject;
    if (!sceneObject)
      return;

    let show = false;
    if (gAPPP.a.profile.showBoundsBox)
      show = true;
    sceneObject.showBoundingBox = show;
    for (let i in this.scene.meshes)
      if (this.scene.meshes[i].parent === sceneObject)
        this.scene.meshes[i].showBoundingBox = show;
  }
  __setBoundsBox(block, show = true) {
    let sceneObject = block.sceneObject;
    if (!sceneObject)
      return;

    sceneObject.showBoundingBox = show;
    for (let i in this.scene.meshes)
      if (this.scene.meshes[i].parent === sceneObject)
        this.scene.meshes[i].showBoundingBox = show;
  }
  __fadeSelectedObject() {
    let sceneObject = this.activeBlock.sceneObject;
    if (!sceneObject)
      return;
    let fade = false;
    if (this.ghostBlocks['scalePreview'])
      fade = true;
    if (this.ghostBlocks['rotatePreview'])
      fade = true;
    if (this.ghostBlocks['offsetPreview'])
      fade = true;

    let fadeLevel = this.activeBlock.blockRenderData.visibility;
    if (fade)
      fadeLevel = .5;

    this.__fadeObject(sceneObject, fadeLevel);
  }
  __fadeObject(obj, fadeLevel) {
    if (fadeLevel === '' || fadeLevel === undefined)
      fadeLevel = 1;
    obj.visibility = fadeLevel;
    for (let i in this.scene.meshes)
      if (this.scene.meshes[i].parent === obj)
        this.scene.meshes[i].visibility = fadeLevel;
  }
  _sceneDisposeDefaultObjects() {
    if (this.camera)
      this.camera.dispose();
    this.camera = null;

    if (this.light)
      this.light.dispose();
    this.light = null;

    this.setGhostBlock('grid', null);
    this.setGhostBlock('guides', null);
    this.setGhostBlock('scalePreview', null);
    this.setGhostBlock('offsetPreview', null);
    this.setGhostBlock('rotatePreview', null);
  }
  _sceneAddDefaultObjects() {
    this.scene.clearColor = GLOBALUTIL.color('.7,.7,.7');
    this._sceneDisposeDefaultObjects();
    this._updateCamera();

    let lightVector = GLOBALUTIL.getVector(gAPPP.a.profile.lightVector, 0, 1, 0);
    this.light = new BABYLON.HemisphericLight("defaultSceneBuilderLight", lightVector, this.scene);
    this.light.intensity = .7;

    this._updateScaffoldingData();
  }
  _serializeScene() {
    return JSON.stringify(BABYLON.SceneSerializer.Serialize(this.scene));
  }
  _url(fireUrl) {
    return fireUrl.replace(gAPPP.storagePrefix, '');
  }
  showHideGuides(show = true) {
    if (!show)
      return this.setGhostBlock('guides', null);
    let gridDepth = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile['gridAndGuidesDepth'], 5);
    let block = new wBlock(this);
    block.createGuides(gridDepth);
    this.setGhostBlock('guides', block);
  }
  showHideGrid(show = true) {
    if (!show)
      return this.setGhostBlock('grid', null);
    let gridDepth = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile['gridAndGuidesDepth'], 5);
    let block = new wBlock(this);
    block.createGrid(gridDepth);
    this.setGhostBlock('grid', block);
  }
  __setMaterialOnObj(sceneObject, materialObject) {
    if (!sceneObject)
      return;
    sceneObject.material = materialObject;

    for (let i in this.scene.meshes) {
      if (this.scene.meshes[i].parent === sceneObject)
        this.scene.meshes[i].material = materialObject;
    }
  }
}
