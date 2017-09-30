/* binding controller for dom to mdlFirebaseList */
'use strict';
class CTLBoundFields {
  constructor(boundFields, prefix, container, parent) {
    this.fields = boundFields;
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

    if (f.type === 'color') {


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

      if (f.type === 'color')
        gAPPP.renderEngine.setColorLabel(f.dom);

      if (f.fireSetField)
        gAPPP.u.path(this.values, f.fireSetField, v);
    }

    gAPPP.b.updateUI(this.uiObject, this.valueCache);
  }
  setData(fireData) {
    this.values = fireData.val();
    this.fireData = fireData;
  }
  commit(fireSet, imageBlob, renderImageFileName) {
    let me = this;
    return new Promise((resolve, reject) => {
      fireSet.setBlob(me.fireData.key, imageBlob, renderImageFileName).then((uploadResult) => {
        me.values['renderImageURL'] = uploadResult.downloadURL;
        fireSet.set(me.fireData.key, me.values).then((r) => resolve(r));
      });

    });
  }
  paint(uiObject) {
    this.uiObject = uiObject;
    this.active = true;
    this.scrapeCache = {};
    this.valueCache = {};
    for (let i in this.fields) {
      let f = this.fields[i];
      let nV = gAPPP.u.path(this.values, f.fireSetField);
      if (nV === undefined)
        nV = '';
      let v = this.validate(f, nV);

      if (f.type === 'boolean')
        f.dom.checked = v;
      else
        f.dom.value = v;

      if (f.type === 'color')
        gAPPP.renderEngine.setColorLabel(f.dom);

      this.scrapeCache[i] = v;
      this.valueCache[f.fireSetField] = v;
    }
    gAPPP.b.updateUI(uiObject, this.valueCache);
  }
  validate(f, v) {
    let r = v;
    function isNumeric(v) {
      return !isNaN(parseFloat(Number(v))) && isFinite(Number(v));
    }
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
}
