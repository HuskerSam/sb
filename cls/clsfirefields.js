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
    this.scrapeCache = [];
    this.valueCache = {};

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
    this.scrapeCache = [];
    this.valueCache = {};
    for (let i in this.fields) {
      let f = this.fields[i];
      let nV = f.dom.value;
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

    if (this.uiObject.type === 'material') {

      let material = this.uiObject.m;

      for (let i in this.fields) {
        let f = this.fields[i];
        let v = this.scrapeCache[i];

        if (f.uiObjectField)
          this.updateUIObjectField(f, v, material);
      }
      return;
    }

    for (let i in this.fields) {
      let f = this.fields[i];
      let v = this.scrapeCache[i];

      if (f.fireSetField === 'name')
        continue;

      if (f.uiObjectField)
        this.updateUIObjectField(f, v, this.uiObject);
    }
  }
  updateUIObjectField(f, v, o) {
    if (this.uiObject !== null) {
      if (v !== undefined) {
        try {
          if (f.type === 'color') {
            if (v === '') {
              return;
            }
            let parts = v.split(',');
            let cA = [];
            let color =  new BABYLON.Color3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
            gAPPP.path(o, f.uiObjectField, color);
            return;
          }

          gAPPP.path(o, f.uiObjectField, v);
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
      let nV = gAPPP.path(this.values, f.fireSetField);
      let v = this.validate(f, nV);
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

      r = Math.max(0.0, Math.min(1.0, r));
      g = Math.max(0.0, Math.min(1.0, g));
      b = Math.max(0.0, Math.min(1.0, b));

      return r.toFixed(3) + ',' + g.toFixed(3) + ',' + b.toFixed(3);
    }

    return r;
  }
}
