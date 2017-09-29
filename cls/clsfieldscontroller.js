class clsFieldsController {
  constructor(fields, prefix, container, parent) {
    this.fields = fields;
    this.prefix = prefix;
    this.values = null;
    this.fireData = null;
    this.active = false;
    this.parent = parent;
    this.container = container;

    this.groups = {};
    this.scrapeCache = [];
    this.valueCache = {};

    for (let i in this.fields)
      this.initField(this.fields[i], i.toString());
  }
  initField(f, index) {
    let me = this;
    let n = this.prefix + 'field-' + index;
    let c = document.createElement('div');
    let g = null;
    let t = document.createElement('input');
    let l = document.createElement('label');
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
    if (f.type === 'boolean') {
      t.setAttribute('type', 'checkbox');
      l.innerText = f.title;
      l.insertBefore(t, l.childNodes[0]);
      c.appendChild(l);
    } else {
      l.setAttribute('for', t.id);
      l.innerText = f.title;

      t.classList.add('form-control');
      c.appendChild(l);
      c.appendChild(t);
    }

    c.classList.add('form-group');
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
    this.scrapeCache = [];
    this.valueCache = {};
    for (let i in this.fields) {
      let f = this.fields[i];
      let nV = f.dom.value;
      if (f.type === 'boolean')
        nV = f.dom.checked;
      let v = this.validate(f, nV);
      this.scrapeCache.push(v);
      this.valueCache[f.fireSetField] = v;

      if (f.fireSetField)
        gAPPP.path(this.values, f.fireSetField, v);
    }

    this.updateUIObject();
  }
  updateUIObject() {
    if (!this.uiObject)
      return;

    if (this.uiObject.type === 'texture') {
      this.uiObject.m.diffuseTexture = this.texture(this.valueCache);
      return;
    }

    if (this.uiObject.type === 'material')
      return this.material(this.valueCache, this.uiObject.m);

    if (this.uiObject.type === 'mesh') {
      return this.updateMeshUI();
    }
  }
  updateMeshUI() {
    for (let i in this.fields) {
      let f = this.fields[i];
      let v = this.scrapeCache[i];

      if (f.fireSetField === 'name')
        continue;
      if (f.uiObjectField)
        this.updateUIObjectField(f, v, this.uiObject.mesh);
    }
  }
  updateUIObjectField(f, v, o) {
    if (v !== undefined) {
      try {
        if (f.type === 'color') {
          if (v === '')
            return;

          let parts = v.split(',');
          let cA = [];
          let color = new BABYLON.Color3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
          gAPPP.path(o, f.uiObjectField, color);

          return;
        }

        if (f.type === 'texture') {
          let tD = gAPPP.authorizationController.texturesFireSet.fireDataName[v];
          if (tD === undefined)
            return;

          let t = this.texture(tD);
          gAPPP.path(o, f.uiObjectField, t);

          return;
        }

        if (f.type === 'material') {
          let tD = gAPPP.authorizationController.materialsFireSet.fireDataName[v];
          if (tD === undefined)
            return;

          let m = this.material(tD);
          o.material = m;

          return;
        }

        gAPPP.path(o, f.uiObjectField, v);
      } catch (e) {
        console.log('set ui object error', e);
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
      let nV = gAPPP.path(this.values, f.fireSetField);
      if (nV === undefined)
        nV = '';
      let v = this.validate(f, nV);

      if (f.type === 'boolean')
        f.dom.checked = v;
      else
        f.dom.value = v;
      this.scrapeCache[i] = v;
      this.valueCache[f.fireSetField] = v;
    }
    this.updateUIObject();
  }
  validate(f, v) {
    let r = v;
    if (f.type === 'boolean') {
      r = false;
      if (v.toString().toLowerCase().substr(0, 1) === 't')
        r = true;
      if (v.toString().substr(0, 1) === '1')
        r = true;
      return r;
    }

    if (f.type === 'color') {
      let parts = v.trim().split(',');
      if (parts.length < 3)
        return '';
      let r = Number(parts[0]);
      let g = Number(parts[1]);
      let b = Number(parts[2]);

      if (!isNumeric(r) || !isNumeric(g) || !isNumeric(b))
        return '';

      r = parseFloat(Math.max(0.0, Math.min(1.0, r)).toFixed(4));
      g = parseFloat(Math.max(0.0, Math.min(1.0, g)).toFixed(4));
      b = parseFloat(Math.max(0.0, Math.min(1.0, b)).toFixed(4));

      return r + ',' + g + ',' + b;
    }

    if (f.type === 'texture') {
      //  return r;
    }
    return r;
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
  material(values, m) {
    if (!m)
      m = new BABYLON.StandardMaterial('material', this.parent.scene);

    let fields = gAPPP.materialFields;
    for (let i in fields) {
      let f = fields[i];
      let v = values[f.fireSetField];

      if (f.uiObjectField)
        this.updateUIObjectField(f, v, m);
    }

    return m;
  }
}
