class cContext {
  constructor(canvas, initEngine) {
    this.gridShown = false;
    this.gridObject = null;
    this.guidesSceneObjects = [];
    this.light = null;
    this.camera = null;
    this._scene = null;
    this.activeContextObject = null;
    this.canvas = canvas;
    this.engine = null;
    this.sceneTools = new cSceneToolsBand(this);

    this.importedMeshes = [];
    this.importedMeshClones = [];
    this.helperPanels = null;

    if (initEngine) {
      this.engine = new BABYLON.Engine(this.canvas, false, {
        preserveDrawingBuffer: true
      });
      this.engine.enableOfflineSupport = false;
    }
  }
  set scene(newScene) {
    if (gAPPP.activeContext)
      gAPPP.activeContext.engine.stopRenderLoop();

    if (this._scene)
      this._scene.dispose();

    this.gridObject = null;
    this.gridShown = false;
    this.guidesSceneObjects = [];
    this.guidesShown = false;
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
      if (scene === null)
        this.scene = new BABYLON.Scene(this.engine);
      else if (scene !== undefined)
        this.scene = scene;

      this._sceneAddDefaultObjects();
      this.guidesSceneObjects = {};
      this.gridObject = null;
    }

    this.scene.clearColor = GLOBALUTIL.color(gAPPP.a.profile.canvasColor);
    this.camera.attachControl(this.canvas, false);
    this.sceneTools.activate();
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

            objectData.simpleUIDetails.scaleX = newMesh.scaling.x;
            objectData.simpleUIDetails.scaleY = newMesh.scaling.y;
            objectData.simpleUIDetails.scaleZ = newMesh.scaling.z;

            objectData.simpleUIDetails.positionX = newMesh.position.x;
            objectData.simpleUIDetails.positionY = newMesh.position.y;
            objectData.simpleUIDetails.positionZ = newMesh.position.z;

            objectData.simpleUIDetails.rotateX = newMesh.rotation.x;
            objectData.simpleUIDetails.rotateY = newMesh.rotation.y;
            objectData.simpleUIDetails.rotateZ = newMesh.rotation.z;

