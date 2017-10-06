class cDataView {
  constructor(boundFields, prefix, container, parent) {
    this.fields = boundFields;
    this.prefix = prefix;
    this.values = {};
    this.active = false;
    this.parent = parent;
    this.container = container;
    this.focusLock = true;
    this.renderImageUpdateNeeded = false;
    this.loadedURL = '';

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
      c.classList.add('checkboxgroup');
    } else {
      l.setAttribute('for', t.id);
      l.innerText = f.title;

      t.classList.add('form-control');
      c.appendChild(l);
      c.appendChild(t);
    }

    c.classList.add('form-group');
    t.addEventListener('click', (e) => me.scrape(e), false);
    t.addEventListener('input', (e) => me.scrape(e), false);
    t.addEventListener('blur', (e) => me._blurField(t, f, e), false);
    f.domContainer = c;
    f.domLabel = l;
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
    let me = this;
    let element = field.dom;
    if (field.type === 'texture') {
      element.setAttribute('list', 'texturedatatitlelookuplist');
    }
    if (field.type === 'material') {
      element.setAttribute('list', 'materialdatatitlelookuplist');
    }
    if (field.type === 'url') {
      let l = field.domLabel;
      let c = field.domContainer;
      c.classList.add('url-type-input-group');
      let a = document.createElement('a');
      a.innerText = field.title;
      a.setAttribute('href', '');
      a.setAttribute('target', '_blank');
      l.innerHTML = '';
      field.urlAnchor = a;
      l.appendChild(a);

      let b = document.createElement('button');
      b.innerHTML = '<i class="material-icons">cloud_upload</i>';
      c.classList.add('url-form-group');
      c.insertBefore(b, c.childNodes[0]);
      b.addEventListener('click', e => field.fileDom.click(), false);

      let file = document.createElement('input');
      file.setAttribute('type', 'file');
      file.style.display = 'none';
      c.insertBefore(file, b);
      file.addEventListener('change', e => me.uploadURL(field), false);
      field.fileDom = file;

      let p_bar = document.createElement('div');
      p_bar.setAttribute('class', "progress progress-striped active");
      p_bar.innerHTML = '<div class="progress-bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width:100%;"></div>';
      p_bar.style.display = 'none';
      c.appendChild(p_bar);
      field.progressBar = p_bar;
    }
  }
  uploadURL(f) {
    let me = this;
    if (f.fileDom.files.length === 0)
      return;

    if (f.uploadType === 'mesh') {
      let fS = gAPPP.a.modelSets['mesh'];
      f.progressBar.style.display = '';
      f.dom.style.display = 'none';

      if (f.fileDom.files.length > 0)
        this.parent.context.updateObjectURL('mesh', this.parent.key, f.fileDom.files[0]).then(snapshot => {
          f.fileDom.value = '';
          f.progressBar.style.display = 'none';
          f.dom.style.display = '';
        });
    } else if (f.uploadType === 'texture') {

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
      let v = nV;
      this.scrapeCache.push(v);
      this.valueCache[f.fireSetField] = v;

      if (f.type === 'color')
        sUtility.setColorLabel(f.dom);
    }

    if (this.contextObject)
      this.contextObject.context.updateSelectedObject(this.contextObject, this.valueCache);
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
  paint(contextObject) {
    this.contextObject = contextObject;
    this.active = true;
    let scrapes = {};
    let valueCache = {};
    let contextReloadRequired = false;

    for (let i in this.fields) {
      let f = this.fields[i]

      let r = this._updateFieldDom(f);
      if (r.updateShown) {
        scrapes[i] = r.value;
        valueCache[f.fireSetField] = r.value;
      } else {
        scrapes[i] = this.scrapeCache[i];
        valueCache[f.fireSetField] = this.valueCache[f.fireSetField];
      }
      if (r.contextReloadRequired)
        contextReloadRequired = true;
    }
    this.valueCache = valueCache;
    this.scrapeCache = scrapes;
    this.focusLock = gAPPP.a.profile['inputFocusLock'];
    if (contextObject)
      contextObject.context.updateSelectedObject(this.contextObject, valueCache);
    this.loadedURL = this.valueCache['url'];
    return contextReloadRequired;
  }
  _handleDataChange(values, type, fireData) {
    let me = this;
    if (this.parent.fireSet.keyList) {
      if (this.parent.key !== fireData.key)
        return;
    }

    this.values = values;
    let contextReloadRequired = this.paint(this.contextObject);
    if (contextReloadRequired) {
      if (this.parent.tag === 'mesh' && this.contextObject) {
        let context = me.parent.context;
        let oldMesh = this.contextObject.mesh;
        if (oldMesh)
          oldMesh.dispose();
        this.contextObject.mesh = null;

        context.loadMesh(gAPPP.storagePrefix,
          context._url(this.values['url']), context.scene).then(r => {
          me.contextObject.mesh = r;
        });
      }
    }
  }
  _updateFieldDom(f) {
    let updateShown = false;
    let contextReloadRequired = false;
    let me = this;
    let v = sUtility.path(this.values, f.fireSetField);
    if (v === undefined)
      v = '';
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
        if (!this.focusLock) //if value hasn't changed with focus, update it
          if (o === f.dom.checked) {
            f.dom.checked = v;
            updateShown = true;
          }
        if (f.dom.checked !== v)
          f.dom.style.border = 'solid 2px red';
        else
          f.dom.style.border = '';
      }
    } else {
      o = o.toString(); //stringify old value for compare
      if (f.dom !== document.activeElement) {
        updateShown = true;
        f.dom.style.border = '';
        if (f.dom.value !== v)
          f.dom.value = v;
      } else {
        if (!this.focusLock)
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

      if (f.type === 'url') {
        f.urlAnchor.setAttribute('href', v);
      }
    }

    if (updateShown) {
      if (f.type === 'color')
        sUtility.setColorLabel(f.dom);

      if (f.type === 'url') {
        if (this.parent.tag === 'mesh') {
          if (this.loadedURL !== this.valueCache[f.fireSetField]) {
            contextReloadRequired = true;
          }
        }
      }
    }

    return {
      updateShown,
      value: v,
      contextReloadRequired
    };
  }
  _blurField(domControl, field, e) {
    this._updateFieldDom(field);
  }
}
