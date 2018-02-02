class wContext {
  constructor(canvas, initEngine, canvasHelper = null) {
    this.ghostBlocks = {};
    this.light = null;
    this.camera = null;
    this.cameraName = '';
    this.blockCameraId = 'default';
    this.cameraVector = '';
    this._scene = null;
    this.activeBlock = null;
    this.canvas = canvas;
    this.engine = null;
    this.importedMeshes = [];
    this.importedMeshClones = [];
    this.cachedProfile = {};
    this.canvasHelper = canvasHelper;
    this.previousCameraRadius = '';
    this.previousCameraOrigin = '';
    this.previousCameraHieghtOffset = '';

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
    this.cachedProfile = {};
    this.floorGuidesShown = false;
    this.floorGridShown = false;
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

    if (this.cameraTypeShown !== 'default')
      this._renderDefaultCamera();

    this.scene.clearColor = GLOBALUTIL.color(gAPPP.a.profile.canvasColor);
    this.camera.attachControl(this.canvas, true);
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
    if (!timeoutCall) //do this after it renders a frame
    {
      clearTimeout(this.delayFocus);
      this.delayFocus = setTimeout(() => this.refreshFocus(true), 50);
      return;
    }
    this._renderFocusDetails();
    this._updateScaffoldingData();
    this.canvasHelper.refresh();

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
  _updateScaffoldingData() {
    if (!this.scene)
      return;
    let profile = gAPPP.a.profile;

    if (this.cachedProfile.canvasColor !== profile.canvasColor) {
      this.cachedProfile.canvasColor = profile.canvasColor;
      this.scene.clearColor = GLOBALUTIL.color(profile.canvasColor);
    }
    if (!this.camera)
      return;

    if (this.cachedProfile.lightIntensity !== profile.lightIntensity) {
      this.cachedProfile.lightIntensity = profile.lightIntensity;
      this.light.intensity = Number(profile.lightIntensity);
    }
    if (this.cachedProfile.lightVector !== profile.lightVector) {
      this.cachedProfile.lightVector = profile.lightVector;
      this.light.direction = GLOBALUTIL.getVector(profile.lightVector, 0, 1, 0);
    }

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
      this.__clearBoundsBox(this.activeBlock);
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
    if (this.activeBlock.blockRawData.childType !== 'block')
      for (let i in this.scene.meshes)
        if (this.scene.meshes[i].parent === sceneObject)
          this.scene.meshes[i].showBoundingBox = show;
  }
  __clearBoundsBox(block) {
    let sceneObject = block.sceneObject;
    if (!sceneObject)
      return;

    sceneObject.showBoundingBox = false;
    for (let i in this.scene.meshes)
      if (this.scene.meshes[i].parent === sceneObject)
        this.scene.meshes[i].showBoundingBox = false;
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
    if (!show) {
      if (this.floorGuidesShown === false)
        return;
      this.floorGuidesShown = false;
      return this.setGhostBlock('guides', null);
    }

    let redraw = false;
    if (this.cachedProfile.gridAndGuidesDepth !== gAPPP.a.profile.gridAndGuidesDepth) {
      redraw = true;
      this.cachedProfile.gridAndGuidesDepth = gAPPP.a.profile.gridAndGuidesDepth;
    }
    if (!this.floorGuidesShown) {
      redraw = true;
    }

    if (!redraw)
      return;

    this.floorGuidesShown = true;

    let gridDepth = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile.gridAndGuidesDepth, 5);
    let block = new wBlock(this);
    block.createGuides(gridDepth);
    this.setGhostBlock('guides', block);
  }
  showHideGrid(show = true) {
    if (!show) {
      if (this.floorGridShown === false)
        return;
      this.floorGridShown = false;
      return this.setGhostBlock('grid', null);
    }

    let redraw = false;
    if (this.cachedProfile.gridAndGuidesDepth !== gAPPP.a.profile.gridAndGuidesDepth) {
      redraw = true;
      this.cachedProfile.gridAndGuidesDepth = gAPPP.a.profile.gridAndGuidesDepth;
    }
    if (!this.floorGridShown) {
      redraw = true;
    }

    if (!redraw)
      return;

    this.floorGridShown = true;
    let gridDepth = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile.gridAndGuidesDepth, 5);
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
  _updateCamera(blockCameraId = null) {

    if (blockCameraId || !this.camera) {
      if (this.camera)
        this.camera.dispose();
      this.camera = null;
      if (blockCameraId)
        this.blockCameraId = blockCameraId;
      if (this.blockCameraId === 'default') {
        this._renderDefaultCamera();
      } else {
        let cameraDetails = this.canvasHelper.cameraDetails[this.blockCameraId];
        if (cameraDetails.childName === 'FollowCamera') {
          this._renderFollowCamera();
        } else {
          this._renderDefaultCamera();
        }
      }
    }

    if (! this.canvasHelper)
      return;
    if (this.blockCameraId === 'default')
      return;

    let cameraDetails = this.canvasHelper.cameraDetails[this.blockCameraId];
    if (! cameraDetails)
      return;

//    if (this.cameraTypeShown === 'FollowCamera') {
      if (this.previousCameraRadius !== cameraDetails.cameraRadius) {
        this.previousCameraRadius = cameraDetails.cameraRadius;
        this.camera.radius = cameraDetails.cameraRadius;
      }

      if (this.previousCameraOrigin !== cameraDetails.cameraOrigin) {
        this.previousCameraOrigin = cameraDetails.cameraOrigin;
        let cameraOrigin = GLOBALUTIL.getVector(cameraDetails.cameraOrigin, 0, 15, -15);
        this.camera.origin = cameraOrigin;
        this.camera.position = cameraOrigin;
      }

      if (this.cameraHeightOffset !== cameraDetails.cameraHeightOffset) {
        this.cameraHeightOffset = cameraDetails.cameraHeightOffset;
        this.camera.heightOffset = cameraDetails.cameraHeightOffset;
      }

  //  }
  }
  _renderFollowCamera() {
    this.cameraTypeShown = 'FollowCamera';
    if (this.camera)
      this.camera.dispose();
    let cameraDetails = this.canvasHelper.cameraDetails[this.blockCameraId];
    let cameraOrigin = GLOBALUTIL.getVector(cameraDetails.cameraOrigin, 0, 15, -15);
    this.camera = new BABYLON.FollowCamera("FollowCam", cameraOrigin, this.scene);
    this.camera._initCache();

    let cameraRadius = cameraDetails.cameraRadius;
    let heightOffset = cameraDetails.cameraHeightOffset;
    let rotationOffset = cameraDetails.cameraRotationOffset;
    let cameraAcceleration = cameraDetails.cameraAcceleration;
    let maxCameraSpeed = cameraDetails.maxCameraSpeed;

    this.previousCameraRadius = cameraRadius;
    if (cameraRadius)
      this.camera.radius = cameraRadius;
    if (heightOffset)
      this.camera.heightOffset = heightOffset;
    if (rotationOffset)
      this.camera.rotationOffset = rotationOffset;
    if (cameraAcceleration)
      this.camera.cameraAcceleration = cameraAcceleration;
    if (maxCameraSpeed)
      this.camera.maxCameraSpeed = maxCameraSpeed;

    this.camera.attachControl(this.canvas, true);

    let targetBlock = this.dialogForCamera.rootBlock;
    let mesh = targetBlock._findBestTargetObject(cameraDetails.cameraTargetBlock);
    if (!mesh)
      mesh = targetBlock;
    if (mesh)
      this.camera.lockedTarget = mesh.sceneObject;
  }
  _renderDefaultCamera() {
    this.cameraTypeShown = 'default';
    if (this.camera)
      this.camera.dispose();
    let cameraVector = GLOBALUTIL.getVector(gAPPP.a.profile.cameraVector, 3, 15, 15);
    this.camera = new BABYLON.ArcRotateCamera("defaultSceneBuilderCamera", .9, 0.9, cameraVector.y, new BABYLON.Vector3(0, 0, 0), this.scene)
    this.camera.attachControl(this.canvas, true);
    let radius = 10;
    let newRadius = Number(gAPPP.a.profile.arcCameraRadius);
    if (newRadius > 1 && newRadius < 500)
      radius = newRadius;
    this.camera.radius = radius;
    this.cameraVector = null;
  }
  selectCamera(blockCameraId, dialogForCamera) {
    if (!this.canvasHelper.cameraDetails[blockCameraId])
      blockCameraId = 'default';
    this.dialogForCamera = dialogForCamera;
    this._updateCamera(blockCameraId);
    //  gAPPP.a.profile.blockCameraId = blockCameraId;
  }
}
