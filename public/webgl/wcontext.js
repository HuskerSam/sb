class wContext {
  constructor(canvas, geoOptions) {
    this.ghostBlocks = {};
    this.light = null;
    this.camera = null;
    this.cameraName = '';
    this.blockCameraId = 'default';
    this._scene = null;
    this.activeBlock = null;
    this.canvas = canvas;
    this.engine = null;
    this.importedMeshes = [];
    this.importedMeshClones = [];
    this.cachedProfile = {};
    this.previousCameraRadius = '';
    this.previousCameraOrigin = '';
    this.previousCameraHieghtOffset = '';
    this.preRenderFrame = () => {};
    this.arcCameraRadius = 50;

    this.geoFilter = false;
    this.zeroLatitude = 0.0;
    this.zeroLongitude = 0.0;
    this.geoRadius = 50.0;
    this.minLatitude = 0.0;
    this.maxLatitude = 0.0;
    this.minLongitude = 0.0;
    this.maxLongitude = 0.0;
    this.handleAnimationNotReadyCallback = null;

    if (geoOptions) {
      this.geoRadius = geoOptions.geoRadius;
      this.zeroLatitude = geoOptions.zeroLatitude;
      this.zeroLongitude = geoOptions.zeroLongitude;
      this.geoFilter = true;
      this.updateGPSWindow();
    }
  }
  updateGPSWindow() {
    let pt1 = GLOBALUTIL.gpsOffsetCoords(this.zeroLatitude, this.zeroLongitude, this.geoRadius, this.geoRadius);
    let pt2 = GLOBALUTIL.gpsOffsetCoords(this.zeroLatitude, this.zeroLongitude, -1.0 * this.geoRadius, -1.0 * this.geoRadius);

    this.maxLatitude = pt1.lat;
    this.minLatitude = pt2.lat;
    this.maxLongitude = pt1.lon;
    this.minLongitude = pt2.lon;
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

    this._scene.onPointerDown = (evt, pickResult) => this.scenePick(evt, pickResult);
  }
  scenePick(evt, pickResult) {
    if (pickResult.hit) {
      let mesh = pickResult.pickedMesh;
      let parent = pickResult.pickedMesh;
      while (parent) {
        parent = mesh.parent;
        if (mesh.isContainerBlock) {
          let blockData = gAPPP.a.modelSets['blockchild'].getCache(mesh._blockKey);
          if (blockData)
            if (blockData.frameCommand) {
              this.sceneCommand(blockData.frameCommand, blockData.frameCommandField,
                blockData.frameCommandValue, mesh.blockWrapper.rootBlock.blockKey);
            }
        }
        mesh = parent;
      }
    }
  }
  sceneCommand(cmd, cmdField, cmdValue, key) {
    if (cmd === 'Set') {
      if (cmdField === 'videoURL') {
        if (!cmdValue)
          cmdValue = '';
        gAPPP.a.modelSets['block'].commitUpdateList([{
          field: 'videoURL',
          newValue: cmdValue
        }, {
          field: 'videoStart',
          newValue: firebase.database.ServerValue.TIMESTAMP
        }], key);
      }
    }
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

      this.info = this.engine.getGlInfo();
    }

    if (scene !== undefined) {
      this.gridObject = null;
      this.activeBlock = null;
      this.clearGhostBlocks();

      if (scene === null)
        this.scene = new BABYLON.Scene(this.engine);
      else
        this.scene = scene;

      this._sceneAddDefaultObjects();
    }

    this._renderDefaultCamera();

    this.rebindCamera();

    this.scene.executeWhenReady(() => {
      this.engine.runRenderLoop(() => {
        try {
          if (this.canvasHelper.cameraShown) {
            this.preRenderFrame();
            this.scene.render();
          }
        } catch (e) {
          console.log('Render Error', e);
        }
      });
    });
    this.engine.resize();
  }
  rebindCamera() {
    this.camera.attachControl(this.canvas, true);
  }
  async createObject(objectType, title, file, mixinData = {}) {
    let objectData = sDataDefinition.getDefaultDataCloned(objectType);
    let fireSet = gAPPP.a.modelSets[objectType];
    objectData.title = title;

    for (let i in mixinData)
      objectData[i] = mixinData[i];

    objectData.sortKey = new Date().getTime();

    if (!file)
      return fireSet.createWithBlobString(objectData);

    let filename = file.name;

    if (objectType === 'scene')
      return fireSet.createWithBlob(objectData, file, filename);

    if (objectType === 'texture')
      return fireSet.createWithBlob(objectData, file, filename);

    if (objectType === 'mesh') {
      return this._loadMeshFromDomFile(file).then(
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

          return fireSet.createWithBlobString(objectData, sceneJSON, filename);
        });
    }

    return Promise.resolve();
  }
  deactivate() {
    if (gAPPP.activeContext)
      gAPPP.activeContext.engine.stopRenderLoop();
  }
  refreshFocus(timeoutCall) {
    if (gAPPP.activeContext !== this)
      return;
    if (!gAPPP.a.profile)
      return;
    if (!timeoutCall) //do this after it renders a frame
    {
      if (this.activeBlock) {
        let event = new CustomEvent('contextRefreshActiveObject', {
          detail: {
            context: this,
            block: this.activeBlock
          },
          bubbles: true
        });
        document.dispatchEvent(event);
      }
      clearTimeout(this.delayFocus);
      this.delayFocus = setTimeout(() => this.refreshFocus(true), 100);
      return;
    }
    this._renderFocusDetails();
    this._updateScaffoldingData();
    this.canvasHelper.refresh();
  }
  loadSceneURL(url) {
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ShowLoadingScreen = false;
      BABYLON.SceneLoader.Load(gAPPP.storagePrefix, this._url(url), this.engine,
        newScene => {
          this.activate(newScene);
          resolve({
            type: 'scene',
            context: this,
            scene: newScene
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
        }, {
          field: 'sortKey',
          newValue: new Date().getTime()
        }], key));
    });
  }
  updateObjectURL(objectType, key, file) {
    return new Promise((resolve, reject) => {
      if (objectType === 'mesh') {
        let filename = file.name;
        let fireSet = gAPPP.a.modelSets[objectType];
        fireSet.updateBlob(key, file, filename).then(
          r => resolve(r));
      } else if (objectType === 'texture') {
        let filename = file.name;
        let fireSet = gAPPP.a.modelSets[objectType];
        fireSet.updateBlob(key, file, filename).then(
          r => resolve(r));
      } else if (objectType === 'block') {
        let filename = file.name;
        let fireSet = gAPPP.a.modelSets[objectType];
        fireSet.updateBlob(key, file, filename).then(
          r => resolve(r));
      } else if (objectType === 'video') {
        let filename = file.name;
        let fireSet = gAPPP.a.modelSets['block'];
        fireSet.updateBlob(key, file, filename, 'videoURL').then(
          r => resolve(r));
      } else if (objectType === 'audio') {
        let filename = file.name;
        let fireSet = gAPPP.a.modelSets['block'];
        fireSet.updateBlob(key, file, filename, 'audioURL').then(
          r => resolve(r));
      } else
        resolve({});
    });
  }
  _updateScaffoldingData() {
    if (!this.scene)
      return;
    let profile = gAPPP.a.profile;

    if (!this.camera)
      return;

    this._updateCamera();
    this._updateDefaultLight();
    this.showHideGrid(profile.showFloorGrid);
    this.showHideGuides(profile.showSceneGuides);
  }
  _childLightExists() {
    if (!this.activeBlock) {
      return false;
    }

    return this.activeBlock.containsLight();
  }
  _updateDefaultLight() {
    let profile = gAPPP.a.profile;
    this.defaultLight = true;
    if (this._childLightExists()) {
      this.defaultLight = false;
    } else {
      if (!this.light) {
        let l = GLOBALUTIL.getVector(0, 1, 0);
        this.light = new BABYLON.HemisphericLight("defaultSceneBuilderLight", l, this.scene);
        this.light.intensity = .7;
      }
      if (this.cachedProfile.lightIntensity !== profile.lightIntensity) {
        this.cachedProfile.lightIntensity = profile.lightIntensity;
        this.light.intensity = GLOBALUTIL.getNumberOrDefault(profile.lightIntensity, .7);
      }
    }
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
      let filename = URI;
      let path = '';
      if (URI.indexOf(gAPPP.storagePrefix) === -1) {
        let parts = URI.split('/');
        filename = parts[parts.length - 1];
        path = URI.replace(filename, '');
      }
      BABYLON.SceneLoader.ImportMesh('', path, filename, this.scene,
        (newMeshes, particleSystems, skeletons) => resolve(newMeshes),
        progress => {},
        err => resolve(null));
    });
  }
  _renderFocusDetails() {
    if (!gAPPP.a.profile)
      return;

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
    if (this.activeBlock.blockRawData.childType === 'block')
      sceneObject.isVisible = true;
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
    if (this.activeBlock.blockRawData.childType === 'block')
      sceneObject.isVisible = false;
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

    if (!fade)
      return;

    let fadeLevel = this.activeBlock.blockRenderData.visibility;
    if (fade)
      fadeLevel = .5;

    this.__fadeObject(sceneObject, fadeLevel);
  }
  __fadeObject(obj, fadeLevel) {
    if (fadeLevel === '' || fadeLevel === undefined)
      fadeLevel = 1.0;
    if (!obj.isContainerBlock)
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
    this.setGhostBlock('layoutPositions', null);
  }
  _sceneAddDefaultObjects() {
    if (gAPPP.a.profile.canvasColor)
      this.scene.clearColor = GLOBALUTIL.color(gAPPP.a.profile.canvasColor);
    else
      this.scene.clearColor = GLOBALUTIL.color('.35,.2,.6');

    this._sceneDisposeDefaultObjects();
    this._updateCamera();
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
        if (cameraDetails.cameraType === 'FollowCamera') {
          this._renderFollowCamera();
        } else if (cameraDetails.cameraType === 'UniversalCamera') {
          this._renderUniversalCamera();
        } else if (cameraDetails.cameraType === 'ArcRotate') {
          this._renderArcCamera();
        } else if (cameraDetails.cameraType === 'DeviceOrientationCamera') {
          this._renderDeviceOrientationCamera();
        } else if (cameraDetails.cameraType === 'WebVRFreeCamera') {
          this._renderVRFreeCamera();
        } else {
          this._renderDefaultCamera();
        }
      }
    }
  }
  _renderFollowCamera() {
    if (this.camera)
      this.camera.dispose();
    let cameraDetails = this.canvasHelper.cameraDetails[this.blockCameraId];
    let values = cameraDetails.firstFrameValues;
    let cameraOrigin = GLOBALUTIL.getVector(values.cameraOriginX + ',' + values.cameraOriginY + ',' +
      values.cameraOriginZ, 0, 15, -15);
    this.camera = new BABYLON.FollowCamera("FollowCam", cameraOrigin, this.scene);

    let cameraRadius = values.cameraRadius;
    let heightOffset = values.cameraHeightOffset;
    let rotationOffset = values.cameraRotationOffset;
    let cameraAcceleration = values.cameraAcceleration;
    let maxCameraSpeed = values.maxCameraSpeed;

    this.previousCameraRadius = cameraRadius;
    if (cameraRadius)
      this.camera.radius = Number(cameraRadius);
    if (heightOffset)
      this.camera.heightOffset = Number(heightOffset);
    if (rotationOffset)
      this.camera.rotationOffset = Number(rotationOffset);
    if (cameraAcceleration)
      this.camera.cameraAcceleration = Number(cameraAcceleration);
    if (maxCameraSpeed)
      this.camera.maxCameraSpeed = Number(maxCameraSpeed);

    this.rebindCamera();

    let targetBlock = this.dialogForCamera.rootBlock;
    if (!targetBlock)
      return;
    let mesh = targetBlock._findBestTargetObject(cameraDetails.cameraTargetBlock);
    if (!mesh)
      mesh = targetBlock;
    if (mesh)
      this.camera.lockedTarget = mesh.sceneObject;
  }
  _renderUniversalCamera() {
    if (this.camera)
      this.camera.dispose();
    let cameraDetails = this.canvasHelper.cameraDetails[this.blockCameraId];
    let values = cameraDetails.firstFrameValues;
    let cameraOrigin = GLOBALUTIL.getVector(values.cameraOriginX + ',' + values.cameraOriginY + ',' +
      values.cameraOriginZ, 0, 15, -15);
    this.camera = new BABYLON.UniversalCamera("UniversalCamera", cameraOrigin, this.scene);

    let aimTarget = GLOBALUTIL.getVector(values.cameraAimTargetX + ',' + values.cameraAimTargetY + ',' +
      values.cameraAimTargetZ, 0, 0, 0);
    this.camera.setTarget(aimTarget);

    this.rebindCamera();
  }
  _renderDeviceOrientationCamera() {
    if (this.camera)
      this.camera.dispose();
    let cameraDetails = this.canvasHelper.cameraDetails[this.blockCameraId];
    let values = cameraDetails.firstFrameValues;
    let cameraOrigin = GLOBALUTIL.getVector(values.cameraOriginX + ',' + values.cameraOriginY + ',' +
      values.cameraOriginZ, 0, 15, -15);
    this.camera = new BABYLON.DeviceOrientationCamera("DeviceOrientationCamera", cameraOrigin, this.scene);
    this.camera.fov = GLOBALUTIL.getNumberOrDefault(values.cameraFOV, .8);
    let aimTarget = GLOBALUTIL.getVector(values.cameraAimTargetX + ',' + values.cameraAimTargetY + ',' +
      values.cameraAimTargetZ, 0, 0, 0);
    this.camera.setTarget(aimTarget);

    this.rebindCamera();
  }
  _renderVRFreeCamera() {
    if (this.camera)
      this.camera.dispose();
    let cameraDetails = this.canvasHelper.cameraDetails[this.blockCameraId];
    let values = cameraDetails.firstFrameValues;
    let cameraOrigin = GLOBALUTIL.getVector(values.cameraOriginX + ',' + values.cameraOriginY + ',' +
      values.cameraOriginZ, 0, 15, -15);
    this.camera = new BABYLON.WebVRFreeCamera("WebVRFreeCamera", cameraOrigin, this.scene);

    let aimTarget = GLOBALUTIL.getVector(values.cameraAimTargetX + ',' + values.cameraAimTargetY + ',' +
      values.cameraAimTargetZ, 0, 0, 0);
    this.camera.setTarget(aimTarget);

    //this.camera.position = cameraOrigin;
    this.rebindCamera();
  }
  _renderDefaultCamera() {
    if (this.camera)
      this.camera.dispose();
    let cameraVector = this.cameraVector;
    if (!cameraVector)
      cameraVector = GLOBALUTIL.getVector(this.cameraVector, 15, 15, -3);
    let radius = 10;
    let newRadius = Number(this.arcCameraRadius);
    if (newRadius > 0 && newRadius < 500)
      radius = newRadius;

    this.camera = new BABYLON.ArcRotateCamera("defaultSceneBuilderCamera" + (Math.random() * 100).toFixed(), .9, 0.9, radius, new BABYLON.Vector3(0, 0, 0), this.scene);
    this.camera.setPosition(cameraVector);
    this.rebindCamera();
    this.camera.radius = radius;

    this.camera.inputs.attached.mousewheel.wheelPrecision = 50;
  }
  _renderArcCamera() {
    if (this.camera)
      this.camera.dispose();

    let cameraDetails = this.canvasHelper.cameraDetails[this.blockCameraId];
    let values = cameraDetails.firstFrameValues;
    let cameraOrigin = GLOBALUTIL.getVector(values.cameraOriginX + ',' + values.cameraOriginY + ',' +
      values.cameraOriginZ, 0, 15, -15);
    this.camera = new BABYLON.ArcRotateCamera("arcRotateSceneBuilderCamera" + (Math.random() * 100).toFixed(), .9, 0.9,
      values.cameraOriginY, cameraOrigin, this.scene)
    this.rebindCamera();
    if (values.cameraRadius)
      this.camera.radius = Number(values.cameraRadius);

    let aimTarget = GLOBALUTIL.getVector(values.cameraAimTargetX + ',' + values.cameraAimTargetY + ',' +
      values.cameraAimTargetZ, 0, 0, 0);
    this.camera.setTarget(aimTarget);

    //this.camera.setPosition(cameraOrigin);
  }
  selectCamera(blockCameraId, dialogForCamera) {
    if (!this.canvasHelper.cameraDetails[blockCameraId])
      blockCameraId = 'default';
    this.dialogForCamera = dialogForCamera;
    this._updateCamera(blockCameraId);
  }
  logError(str) {
    this.canvasHelper.logError(str);
  }
  logMessage(str) {
    this.canvasHelper.logMessage(str);
  }
  clearError() {
    this.canvasHelper.clearError();
  }
  handleAnimationNotReady() {
    if (this.handleAnimationNotReadyCallback)
      this.handleAnimationNotReadyCallback();
  }
  handleAnimationReady() {
    if (this.handleAnimationReadyCallback)
      return this.handleAnimationReadyCallback();
    if (!this.canvasHelper.cameraShown) {
      this.canvasHelper.rootBlock.updatesDisabled = false;
      this.canvasHelper.rootBlock.setData(null, true);
      this.canvasHelper.show();
    }
  }
}
