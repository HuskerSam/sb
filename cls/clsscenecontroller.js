class clsSceneController {
  constructor() {}
  setMesh(values, mesh) {
    let fields = gAPPP.meshFields;
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

    let fields = gAPPP.materialFields;
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
        return gAPPP.path(object, field.uiObjectField, value);

      if (field.type === 'color') {
        let parts = value.split(',');
        let cA = [];
        let color = new BABYLON.Color3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
        return gAPPP.path(object, field.uiObjectField, color);
      }

      if (field.type === 'texture') {
        let tD = gAPPP.authorizationController.modelSets.textures.fireDataName[value];
        if (tD === undefined)
          return;

        let t = this.texture(tD);
        return gAPPP.path(object, field.uiObjectField, t);
      }

      if (field.type === 'material') {
        let tD = gAPPP.authorizationController.modelSets.materials.fireDataName[value];
        if (tD === undefined)
          return;

        let m = this.material(tD);
        object.material = m;
        return;
      }

      //default
      gAPPP.path(object, field.uiObjectField, value);
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
    if (uiObject.type === 'material'){
      uiObject.mesh.material = this.material(valueCache, uiObject.scene);
      return;
    }
    if (uiObject.type === 'mesh')
      return this.setMesh(valueCache, uiObject.mesh);
  }
}
