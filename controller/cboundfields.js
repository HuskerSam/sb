/* binding controller for dom to mFirebaseSuper */
class cBoundFields {
  constructor(boundFields, prefix, container, parent) {
    this.fields = boundFields;
    this.prefix = prefix;
    this.values = {};
    this.active = false;
    this.parent = parent;
    this.container = container;
    this.focusLock = true;
    this.renderImageUpdateNeeded = false;

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
    t.addEventListener('input', (e) => me.scrape(e), false);
    t.addEventListener('blur', (e) => me._blurField(t, f, e), false);
    if (g)
      g.appendChild(c);
    else {
      let w = document.createElement('div');
      w.classList.add('form-group-container-group');
      w.appendChild(c);
      this.container.appendChild(w);
    }
    f.dom = t;
    this._specialDomFeatures(f);
  }
  _specialDomFeatures(field) {
    let element = field.dom;
    if (field.type === 'texture') {
      element.setAttribute('list', 'texturedatatitlelookuplist');
    }
    if (field.type === 'material') {
      element.setAttribute('list', 'materialdatatitlelookuplist');
    }

  }
  scrape(e) {
    if (!this.active)
      return;
    this.scrapeCache = [];
    this.valueCache = {};
    for (let i in this.fields) {
      let f = this.fields[i];
      let nV = f.dom.value.trim();
      if (f.type === 'boolean')
        nV = f.dom.checked;
      let v = nV;//this.validate(f, nV);
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
    if (updates.length > 0) {
      this.parent.fireSet.commitUpdateList(updates, this.parent.key);

      for (let i in this.fields) {
        let f = this.fields[i];
        if (f.fireSetField)
          sUtility.path(this.values, f.fireSetField, newValues[f.fireSetField]);
      }

      this.renderImageUpdateNeeded = true;
    }
  }
  _generateUpdateList(newValues) {
    let updates = [];
    for (let i in this.fields) {
      let f = this.fields[i];
      let v = newValues[f.fireSetField];
      let o = sUtility.path(this.values, f.fireSetField);
      if (o === undefined)
        o = '';
      o = o.toString();
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
  paint(uiObject) {
    this.uiObject = uiObject;
    this.active = true;
    let scrapes = {};
    let valueCache = {};
    for (let i in this.fields) {
      let f = this.fields[i];

      let r = this._updateFieldDom(f);
      if (r.updateShown) {
        scrapes[i] = r.value;
        valueCache[f.fireSetField] = r.value;
      }
      else {
        scrapes[i] = this.scrapeCache[i];
        valueCache[f.fireSetField] = this.valueCache[f.fireSetField];
      }
    }
    this.valueCache = valueCache;
    this.scrapeCache = scrapes;
    sBabylonUtility.updateUI(uiObject, valueCache);
  }
  _handleDataChange(values, type, fireData) {
    this.values = values;
    this.paint(this.uiObject);
  }
  _updateFieldDom(f) {
    let updateShown = false;
    let nV = sUtility.path(this.values, f.fireSetField);
    if (nV === undefined)
      nV = '';
    let v = nV; // this.validate(f, nV);
    let o = this.valueCache[f.fireSetField];

    if (o === undefined)
      o = '';

    if (f.type === 'boolean') {
      if (f.dom !== document.activeElement) {
        updateShown = true;
        f.dom.style.border = '';
        if (f.dom.checked !== v)
          f.dom.checked = v;
      } else {
        if (! this.focusLock) //if value hasn't changed with focus, update it
          if (o === f.dom.checked) {
            f.dom.checked = v;
            updateShown = true;
          }
        if (f.dom.checked !== v)
          f.dom.style.border = 'solid 2px red';
        else
          f.dom.style.border = '';
      }
    }
    else {
      o = o.toString(); //stringify old value for compare
      if (f.dom !== document.activeElement) {
        updateShown = true;
        f.dom.style.border = '';
        if (f.dom.value !== v)
          f.dom.value = v;
      } else {
        if (! this.focusLock)
          if (o === f.dom.value) { //if value hasn't changed with focus, update it
            f.dom.value = v;
            updateShown = true;
            f.dom.style.border = '';
          }
        if (f.dom.value !== v)
          f.dom.style.border = 'solid 2px red';
        else
          f.dom.style.border = '';
      }
    }

    if (updateShown) {
      if (f.type === 'color')
        gAPPP.renderEngine.setColorLabel(f.dom);
    }
    return { updateShown, value: v };
  }
  _blurField(domControl, field, e) {
    this._updateFieldDom(field);
  }
}
