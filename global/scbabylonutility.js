class scBabylonUtility {
  constructor() {}

  setMesh(values, mesh) {
    let fields = gAPPP.s.bindingFields['mesh'];
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.fireSetField === 'name')
        continue;
      if (field.uiObjectField)
        this.updateObjectValue(field, value, mesh);
    }
  }
  material(values, scene) {
    let material = new BABYLON.StandardMaterial('material', scene);

    let fields = gAPPP.s.bindingFields['material'];
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.uiObjectField)
        this.updateObjectValue(field, value, material);
    }
    return material;
  }
  texture(values) {
    let texture = new BABYLON.Texture(values['url']);
    function isNumeric(v) {
      return !isNaN(parseFloat(Number(v))) && isFinite(Number(v));
    }
    if (isNumeric(values['vScale']))
      texture.vScale = Number(values['vScale']);
    if (isNumeric(values['uScale']))
      texture.uScale = Number(values['uScale']);
    if (isNumeric(values['vOffset']))
      texture.vOffset = Number(values['vOffset']);
    if (isNumeric(values['uOffset']))
      texture.uOffset = Number(values['uOffset']);

    texture.hasAlpha = values['hasAlpha'];
    return texture;
  }
  updateObjectValue(field, value, object) {
    try {
      if (value === '')
        return;
      if (value === undefined)
        return;
      if (field.type === undefined)
        return gAPPP.u.path(object, field.uiObjectField, value);

      if (field.type === 'color') {
        let parts = value.split(',');
        let cA = [];
        let color = new BABYLON.Color3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
        return gAPPP.u.path(object, field.uiObjectField, color);
      }

      if (field.type === 'texture') {
        let tD = gAPPP.a.modelSets.textures.fireDataValuesByTitle[value];
        if (tD === undefined)
          return;

        let t = this.texture(tD);
        return gAPPP.u.path(object, field.uiObjectField, t);
      }

      if (field.type === 'material') {
        let tD = gAPPP.a.modelSets.materials.fireDataValuesByTitle[value];
        if (tD === undefined)
          return;

        let m = this.material(tD);
        object.material = m;
        return;
      }

      //default
      gAPPP.u.path(object, field.uiObjectField, value);
    } catch (e) {
      console.log('set ui object error', e, field, object, value);
    }
  }
  updateUI(uiObject, valueCache) {
    if (!uiObject)
      return;

    if (uiObject.type === 'texture') {
      uiObject.material.diffuseTexture = this.texture(valueCache);
      return;
    }
    if (uiObject.type === 'material') {
      uiObject.mesh.material = this.material(valueCache, uiObject.scene);
      return;
    }
    if (uiObject.type === 'mesh')
      return this.setMesh(valueCache, uiObject.mesh);
  }

  getNewSceneSerialized() {
    let me = this;
    let file = this.fileDom.files[0];

    if (file) {
      return new Promise((resolve, reject) => {
        gAPPP.u.fileToURI(file)
          .then((sceneSerial) => resolve(sceneSerial));
      });
    } else {
      return new Promise((resolve, reject) => {
        let s = me.createDefaultScene().scene;
        let sS = BABYLON.SceneSerializer.Serialize(s);
        resolve(JSON.stringify(sS));
      });
    }
  }
  createDefaultScene() {
    let scene = new BABYLON.Scene(gAPPP.renderEngine.engine);
    scene.clearColor = gAPPP.renderEngine.color(gAPPP.a.profile.canvasColor);
    let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 10, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .7;
    return { light,
      camera,
      scene
    };
  }
  addSphere(name, faces, diameter, scene) {
    let s = BABYLON.Mesh.CreateSphere(name, faces, diameter, scene);
    s.position.y = diameter / 2.0;
    return s;
  }
  addGround(name, width, depth, subdivs, scene) {
    let ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
    return ground;
  }
}
