class sBabylonUtility {
  static setMesh(values, mesh) {
    let fields = sStatic.bindingFields['mesh'];
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.fireSetField === 'name')
        continue;
      if (field.uiObjectField)
        this.updateObjectValue(field, value, mesh);
    }
  }
  static material(values, scene) {
    let material = new BABYLON.StandardMaterial('material', scene);

    let fields = sStatic.bindingFields['material'];
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.uiObjectField)
        this.updateObjectValue(field, value, material);
    }
    return material;
  }
  static texture(values) {
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
  static updateObjectValue(field, value, object) {
    try {
      if (value === '')
        return;
      if (value === undefined)
        return;
      if (field.type === undefined)
        return sUtility.path(object, field.uiObjectField, value);

      if (field.type === 'color') {
        let parts = value.split(',');
        let cA = [];
        let color = new BABYLON.Color3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
        return sUtility.path(object, field.uiObjectField, color);
      }

      if (field.type === 'texture') {
        let tD = gAPPP.a.modelSets['texture'].fireDataValuesByTitle[value];
        if (tD === undefined)
          return;

        let t = this.texture(tD);
        return sUtility.path(object, field.uiObjectField, t);
      }

      if (field.type === 'material') {
        let tD = gAPPP.a.modelSets['material'].fireDataValuesByTitle[value];
        if (tD === undefined) {
          let m = new BABYLON.StandardMaterial('material', gAPPP.renderEngine.sceneDetails.scene);
          object.material = m;
          return;
        }

        let m = this.material(tD);
        object.material = m;
        return;
      }

      //default
      sUtility.path(object, field.uiObjectField, value);
    } catch (e) {
      console.log('set ui object error', e, field, object, value);
    }
  }
  static updateUI(uiObject, valueCache) {
    if (!uiObject)
      return;

    if (uiObject.scene !== gAPPP.renderEngine.sceneDetails.scene)
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
    if (uiObject.type === 'sceneTools') {
      return this.setSceneToolsDetails(uiObject, valueCache);
    }
  }
  static setSceneToolsDetails(uiObject, valueCache) {
    
  }
  static getNewSceneSerialized(fileDom) {
    let me = this;
    let file = null;
    if (fileDom)
      file = fileDom.files[0];

    if (file) {
      return new Promise((resolve, reject) => {
        sUtility.fileToURI(file)
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
  static getNumberOrDefault(str, d) {
    function isNumeric(v) {
      return !isNaN(parseFloat(Number(v))) && isFinite(Number(v));
    }
    if (isNumeric(str))
      return Number(str);
    return d;
  }
  static getVector(str, x, y, z) {
    if (str !== undefined)
      if (str !== '') {
        let parts = str.trim().split(',');
        x = sBabylonUtility.getNumberOrDefault(parts[0], x);
        y = sBabylonUtility.getNumberOrDefault(parts[1], y);
        z = sBabylonUtility.getNumberOrDefault(parts[2], z);
      }
    return new BABYLON.Vector3(x, y, z);
  }
  static createDefaultScene() {
    let scene = new BABYLON.Scene(gAPPP.renderEngine.engine);
    scene.clearColor = gAPPP.renderEngine.color(gAPPP.a.profile.canvasColor);

    let cameraVector = sBabylonUtility.getVector(gAPPP.a.profile.cameraVector, 0, 10, -10);
    let lightVector = sBabylonUtility.getVector(gAPPP.a.profile.lightVector, 0, 1, 0);
    let camera = new BABYLON.FreeCamera("defaultSceneBuilderCamera", cameraVector, scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    let light = new BABYLON.HemisphericLight("defaultSceneBuilderLight", lightVector, scene);
    light.intensity = .7;
    if (gAPPP.a.profile.lightIntensity !== undefined)
      light.intensity = gAPPP.a.profile.lightIntensity;
    return {
      light,
      camera,
      scene
    };
  }
  static addSphere(name, faces, diameter, scene) {
    let s = BABYLON.Mesh.CreateSphere(name, faces, diameter, scene);
    s.position.y = diameter / 2.0;
    return s;
  }
  static addGround(name, width, depth, subdivs, scene) {
    let ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
    return ground;
  }
}
