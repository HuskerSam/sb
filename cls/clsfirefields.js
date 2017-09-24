class FireFields {
  constructor(fields, container) {
    let me = this;
    this.fields = fields;
    this.values = null;
    this.fireData = null;
    this.active = false;

    if (container)
      this.container = container;
    else
      this.container = document;

    for (let i in this.fields) {
      let d = this.fields[i];
      if (d.domQuerySelector) {
        d.domElement = this.container.querySelector(d.domQuerySelector);
        d.domElement.addEventListener('change', (e) => me.scrape(e), false);
      }
    }
  }
  scrape(e) {
    if (! this.active)
      return;

    for (let i in this.fields) {
      let d = this.fields[i];
      let v = gAPPP.path(this.values, d.fireSetField);
      if (d.domQuerySelector)
        v = d.domElement.value;
      if (d.babylonMeshField)
        if (this.uiObject !== null)
          gAPPP.path(this.uiObject, d.babylonMeshField, v);
      if (d.fireSetField)
        gAPPP.path(this.values, d.fireSetField, v);
    }
  }
  setData(fireData) {
    this.values = fireData.val();
    this.fireData = fireData;
  }
  commit() {
    let me = this;
    return new Promise( (resolve, reject)  => {
      me.fireSet.set(me.id, me.values).then((r) => resolve(r)).error((e) => reject(e));
    });
  }
  paint(uiObject) {
    this.uiObject = uiObject;
    this.active = true;
    for (let i in this.fields) {
      let d = this.fields[i];
      let v = gAPPP.path(this.values, d.fireSetField);
      if (d.domElement)
        d.domElement.value = v;
      if (d.babylonMeshField)
        if (this.uiObject !== null)
          gAPPP.path(this.uiObject, d.babylonMeshField, v);
    }

    let mdlInputs = this.container.querySelectorAll('.mdl-js-textfield');
    for (var i = 0, l = mdlInputs.length; i < l; i++) {
      mdlInputs[i].MaterialTextfield.checkDirty();
    }
  }
}