            fireSet.createWithBlobString(objectData, sceneJSON, filename).then(
              r => resolve(r));
          });
      }
    });
  }
  deactivate() {
    this.sceneTools.deactivate();
    if (gAPPP.activeContext)
      gAPPP.activeContext.engine.stopRenderLoop();
  }
  loadScene(sceneType, values) {
    if (sceneType === 'shape')
      return this._loadSceneShape(values);
    if (sceneType === 'mesh')
      return this._loadSceneMesh(values);
    if (sceneType === 'scene')
      return this.loadSceneURL(values['url']);
    if (sceneType === 'material')
      return this._loadSceneMaterial(values);
    if (sceneType === 'texture')
      return this._loadSceneTexture(values);

    return new Promise((resolve) => resolve(null));
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
  setSceneToolsDetails(valueCache) {
    let fields = sDataDefinition.bindingFields('sceneToolsBar');
    for (let i in fields) {
      let field = fields[i];
      let value = valueCache[field.fireSetField];

      if (field.fireSetField === 'lightIntensity') {
        this.light.intensity = Number(value);
      }
      if (field.fireSetField === 'lightVector') {
        this.light.direction = GLOBALUTIL.getVector(value, 0, 1, 0);
      }
      if (field.fireSetField === 'cameraVector') {
        this.camera.position = GLOBALUTIL.getVector(value, 3, 15, -25);
      }
      if (field.fireSetField === 'showFloorGrid') {
        this._showGrid(!value);
      }
      if (field.fireSetField === 'showSceneGuides') {
        this._showGuides(!value);
      }
      // field.fireSetField === 'gridAndGuidesDepth'
    }
    this._refreshActiveObjectInfo();
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
            this.activeContextObject = newMesh;
            fireSet.updateBlobString(key, sceneJSON, filename).then(
              r => resolve(r));
          });
      } else
        resolve({});
    });
  }
  setSceneObject(contextObject, valueCache) {
    if (this !== gAPPP.activeContext)
      return;
    let objectType = contextObject.type;
    if (objectType === 'texture')
      contextObject.sceneObject.material.diffuseTexture = this._texture(valueCache);

    if (objectType === 'material')
      contextObject.sceneObject.material = this._material(valueCache);

    if (objectType === 'mesh')
      this._setMesh(contextObject, valueCache);

    if (objectType === 'shape')
      this._setShape(contextObject, valueCache);

    if (objectType === 'sceneTools')
      this.setSceneToolsDetails(valueCache);

    this._refreshActiveObjectInfo();
  }
  updateSceneObjects() {
    this.scene.clearColor = GLOBALUTIL.color(gAPPP.a.profile.canvasColor);

    if (!this.camera)
      return;

    let li = gAPPP.a.profile.lightIntensity;
    if (li !== undefined)
      if (li !== '')
        this.light.intensity = li;
    let cameraVector = GLOBALUTIL.getVector(gAPPP.a.profile.cameraVector, 0, 10, -10);
    this.camera.position = cameraVector;

    this._refreshActiveObjectInfo();
  }
  setContextActiveObject(contextObject) {
    this._clearActiveContextObject();
    this.activeContextObject = contextObject;

    this._refreshActiveObjectInfo();
  }
  _addOriginalAndClone(originalMesh) {
    this.importedMeshes.push(originalMesh);
    let newMesh = originalMesh.clone(originalMesh);

  }
  _addSphere(name, faces, diameter) {
    let s = BABYLON.Mesh.CreateSphere(name, faces, diameter, this.scene, false);
    s.position.y = diameter / 2.0;
    return s;
  }
  _clearActiveContextObject() {
    if (this.activeContextObject) {
      this.activeContextObject.sceneObject.showBoundingBox = false;
      this.activeContextObject = null;
    }
  }
  _createSceneObject(objectData) {
    let name = 'singleSceneObject';
    let sceneObject = null;

    let options = {};
    let fields = sDataDefinition.bindingFields('shape');
    for (let i in fields) {
      let field = fields[i];
      if (field.shapeOption)
        if (field.displayGroup === objectData['shapeType']) {
          if (field.displayType === 'number') {
            if (GLOBALUTIL.isNumeric(objectData[field.fireSetField]))
              options[field.shapeOption] = Number(objectData[field.fireSetField]);
          } else
            options[field.shapeOption] = objectData[field.fireSetField];
        }
    }

    if (objectData['shapeType'] === 'sphere')
      sceneObject = BABYLON.MeshBuilder.CreateSphere(name, options, this.scene);

    if (objectData['shapeType'] === 'box')
      sceneObject = BABYLON.MeshBuilder.CreateBox(name, options, this.scene);

    if (objectData['shapeType'] === 'cylinder')
      sceneObject = BABYLON.MeshBuilder.CreateCylinder(name, options, this.scene);

    if (objectData['shapeType'] === 'text')
      sceneObject = this._createTextMesh(name, options);

    if (!sceneObject)
      sceneObject = BABYLON.MeshBuilder.CreateBox(name, options, this.scene);

    return sceneObject;
  }
  _formatNumber(num) {
    let leftSide = 3;
    let rightSide = 3;
    if (!GLOBALUTIL.isNumeric(num))
      num = 0;
    let str = num.toFixed(rightSide);
    let parts = str.split('.');
    let left = parts[0];
    let right = parts[1];
    let leftFinal = left.padStart(leftSide, ' ');
    let rightFinal = right.padEnd(rightSide, ' ');
    return leftFinal + '.' + rightFinal;
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
  _loadSceneMesh(objectData) {
    return new Promise((resolve, reject) => {
      let path = gAPPP.storagePrefix;
      let filename = this._url(objectData['url']);
      let meshCount = this.scene.meshes.length;
      BABYLON.SceneLoader.ImportMesh('', path, filename, this.scene,
        (newMeshes, particleSystems, skeletons) => {
          resolve({
            type: 'mesh',
            sceneObject: newMeshes[0],
            context: this
          });
        },
        progress => {},
        (scene, msg, err) => {
          console.log('_loadSceneMesh', msg, err);
          reject({
            error: true,
            message: msg,
            errorObject: err
          });
        });
    });
  }
  _loadSceneMaterial(materialData) {
    return new Promise((resolve, reject) => {
      let s = this._addSphere('sphere1', 15, 5);
      let material = new BABYLON.StandardMaterial('material', this.scene);
      s.material = material;
      resolve({
        type: 'material',
        sceneObject: s,
        material,
        context: this
      });
    });
  }
  _loadSceneShape(objectData) {
    return new Promise((resolve, reject) => {
      let contextObject = {
        type: 'shape',
        context: this
      };

      let contextSceneObject = this._createSceneObject(objectData);
      contextObject.sceneObject = contextSceneObject;
      resolve(contextObject);
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

    let fields = sDataDefinition.bindingFields('material');
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.contextObjectField)
        this._updateObjectValue(field, value, material);
    }
    return material;
  }
  _refreshActiveObjectInfo(timeoutCall) {
    if (!this.activeContextObject)
      return;

    if (!timeoutCall) //do this twice - once after it renders a frame
      setTimeout(() => this._refreshActiveObjectInfo(true), 100);

    if (gAPPP.a.profile.hideBoundsBox)
      this.activeContextObject.sceneObject.showBoundingBox = false;
    else
      this.activeContextObject.sceneObject.showBoundingBox = true;
    if (gAPPP.a.profile.showMeshDetails)
      this.sceneTools.meshDetailsLabel.style.display = 'inline-block';
    else
      this.sceneTools.meshDetailsLabel.style.display = 'none';

    let boundingBox = this.activeContextObject.sceneObject.getBoundingInfo().boundingBox;
    let originalDimensions = {
      center: boundingBox.center,
      size: boundingBox.extendSize,
      minimum: boundingBox.minimum,
      maximum: boundingBox.maximum
    };
    let worldDimensions = {
      center: boundingBox.centerWorld,
      size: boundingBox.extendSizeWorld,
      minimum: boundingBox.minimumWorld,
      maximum: boundingBox.maximumWorld
    };
    this.sceneTools.meshDetailsLabel.innerHTML = JSON.stringify(boundingBox, null, 2);

    if (this.helperPanels['scale']) {
      let hp = this.helperPanels['scale'];

      let html = `Original w${this._formatNumber(originalDimensions.size.x)} h${this._formatNumber(originalDimensions.size.y)} d${this._formatNumber(originalDimensions.size.z)}`;
      html += `\nScale    w${this._formatNumber(worldDimensions.size.x)} h${this._formatNumber(worldDimensions.size.y)} d${this._formatNumber(worldDimensions.size.z)}`;

      hp.helperDom.innerHTML = html;
    }

    if (this.helperPanels['offset']) {
      let hp = this.helperPanels['offset'];

      let html = `Original x-min ${this._formatNumber(originalDimensions.minimum.x)} x-max ${this._formatNumber(originalDimensions.maximum.x)}`;
      html += `\n         floor ${this._formatNumber(originalDimensions.minimum.y)} ceil  ${this._formatNumber(originalDimensions.maximum.y)}`;
      html += `\n         z-min ${this._formatNumber(originalDimensions.minimum.z)} z-max ${this._formatNumber(originalDimensions.maximum.z)}`;

      html += `\nOffset   x-max ${this._formatNumber(worldDimensions.minimum.x)} x-max ${this._formatNumber(worldDimensions.maximum.x)}`;
      html += `\n         floor ${this._formatNumber(worldDimensions.minimum.z)} ceil  ${this._formatNumber(worldDimensions.maximum.y)}`;
      html += `\n         z-min ${this._formatNumber(worldDimensions.minimum.z)} z-max ${this._formatNumber(worldDimensions.maximum.z)}`;

      hp.helperDom.innerHTML = html;
    }
  }
  _sceneDisposeDefaultObjects(leaveCameraAndLight) {
    if (!leaveCameraAndLight) {
      if (this.camera)
        this.camera.dispose();
      this.camera = null;

      if (this.light)
        this.light.dispose();
      this.light = null;
    }
    this._showGuides(true);
    this._showGrid(true);
  }
  _sceneAddDefaultObjects() {
    this.scene.clearColor = GLOBALUTIL.color('.7,.7,.7');
    this._sceneDisposeDefaultObjects();
    let cameraVector = GLOBALUTIL.getVector(gAPPP.a.profile.cameraVector, 0, 10, -10);

    this.camera = new BABYLON.FreeCamera("defaultSceneBuilderCamera", cameraVector, this.scene);
    this.camera.setTarget(BABYLON.Vector3.Zero());

    let lightVector = GLOBALUTIL.getVector(gAPPP.a.profile.lightVector, 0, 1, 0);
    this.light = new BABYLON.HemisphericLight("defaultSceneBuilderLight", lightVector, this.scene);
    this.light.intensity = .7;

    this.updateSceneObjects();
  }
  _serializeScene() {
    return JSON.stringify(BABYLON.SceneSerializer.Serialize(this.scene));
  }
  _setMesh(contextObject, values) {
    if (!contextObject.sceneObject)
      return;
    let fields = sDataDefinition.bindingFields('mesh');
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.contextObjectField)
        this._updateObjectValue(field, value, contextObject.sceneObject);
    }
  }
  _setShape(contextObject, values) {
    if (contextObject.sceneObject) {
      contextObject.sceneObject.dispose();
      contextObject.sceneObject = null;
    }

    let newShape = this._createSceneObject(values);
    if (!newShape) {
      contextObject.sceneObject = null;
      return;
    }
    contextObject.sceneObject = newShape;

    let fields = sDataDefinition.bindingFields('shape');
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.contextObjectField)
        this._updateObjectValue(field, value, contextObject.sceneObject);
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
    if (!hide) {
      if (this.gridShown) {
        this._showGrid(true);
      }

      this.gridShown = true;
      let gridDepth = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile['gridAndGuidesDepth'], 5);
      let grid = BABYLON.Mesh.CreateGround("ground1", gridDepth, gridDepth, 2, this.scene);
      let material = new BABYLON.StandardMaterial('scenematerialforfloorgrid', this.scene);
      let texture = new BABYLON.Texture('greengrid.png', this.scene);
      texture.hasAlpha = true;
      material.diffuseTexture = texture;
      texture.vScale = gridDepth;
      texture.uScale = gridDepth;
      grid.material = material;
      this.gridObject = grid;
    } else {
      if (!this.gridShown)
        return;
      this.gridShown = false;
      if (this.gridObject)
        this.gridObject.dispose();
      this.gridObject = null;
    }
  }
  _showGuides(hide) {
    if (!hide) {
      if (this.guidesShown) {
        this._showGuides(true);
      }
      let gridDepth = GLOBALUTIL.getNumberOrDefault(gAPPP.a.profile['gridAndGuidesDepth'], 5);
      this.guidesSceneObjects = this._showAxis(gridDepth, this.scene);

      this.guidesShown = true;
    } else {
      if (!this.guidesShown)
        return;
      this.guidesShown = false;
      for (let i in this.guidesSceneObjects)
        this.guidesSceneObjects[i].dispose();
      this.guidesSceneObjects = [];
    }
  }
  _texture(values) {
    let texture = new BABYLON.Texture(values['url'], this.scene);

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
  _updateObjectValue(field, value, object) {
    try {
      if (value === '')
        return;
      if (value === undefined)
        return;
      if (field.type === undefined)
        return GLOBALUTIL.path(object, field.contextObjectField, value);

      if (field.type === 'color') {
        let parts = value.split(',');
        let cA = [];
        let color = new BABYLON.Color3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
        return GLOBALUTIL.path(object, field.contextObjectField, color);
      }

      if (field.type === 'texture') {
        let tD = gAPPP.a.modelSets['texture'].getValuesByFieldLookup('title', value);
        if (tD === undefined)
          return;

        let t = this._texture(tD);
        return GLOBALUTIL.path(object, field.contextObjectField, t);
      }

      if (field.type === 'material') {
        let tD = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', value);
        if (!tD) {
          let m = new BABYLON.StandardMaterial('material');
          object.material = m;
          return;
        }

        let m = this._material(tD);
        object.material = m;
        for (let i in this.scene.meshes) {
          if (this.scene.meshes[i].parent === object)
            this.scene.meshes[i].material = m;
        }
        return;
      }

      //default
      GLOBALUTIL.path(object, field.contextObjectField, value);
    } catch (e) {
      console.log('set ui object error', e, field, object, value);
    }
  }
  _url(fireUrl) {
    return fireUrl.replace(gAPPP.storagePrefix, '');
  }
  _createTextMesh(name, options) {
    let canvas = document.getElementById("highresolutionhiddencanvas");
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

    let vectorData = vectorizeText(options['text'], renderCanvas, context2D, vectorOptions);
    let x = 0;
    let y = 0;
    let z = 0;
    let thick = 10;
    if (options['depth'])
      thick = Number(options['depth']);
    let scale = size / 10;
    let lenX = 0;
    let lenY = 0;
    let textWrapperMesh = null;
    for (var i = 0; i < vectorData.length; i++) {
      var letter = vectorData[i];
      var conners = [];
      for (var k = 0; k < letter[0].length; k++) {
        conners[k] = new BABYLON.Vector2(scale * letter[0][k][1], scale * letter[0][k][0]);
        if (lenX < conners[k].x) lenX = conners[k].x;
        if (lenY < conners[k].y) lenY = conners[k].y;
      }
      var polyBuilder = new BABYLON.PolygonMeshBuilder("pBuilder" + i, conners, this.scene);

      for (var j = 1; j < letter.length; j++) {
        var hole = [];
        for (var k = 0; k < letter[j].length; k++) {
          hole[k] = new BABYLON.Vector2(scale * letter[j][k][1], scale * letter[j][k][0]);
        }
        hole.reverse();
        polyBuilder.addHole(hole);
      }
      var polygon = polyBuilder.build(false, thick);
      polygon.receiveShadows = true;

      if (textWrapperMesh)
        polygon.setParent(textWrapperMesh);
      else
        textWrapperMesh = polygon;
    }

    if (lenY === 0)
      lenY = 0.001;
    if (lenX === 0)
      lenX = 0.001;

    if (textWrapperMesh === null)
      return null;

    textWrapperMesh.position.x = -lenY / 2 + x;
    textWrapperMesh.position.y = lenX / 2 + y;
    textWrapperMesh.position.z = z;

    textWrapperMesh.rotation.y = Math.PI / 2;
    textWrapperMesh.rotation.z = -Math.PI / 2;
    textWrapperMesh.lenX = lenX;
    textWrapperMesh.lenY = lenY;

    return textWrapperMesh;
  }
}
