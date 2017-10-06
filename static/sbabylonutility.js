class sBabylonUtility {
  static setMesh(values, mesh, scene) {
    if (! mesh)
      return;
    let fields = sStatic.bindingFields['mesh'];
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.fireSetField === 'name')
        continue;
      if (field.uiObjectField)
        this.updateObjectValue(field, value, mesh, scene);
    }
  }
  static material(values, scene) {
    let material = new BABYLON.StandardMaterial('material', scene);

    let fields = sStatic.bindingFields['material'];
    for (let i in fields) {
      let field = fields[i];
      let value = values[field.fireSetField];

      if (field.uiObjectField)
        this.updateObjectValue(field, value, material, scene);
    }
    return material;
  }
  static texture(values, scene) {
    let texture = new BABYLON.Texture(values['url'], scene);

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
  static updateObjectValue(field, value, object, scene) {
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
        let tD = gAPPP.a.modelSets['texture'].getValuesByFieldLookup('title', value);
        if (tD === undefined)
          return;

        let t = this.texture(tD, scene);
        return sUtility.path(object, field.uiObjectField, t);
      }

      if (field.type === 'material') {
        let tD = gAPPP.a.modelSets['material'].getValuesByFieldLookup('title', value);
        if (tD === undefined) {
          let m = new BABYLON.StandardMaterial('material', scene);
          object.material = m;
          return;
        }

        let m = this.material(tD, scene);
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

    if (uiObject.context !== gAPPP.activeContext)
      return;

    if (uiObject.type === 'texture') {
      uiObject.material.diffuseTexture = this.texture(valueCache, uiObject.context.scene);
      return;
    }
    if (uiObject.type === 'material') {
      uiObject.mesh.material = this.material(valueCache, uiObject.context.scene);
      return;
    }
    if (uiObject.type === 'mesh')
      return this.setMesh(valueCache, uiObject.mesh, uiObject.context.scene);
    if (uiObject.type === 'sceneTools') {
      return this.setSceneToolsDetails(uiObject, valueCache);
    }
  }
  static setSceneToolsDetails(uiObject, valueCache) {
    let fields = sStatic.bindingFields['sceneToolsBar'];
    for (let i in fields) {
      let field = fields[i];
      let value = valueCache[field.fireSetField];

      if (field.fireSetField === 'lightIntensity') {
        uiObject.context.light.intensity = Number(value);
      }
      if (field.fireSetField === 'lightVector') {
        uiObject.context.light.direction = this.getVector(value, 0, 1, 0);
      }
      if (field.fireSetField === 'cameraVector') {
        uiObject.context.camera.position = this.getVector(value, 0, 10, -10);
      }
      if (field.fireSetField === 'showFloorGrid') {
        uiObject.context.showGrid(!value);
      }
      if (field.fireSetField === 'showSceneGuides') {
        uiObject.context.showGuides(!value);
      }
      // field.fireSetField === 'gridAndGuidesDepth'
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
  static addSphere(name, faces, diameter, scene) {
    let s = BABYLON.Mesh.CreateSphere(name, faces, diameter, scene);
    s.position.y = diameter / 2.0;
    return s;
  }
  static makeTextPlane(text, color, size, scene) {
    let dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 50, scene, true);
    dynamicTexture.hasAlpha = true;
    dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
    let plane = new BABYLON.Mesh.CreatePlane("TextPlane", size, scene, true);
    plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", scene);
    plane.material.backFaceCulling = false;
    plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
    plane.material.diffuseTexture = dynamicTexture;
    return plane;
  }
  static showAxis(size, scene) {
    let sObjects = [];
    let axisX = BABYLON.Mesh.CreateLines("axisX", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
      new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
    ], scene);
    axisX.color = new BABYLON.Color3(1, 0, 0);
    sObjects.push(axisX);
    let xChar = this.makeTextPlane("X", "red", size / 10);
    xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);
    sObjects.push(xChar);

    let axisY = BABYLON.Mesh.CreateLines("axisY", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
      new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
    ], scene);
    axisY.color = new BABYLON.Color3(0, 1, 0);
    sObjects.push(axisY);
    let yChar = this.makeTextPlane("Y", "green", size / 10);
    yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);
    sObjects.push(yChar);

    let axisZ = BABYLON.Mesh.CreateLines("axisZ", [
      new BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
      new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
    ], scene);
    axisZ.color = new BABYLON.Color3(0, 0, 1);
    sObjects.push(axisZ);

    let zChar = this.makeTextPlane("Z", "blue", size / 10);
    zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    sObjects.push(zChar);
    return sObjects;
  }
  static color(str) {
    if (!str) {
      str = '1,1,1';
    }
    let parts = str.split(',');
    let cA = [];
    return new BABYLON.Color3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
  }
  static colorRGB255(str) {
    let bC = this.color(str);
    if (isNaN(bC.r))
      bC.r = 1;
    if (isNaN(bC.g))
      bC.g = 1;
    if (isNaN(bC.b))
      bC.b = 1;

    return 'rgb(' + (bC.r * 255.0).toFixed(0) + ',' + (bC.g * 255.0).toFixed(0) + ',' + (bC.b * 255.0).toFixed(0) + ')'
  }
  static setColorLabel(dom, defaultValue) {
    let v = dom.value;
    if (v === '')
      if (defaultValue)
        v = defaultValue;

    let rgb = '';
    if (v !== '')
      rgb = this.colorRGB255(v);
    dom.parentNode.style.background = rgb;
  }
}
