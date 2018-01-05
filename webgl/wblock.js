class wBlock {
  constructor(context, parent = null, sceneObject = null) {
    this.blockKey = null;
    this.sceneObject = sceneObject;
    this.childBlocks = {};
    this.context = context;
    this.parent = parent;
    this.staticType = '';
    this.inheritMaterial = true;
    this.blockRenderData = {};
    this.blockRawData = {};
    this.containerDimensions = {};
    this.containerCenter = {
      x: 0,
      y: 0,
      z: 0
    };
    this.containerDirection = {
      x: 1,
      y: 0,
      z: .5
    };
  }
  handleDataUpdate(tag, values, type, fireData) {
    if (this.blockKey === fireData.key)
      this.setData(values);

    if (this.blockRawData.childType === tag)
      if (values.title === this.blockRawData.childName)
        return this.setData();

    let materialList = [];
    if (tag === 'material')
      if (values.title)
        materialList.push(values.title);

    if (tag === 'texture') {
      let allMaterials = gAPPP.a.modelSets['material'].fireDataValuesByKey;

      for (let i in allMaterials) {
        if (allMaterials[i].diffuseTextureName === values.title)
          materialList.push(allMaterials[i].title);
        if (allMaterials[i].emissiveTextureName === values.title)
          materialList.push(allMaterials[i].title);
        if (allMaterials[i].specularTextureName === values.title)
          materialList.push(allMaterials[i].title);
        if (allMaterials[i].ambientTextureName === values.title)
          materialList.push(allMaterials[i].title);
      }
    }

    if (tag === 'material' || tag === 'texture') {
      if (materialList.indexOf(this.blockRenderData.materialName) !== -1)
        return this.setData();
    }

    if (type === 'add' && tag === 'blockchild')
      if (values.parentKey === this.blockKey)
        return this.setData();

    for (let i in this.childBlocks) {
      if (type === 'remove') {
        if (i === fireData.key) {
          this.childBlocks[i].dispose();
          delete this.childBlocks[i];
          break;
        }
        continue;
      }

      if (i === fireData.key) {
        this.childBlocks[i].setData(values);
      }
      this.childBlocks[i].handleDataUpdate(tag, values, type, fireData);
    }
  }
  recursiveGetBlockForKey(key) {
    if (this.blockKey === key)
      return this;
    for (let i in this.childBlocks) {
      if (i === key)
        return this.childBlocks[key];

      let block = this.childBlocks[i].recursiveGetBlockForKey(key);
      if (block !== null)
        return block;
    }
    return null;
  }
  _createShape() {
    this.dispose();
    let name = 'singleShapeObject';

    let options = {};
    let fields = sDataDefinition.bindingFields('shape');
    for (let i in fields) {
      let field = fields[i];
      if (field.shapeOption)
        if (field.displayGroup === this.blockRenderData['shapeType']) {
          if (field.displayType === 'number') {
            if (GLOBALUTIL.isNumeric(this.blockRenderData[field.fireSetField]))
              options[field.shapeOption] = Number(this.blockRenderData[field.fireSetField]);
          } else
            options[field.shapeOption] = this.blockRenderData[field.fireSetField];
        }
    }

    if (this.blockRenderData['shapeType'] === 'sphere')
      return this.sceneObject = BABYLON.MeshBuilder.CreateSphere(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'box')
      return this.sceneObject = BABYLON.MeshBuilder.CreateBox(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'cylinder')
      return this.sceneObject = BABYLON.MeshBuilder.CreateCylinder(name, options, this.context.scene);

    if (this.blockRenderData['shapeType'] === 'text')
      return this.__createTextMesh(name, options);

    this.sceneObject = BABYLON.MeshBuilder.CreateBox(name, options, this.context.scene);
  }
  createGuides(size) {
    this.dispose();

    let wrapper = null;
    let sObjects = [];
    let axisX = BABYLON.Mesh.CreateLines("axisX", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(size, 0, 0),
      new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    ], this.context.scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    wrapper = axisX;

    let xChar = this.__make2DTextMesh("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    xChar.setParent(wrapper);

    let axisY = BABYLON.Mesh.CreateLines("axisY", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
      new BABYLON.Vector3(0, size, 0),
      new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    ], this.context.scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    axisY.setParent(wrapper);

    let yChar = this.__make2DTextMesh("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    yChar.setParent(wrapper);

    let axisZ = BABYLON.Mesh.CreateLines("axisZ", [
      new BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
      new BABYLON.Vector3(0, 0, size),
      new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    ], this.context.scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    axisZ.setParent(wrapper);

    let zChar = this.__make2DTextMesh("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    zChar.setParent(wrapper);

    this.sceneObject = wrapper;
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
    this.sceneObject = grid;
  }
  dispose() {
    if (this.sceneObject)
      this.sceneObject.dispose();
    this.sceneObject = null;
    for (let i in this.childBlocks)
      this.childBlocks[i].dispose();
    this.childBlocks = {};
  }
  loadMesh() {
    return new Promise((resolve, reject) => {
      let path = gAPPP.storagePrefix;
      let filename = this.context._url(this.blockRenderData['url']);
      BABYLON.SceneLoader.ImportMesh('', path, filename, this.context.scene,
        (newMeshes, particleSystems, skeletons) => {
          this.dispose();
          this.sceneObject = newMeshes[0];
          resolve();
        },
        progress => {},
        (scene, msg, err) => {
          console.log('wBlock.loadMesh', msg, err);
          reject({
            error: true,
            message: msg,
            errorObject: err,
            scene: scene
          });
        });
    });
  }
  __setpreviewshape(values) {
    let shape = values['previewShape'];
    if (!shape)
      shape = 'box';
    this.blockRenderData = {
      shapeType: shape,
      cylinderDiameter: 5,
      cylinderHeight: 5,
      sphereDiameter: 10,
      boxSize: 5,
      textText: 'Preview',
      textDepth: 2,
      textSize: 30
    };
  }
  setData(values = null) {
    if (this.context !== gAPPP.activeContext)
      return;

    if (this.staticType === 'texture') {
      this.__setpreviewshape(values);
      this._createShape();
      let m = new BABYLON.StandardMaterial('texturepopupmaterial');
      m.diffuseTexture = this.__texture(values);
      this.context.__setMaterialOnObj(this.sceneObject, m);
      return;
    }
    if (this.staticType === 'material') {
      this.__setpreviewshape(values);
      this._createShape();
      this.context.__setMaterialOnObj(this.sceneObject, this.__material(values));
      return;
    }

    if (values)
      this.blockRawData = values;
    if (this.staticLoad) {
      this.blockRenderData = this.blockRawData;
      this.blockRenderData.childType = this.staticType;
      this._renderBlock();
    } else
      this._loadBlock();

    this.context.refreshFocus();
  }
  _loadBlock() {
    let children = {};
    if (gAPPP.a.modelSets[this.blockRawData.childType])
      children = gAPPP.a.modelSets[this.blockRawData.childType].queryCache('title', this.blockRawData.childName);

    let keys = Object.keys(children);
    if (keys.length === 0) {
      //  console.log('_loadBlock:: fetchList 0 results', this);
      return;
    }
    if (keys.length > 1) {
      //console.log('_loadBlock:: fetchList > 1 results', this);
    }
    this.blockRenderData = children[keys[0]];
    if (this.blockRawData.childType === 'mesh')
      this.loadMesh().then(r => {
        this._renderBlock();
        this.context.refreshFocus();
      });
    else
      this._renderBlock();
  }
  _renderBlock() {
    if (this.blockRawData.childType === 'mesh')
      this.__renderMeshBlock();
    if (this.blockRawData.childType === 'shape')
      this.__renderShapeBlock();
    if (this.blockRawData.childType === 'block')
      this.__renderContainerBlock();

    if (this.parent)
      this.sceneObject.parent = this.parent.sceneObject;
  }
  __renderMeshBlock() {
    let fields = sDataDefinition.bindingFields('mesh');
    for (let i in fields) {
      let field = fields[i];
      let value = this.blockRenderData[field.fireSetField];

      if (field.contextObjectField)
        if (this.sceneObject)
          this.__updateObjectValue(field, value, this.sceneObject);
    }
  }
  __renderShapeBlock() {
    this.dispose();
    let newShape = this._createShape();
    if (!this.sceneObject)
      return;

    let fields = sDataDefinition.bindingFields('shape');
    for (let i in fields) {
      let field = fields[i];
      let value = this.blockRenderData[field.fireSetField];

      if (field.contextObjectField)
        this.__updateObjectValue(field, value, this.sceneObject);
    }
  }
  __renderContainerBlock() {
    if (!this.blockKey)
      return;

    let oldContainerMesh = null;
    let width = this.blockRenderData['width'];
    let height = this.blockRenderData['height'];
    let depth = this.blockRenderData['depth'];

    if (this.containerDimensions.width !== width ||
      this.containerDimensions.height !== height ||
      this.containerDimensions.depth !== depth
    ) {
      oldContainerMesh = this.sceneObject;
      this.sceneObject = BABYLON.MeshBuilder.CreateBox(this.blockKey, { width, height, depth}, this.context.scene);
      let material = new BABYLON.StandardMaterial(this.blockKey + 'material', this.context.scene);
      material.alpha = 0;
      this.sceneObject.material = material;

      this.containerDimensions.width = width;
      this.containerDimensions.height = height;
      this.containerDimensions.depth = depth;
    }

    let children = gAPPP.a.modelSets['blockchild'].queryCache('parentKey', this.blockKey);
    for (let i in children)
      this.__updateChild(i, children[i]);

    if (oldContainerMesh !== null)
      oldContainerMesh.dispose();
  }
  __updateChild(key, data) {
    if (!this.childBlocks[key])
      this.childBlocks[key] = new wBlock(this.context, this);

    this.childBlocks[key].setData(data);
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

    this.sceneObject = textWrapperMesh;
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
      if (value === '') return;
      if (value === undefined) return;
      if (field.type === undefined) return GLOBALUTIL.path(object, field.contextObjectField, value);

      if (field.type === 'visibility') return this.context.__fadeObject(object, value);

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
        if (this.parent)
          if (this.blockRawData.inheritMaterial)
            value = this.parent.blockRawData.materialName;

        let tD = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', value);
        let m;
        if (!tD)
          m = new BABYLON.StandardMaterial('material');
        else
          m = this.__material(tD);
        this.context.__setMaterialOnObj(object, m);
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
  getBlockDimDesc() {
    let width = 1;
    if (GLOBALUTIL.isNumeric(this.blockRawData.width))
      width = Math.round(Number(this.blockRawData.width));
    let height = 1;
    if (GLOBALUTIL.isNumeric(this.blockRawData.height))
      height = Math.round(Number(this.blockRawData.height));
    let depth = 1;
    if (GLOBALUTIL.isNumeric(this.blockRawData.depth))
      depth = Math.round(Number(this.blockRawData.depth));

    return width + ' x ' + depth + ' x ' + height;
  }
}
