class clsFireFields {
  constructor(fields, prefix, container, lineBreaks) {
    this.fields = fields;
    this.prefix = prefix;
    this.values = null;
    this.fireData = null;
    this.active = false;
    this.groups = {};
    this.lineBreaks = lineBreaks;
    this.container = container;

    for (let i in this.fields)
      this.initField(this.fields[i], i.toString());
  }
  initField(f, index) {
    let me = this;
    let n = this.prefix + 'field-' + index;
    let t = document.createElement('input');
    let l = document.createElement('label');
    let c = document.createElement('div');
    let g = null;
    if (f.group) {
      g = this.groups[f.group];
      if (!g) {
        g = document.createElement('div');
        g.classList.add('form-group-container-group');
        this.container.appendChild(g);
        this.groups[f.group] = g;
      }
    }
    t.id = n;
    l.setAttribute('for', t.id);
    l.innerText = f.title;
    c.classList.add('form-group');
    t.classList.add('form-control');
    c.appendChild(l);
    c.appendChild(t);
    t.addEventListener('change', (e) => me.scrape(e), false);
    if (g)
      g.appendChild(c);
    else {
      let w = document.createElement('div');
      w.classList.add('form-group-container-group');
      w.appendChild(c);
      this.container.appendChild(w);
    }
    f.dom = t;
  }
  scrape(e) {
    if (!this.active)
      return;
    this.scrapeCache = {};
    this.valueCache = {};
    for (let i in this.fields) {
      let f = this.fields[i];
      let v = f.dom.value;
      this.scrapeCache[i] = v;
      this.valueCache[f.fireSetField] = v;
      if (f.type === 'boolean') {
        v = false;
        if (v.toString().toLowerCase().substr(0, 1) === 't')
          v = true;
        if (v.toString().substr(0, 1) === '0')
          v = true;
      }

      if (f.fireSetField)
        gAPPP.path(this.values, f.fireSetField, v);
    }

    this.updateUIObject();
  }
  updateUIObject() {
    if (!this.uiObject)
      return;

    if (this.uiObject.type === 'texture') {
      function isNumeric(v) {
        let n = Number(v);
        return !isNaN(parseFloat(n)) && isFinite(n);
      }

      let material = this.uiObject.m;
      let texture = new BABYLON.Texture(this.valueCache['url']);
      
      if (isNumeric(this.valueCache['vScale']))
        texture.vScale = Number(this.valueCache['vScale']);
      if (isNumeric(this.valueCache['uScale']))
        texture.uScale = Number(this.valueCache['uScale']);
      if (isNumeric(this.valueCache['vOffset']))
        texture.vOffset = Number(this.valueCache['vOffset']);
      if (isNumeric(this.valueCache['uOffset']))
        texture.uOffset = Number(this.valueCache['uOffset']);

      texture.hasAlpha = this.valueCache['hasAlpha'];
      material.diffuseTexture = texture;
      return;
    }

    for (let i in this.fields) {
      let f = this.fields[i];
      let v = this.scrapeCache[i];

      if (f.fireSetField === 'name')
        continue;

      if (f.uiObjectField)
        this.updateUIObjectField(f, v);
    }
  }
  updateUIObjectField(f, v) {
    if (this.uiObject !== null) {
      if (v) {
        try {
          gAPPP.path(this.uiObject, f.uiObjectField, v);
        } catch (e) {
          e;
        }
      }
    }
  }
  setData(fireData) {
    this.values = fireData.val();
    this.fireData = fireData;
  }
  commit(fireSet) {
    let me = this;
    return new Promise((resolve, reject) => {
      fireSet.set(me.fireData.key, me.values).then((r) => resolve(r));
    });
  }
  paint(uiObject) {
    this.uiObject = uiObject;
    this.active = true;
    this.scrapeCache = {};
    this.valueCache = {};
    for (let i in this.fields) {
      let f = this.fields[i];
      let v = gAPPP.path(this.values, f.fireSetField);
      f.dom.value = v;
      this.scrapeCache[i] = v;
      this.valueCache[f.fireSetField] = v;
    }
    this.updateUIObject();
  }
}
