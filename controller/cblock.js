class cBlock {
  constructor(context, parent = null, sceneObject = null) {
    this.blockType = 'sceneObject';
    this.sceneObject = sceneObject;
    this.childBlocks = [];
    this.context = context;
    this.parent = parent;
    this.displayType = 'mesh';
    this.inheritMaterial = true;
    this.data = {};
  }
  createShape(valueCache) {
    this.dispose();
    let name = 'singleShapeObject';

    let options = {};
    let fields = sDataDefinition.bindingFields('shape');
    for (let i in fields) {
      let field = fields[i];
      if (field.shapeOption)
        if (field.displayGroup === valueCache['shapeType']) {
          if (field.displayType === 'number') {
            if (GLOBALUTIL.isNumeric(valueCache[field.fireSetField]))
              options[field.shapeOption] = Number(valueCache[field.fireSetField]);
          } else
            options[field.shapeOption] = valueCache[field.fireSetField];
        }
    }

    if (valueCache['shapeType'] === 'sphere')
      return this.sceneObject = BABYLON.MeshBuilder.CreateSphere(name, options, this.context.scene);

    if (valueCache['shapeType'] === 'box')
      return this.sceneObject = BABYLON.MeshBuilder.CreateBox(name, options, this.context.scene);

    if (valueCache['shapeType'] === 'cylinder')
      return this.sceneObject = BABYLON.MeshBuilder.CreateCylinder(name, options, this.context.scene);

    if (valueCache['shapeType'] === 'text')
      return this.__createTextMesh(name, options);

    this.shapeObject = BABYLON.MeshBuilder.CreateBox(name, options, this.context.scene);
  }
  createGuides(size) {
    this.dispose();
    let sObjects = [];
    let axisX = BABYLON.Mesh.CreateLines("axisX", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    ], this.context.scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    this._pushObj(axisX, false);

    let xChar = this.__make2DTextMesh("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    this._pushObj(xChar, false);

    let axisY = BABYLON.Mesh.CreateLines("axisY", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    ], this.context.scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    this._pushObj(axisY, false);

    let yChar = this.__make2DTextMesh("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    this._pushObj(yChar, false);

    let axisZ = BABYLON.Mesh.CreateLines("axisZ", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    ], this.context.scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    this._pushObj(axisZ, false);

    let zChar = this.__make2DTextMesh("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    this._pushObj(zChar, false);
  }
  createGrid(gridDepth) {
    this.dispose();
    let grid = BABYLON.Mesh.CreateGround("ground1", gridDepth, gridDepth, 2, this.context.scene);
    let material = new BABYLON.StandardMaterial('scenematerialforfloorgrid', this.context.scene);
    let texture = new BABYLON.Texture('greengrid.png', this.context.scene);
    texture.hasAlpha = true;
    material.diffuseTexture = texture;
    texture.vScale = gridDepth;
    texture.uScale = gridDepth;
    grid.material = material;
    this._pushObj(grid, false);
  }
  dispose() {
    if (!this.context.sceneObject)
      this.context.sceneObject.dispose();
    this.context.sceneObject = null;
    for (let i in this.childBlocks)
      this.childBlocks[i].dispose();
    this.blockType = 'sceneObject';
    this.displayType = 'mesh';
  }
  loadMesh() {
    return new Promise((resolve, reject) => {
      let path = gAPPP.storagePrefix;
      let filename = this.context._url(this.data['url']);
      BABYLON.SceneLoader.ImportMesh('', path, filename, this.context.scene,
        (newMeshes, particleSystems, skeletons) => {
          if (this.sceneObject)
            this.sceneObject.dispose();
          this.sceneObject = newMeshes[0];
          resolve();
        },
        progress => {},
        (scene, msg, err) => {
          console.log('cBlock.loadMesh', msg, err);
          reject({
            error: true,
            message: msg,
            errorObject: err,
            scene: scene
          });
        });
    });
  }
  setData(valueCache) {
    this.data = valueCache;
    if (this.context !== gAPPP.activeContext)
      return;

    if (this.displayType === 'texture')
      this.context.sceneObject.material.diffuseTexture = this.__texture(valueCache);

    if (this.displayType === 'material')
      this.context.sceneObject.material = this.__material(valueCache);

    if (this.displayType === 'mesh')
      this._setObj(valueCache);

    if (this.displayType === 'shape')
      this._setShape(valueCache);

    if (this.displayType === 'sceneTools')
      this.setSceneToolsDetails(valueCache);

    this.context.refreshFocus();
  }
  _pushObj(obj, inheritMaterial = true) {
    let child = new cBlock(this.context, this);
    child.sceneObject = obj;
    child.inheritMaterial = inheritMaterial;
    this.childBlocks.push(child);
    return child;
  }
  _setObj(values) {
    let fields = sDataDefinition.bindingFields('mesh');
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.contextObjectField)
        if (this.sceneObject)
          this.__updateObjectValue(field, value, this.sceneObject);
    }
  }
  _setShape(contextObject, values) {
    this.dispose();
    let newShape = this._createSceneObject(values);
    if (!newShape) {
      return;
    }
    this.context.sceneObject = newShape;

    let fields = sDataDefinition.bindingFields('shape');
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.contextObjectField)
        this.__updateObjectValue(field, value, this.context.sceneObject);
    }
  }
  __createTextMesh(name, options) {
    this.dispose();
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
      var polyBuilder = new BABYLON.PolygonMeshBuilder("pBuilder" + i, conners, this.context.scene);

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

    if (textWrapperMesh) {
      textWrapperMesh.position.x = -lenY / 2 + x;
      textWrapperMesh.position.y = lenX / 2 + y;
      textWrapperMesh.position.z = z;

      textWrapperMesh.rotation.y = Math.PI / 2;
      textWrapperMesh.rotation.z = -Math.PI / 2;
      textWrapperMesh.lenX = lenX;
      textWrapperMesh.lenY = lenY;
      this.sceneObject = textWrapperMesh;
    }
  }
  __make2DTextMesh(text, color, size) {
    let dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, this.context.scene, true);
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
    let plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, this.context.scene, true);
    plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this.context.scene);
    plane.material.backFaceCulling = false;
    plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    plane.material.diffuseTexture = dynamicTexture;
    return plane;
  }
  __material(values) {
    let material = new BABYLON.StandardMaterial('material', this.context.scene);
    let fields = sDataDefinition.bindingFields('material');
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.contextObjectField)
        this.__updateObjectValue(field, value, material);
    }
    return material;
  }
  __updateObjectValue(field, value, object) {
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

        let t = this.__texture(tD);
        return GLOBALUTIL.path(object, field.contextObjectField, t);
      }

      if (field.type === 'material') {
        let tD = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', value);
        if (!tD) {
          let m = new BABYLON.StandardMaterial('material');
          object.material = m;
          return;
        }

        let m = this.__material(tD);
        object.material = m;
        for (let i in this.context.scene.meshes) {
          if (this.context.scene.meshes[i].parent === object)
            this.context.scene.meshes[i].material = m;
        }
        return;
      }

      //default
      GLOBALUTIL.path(object, field.contextObjectField, value);
    } catch (e) {
      console.log('set ui object error', e, field, object, value);
    }
  }
  __texture(values) {
    let texture = new BABYLON.Texture(values['url'], this.context.scene);

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
}
