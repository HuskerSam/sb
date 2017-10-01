/* binding controller for dom to mdlFirebaseList */
'use strict';
class cBoundFields {
  constructor(boundFields, prefix, container, parent) {
    this.fields = boundFields;
    this.prefix = prefix;
    this.values = {};
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
    t.addEventListener('keyup', (e) => me.scrape(e), false);
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
    }

    sBabylonUtility.updateUI(this.uiObject, this.valueCache);
    this._commitUpdates(this.valueCache);
  }
  _commitUpdates(newValues) {
    if (!this.parent.fireSet)
      return;

    let updates = this._generateUpdateList(newValues);
    this.parent.fireSet.commitUpdateList(updates, this.parent.key);

    for (let i in this.fields) {
      let f = this.fields[i];
      if (f.fireSetField)
        sUtility.path(this.values, f.fireSetField, newValues[f.fireSetField]);
    }
  }
  _generateUpdateList(newValues) {
    let updates = [];
    for (let i in this.fields) {
      let f = this.fields[i];
      let v = newValues[f.fireSetField];
      let o = this.values[f.fireSetField];

      if (v !== o) {
        updates.push({
          field: f.fireSetField,
          newValue: v,
          oldValue: o
        });
      }
    }
    return updates;
  }

  commit(fireSet, imageBlob, renderImageFileName, key) {
    let me = this;
    return new Promise((resolve, reject) => {
      fireSet.setBlob(key, imageBlob, renderImageFileName).then((uploadResult) => {
        me.values['renderImageURL'] = uploadResult.downloadURL;
        fireSet.set(key, me.values).then((r) => resolve(r));
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
      let nV = sUtility.path(this.values, f.fireSetField);
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
    sBabylonUtility.updateUI(uiObject, this.valueCache);
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
    return r;
  }
}
