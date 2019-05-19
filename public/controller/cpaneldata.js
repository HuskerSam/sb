class cPanelData {
  constructor(boundFields, container, parent, initHelpers = true) {
    this.fields = boundFields;
    this.values = {};
    this.active = false;
    this.parent = parent;
    this.container = container;
    this.loadedURL = '';
    this.helpers = new cPanelHelpers(this);
    this.groups = {};
    this.scrapeCache = [];
    this.valueCache = {};
    this.fieldObjs = [];
    this.updateContextObject = false;

    for (let i in this.fields) this._initField(this.fields[i]);

    if (initHelpers)
      this.helpers.initHelperGroups();
  }
  _initField(f) {
    let c = document.createElement('div');
    let g = null;
    let t = document.createElement('input');
    let l = document.createElement('label');
    if (f.group) {
      g = this.groups[f.group];
      if (!g) {
        g = document.createElement('div');
        g.classList.add('form-group-container-group');
        g.classList.add('app-panel');
        this.container.appendChild(g);
        this.groups[f.group] = g;
      }
    }
    if (f.type === 'boolean') {
      t.setAttribute('type', 'checkbox');
      l.innerHTML = '<span>' + f.title + '</span>';
      l.insertBefore(t, l.childNodes[0]);
      c.appendChild(l);
      c.classList.add('checkboxgroup');
    } else {
      l.innerHTML = '<span>' + f.title + '</span>';
      l.appendChild(t);
      t.classList.add('form-control');
      c.appendChild(l);
    }

    c.classList.add('form-group');

    if (f.type === 'boolean')
      t.addEventListener('click', e => this.scrape(e), false);

    t.addEventListener('input', e => this.scrape(e), false);
    t.addEventListener('blur', e => this._blurField(t, f, e), false);
    f.domContainer = c;
    f.domLabel = l;
    if (g) {
      g.appendChild(c);
      if (f.addLineBreak)
        g.appendChild(document.createElement('br'));
      if (f.floatLeft)
        f.domContainer.style.float = 'left';
      if (f.floatRight)
        f.domContainer.style.float = 'right';
      if (f.clearLeft)
        f.domContainer.style.clear = 'left';
      if (f.groupClass)
        g.classList.add(f.groupClass);
      if (f.paddingRight !== undefined)
        f.domContainer.style.paddingRight = f.paddingRight;
      if (f.paddingBottom !== undefined)
        f.domContainer.style.paddingBottom = f.paddingBottom;
      let floatBreak = document.createElement('div');
      floatBreak.style.clear = 'both';
      f.domContainer.appendChild(floatBreak);
    } else {
      let w = document.createElement('div');
      w.classList.add('form-group-container-group');
      w.appendChild(c);
      this.container.appendChild(w);
    }
    f.dom = t;
    if (f.wrapperClass)
      f.domContainer.classList.add(f.wrapperClass);
    this._specialDomFeatures(f);
    this.fieldObjs.push(f);
  }
  paint(newValues) {
    this.active = true;
    let scrapes = {};
    let valueCache = {};
    let contextReloadRequired = false;

    if (newValues)
      this.values = newValues;

    this.helpers.updateConfig(this.parent.context, this.parent.tag, this.parent.key);

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

    if (this.parent.rootBlock) {
      if (this.updateContextObject)
        this.parent.rootBlock.setData(this.values);
      this.parent.context.refreshFocus();
    }
    this.loadedURL = this.valueCache['url'];

    this._updateDisplayFilters();
    this._updateDisplayListFilters();

    return contextReloadRequired;
  }
  scrape(e) {
    if (!this.active)
      return;
    this.scrapeCache = [];
    for (let i in this.fields) {
      let f = this.fields[i];
      let nV = f.dom.value;
      if (!f.noTrim)
        nV = nV.trim();

      if (f.type === 'boolean')
        nV = f.dom.checked;
      let v = nV;
      this.scrapeCache.push(v);
      this.valueCache[f.fireSetField] = v;

      if (f.type === 'color')
        this.__updateColorLabel(f);
    }
    this._commitUpdates(this.valueCache);

    this._updateDisplayFilters();
    this._updateDisplayListFilters();
  }
  uploadURL(f) {
    if (f.fileDom.files.length === 0)
      return;

    if (f.uploadType === 'mesh') {
      f.progressBar.style.display = '';
      f.dom.style.display = 'none';

      if (f.fileDom.files.length > 0) {
        this.parent.context.updateObjectURL('mesh', this.parent.key, f.fileDom.files[0]).then(results => {
          f.fileDom.value = '';
          f.progressBar.style.display = 'none';
          f.dom.style.display = '';
/*
          let newMesh = results.newMesh;
          let objectData = this.valueCache;
          objectData.scalingX = newMesh.scaling.x;
          objectData.scalingY = newMesh.scaling.y;
          objectData.scalingZ = newMesh.scaling.z;

          objectData.positionX = newMesh.position.x;
          objectData.positionY = newMesh.position.y;
          objectData.positionZ = newMesh.position.z;

          objectData.rotationX = newMesh.rotation.x;
          objectData.rotationY = newMesh.rotation.y;
          objectData.rotationZ = newMesh.rotation.z;
          */
          this._commitUpdates(this.valueCache);
        });
      }
    } else if (f.uploadType === 'texture') {
      f.progressBar.style.display = '';
      f.dom.style.display = 'none';

      if (f.fileDom.files.length > 0) {
        this.parent.context.updateObjectURL('texture', this.parent.key, f.fileDom.files[0]).then(results => {
          f.fileDom.value = '';
          f.progressBar.style.display = 'none';
          f.dom.style.display = '';
        });
      }
    } else if (f.uploadType === 'scene') {
      f.progressBar.style.display = '';
      f.dom.style.display = 'none';

      if (f.fileDom.files.length > 0) {
        this.parent.context.updateObjectURL('block', this.parent.key, f.fileDom.files[0]).then(results => {
          f.fileDom.value = '';
          f.progressBar.style.display = 'none';
          f.dom.style.display = '';
        });
      }
    } else if (f.uploadType === 'video') {
      f.progressBar.style.display = '';
      f.dom.style.display = 'none';

      if (f.fileDom.files.length > 0) {
        this.parent.context.updateObjectURL('video', this.parent.key, f.fileDom.files[0]).then(results => {
          f.fileDom.value = '';
          f.progressBar.style.display = 'none';
          f.dom.style.display = '';
        });
      }
    }
  }
  _blurField(domControl, field, e) {
    this._updateFieldDom(field);
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
          GLOBALUTIL.path(this.values, f.fireSetField, newValues[f.fireSetField]);
      }
    }
  }
  _generateUpdateList(newValues) {
    let updates = [];
    for (let i in this.fields) {
      let f = this.fields[i];
      let v = newValues[f.fireSetField];
      let o = GLOBALUTIL.path(this.values, f.fireSetField);
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
  _handleDataChange(values, type, fireData) {
    if (!this.active)
      return;
    if (this.parent.key === null)
      return;
    if (type === "moved")
      return;

    if (this.parent.fireSet.keyList) {
      if (this.parent.key !== fireData.key)
        return;
    }

    this.values = values;
    let contextReloadRequired = this.paint();

    let cT = this.parent.context;
    if (contextReloadRequired) {
      if (cT.activeBlock)
        if (this.parent.tag === 'mesh' && cT)
          cT.activeBlock.loadMesh().then(() => this.paint());
    }

  }
  _specialDomFeatures(field) {
    let element = field.dom;
    if (field.type === 'texture') {
      element.setAttribute('list', 'texturedatatitlelookuplist');
    }
    if (field.type === 'material') {
      element.setAttribute('list', 'materialdatatitlelookuplist');
    }
    if (field.type === 'shapeType') {
      element.setAttribute('list', 'applicationdynamicshapelistlookuplist');
    }
    if (field.inlineWidth) {
      field.domContainer.style.width = field.inlineWidth;
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
      c.parentElement.appendChild(b);
      c.appendChild(field.dom);
      b.addEventListener('click', e => field.fileDom.click(), false);

      let file = document.createElement('input');
      file.setAttribute('type', 'file');
      file.style.display = 'none';
      c.appendChild(file);
      file.addEventListener('change', e => this.uploadURL(field), false);
      field.fileDom = file;

      let p_bar = document.createElement('div');
      p_bar.setAttribute('class', "progress progress-striped active");
      p_bar.innerHTML = '<div class="progress-bar" style="width:100%;">Uploading...</div>';
      p_bar.style.display = 'none';
      c.appendChild(p_bar);
      field.progressBar = p_bar;
    }
    if (field.type === 'color') {
      let l = field.domLabel;
      let cp = document.createElement('input');
      cp.classList.add('color-picker-input');
      cp.setAttribute('type', 'color');
      l.insertBefore(cp, l.childNodes[1]);
      field.colorPickerInput = cp;
      l.classList.add('color-data-item');

      field.colorPickerInput.addEventListener('input', e => this.__handleColorInputChange(field));
    }
    if (field.dataListId)
      element.setAttribute('list', field.dataListId);

    this.helpers.initHelperField(field, this.parent.fireSet);
  }
  __handleColorInputChange(field) {
    let bColor = GLOBALUTIL.HexToRGB(field.colorPickerInput.value);
    field.dom.value = bColor.r.toFixed(2) + ',' + bColor.g.toFixed(2) + ',' + bColor.b.toFixed(2);
    this.scrape(null);
  }
  _updateFieldDom(f) {
    let updateShown = false;
    let contextReloadRequired = false;
    let v = GLOBALUTIL.path(this.values, f.fireSetField);
    if (v === undefined)
      v = '';
    let o = this.valueCache[f.fireSetField];

    if (o === undefined)
      o = '';

    f.dom.setAttribute('data-field', f.fireSetField);
    f.dom.setAttribute('data-key', this.parent.key);
    f.dom.setAttribute('data-set', this.parent.tag);

    if (f.type === 'boolean') {
      if (f.dom !== document.activeElement) {
        updateShown = true;
        f.dom.style.border = '';
        if (f.dom.checked !== v)
          f.dom.checked = v;
      } else {
        if (!gAPPP.a.profile.inputFocusLock) //if value hasn't changed with focus, update it
          if (o === f.dom.checked) {
            f.dom.checked = v;
            updateShown = true;
          }

        if (f.dom.checked !== v)
          f.dom.style.border = 'solid .25em red';
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
        if (!gAPPP.a.profile.inputFocusLock)
          if (o === f.dom.value) { //if value hasn't changed with focus, update it
            f.dom.value = v;
            updateShown = true;
            f.dom.style.border = '';
          }

        if (f.dom.value !== v)
          f.dom.style.border = 'solid .25em red';
        else
          f.dom.style.border = '';
      }

      if (f.type === 'url') {
        let outV = v;
        if (v.substring(0, 3) === 'sb:') {
          let tag = this.parent.tag;
          if (tag) {
            if (tag === 'mesh')
              tag += 'es';
            else
              tag += 's';
            outV = gAPPP.cdnPrefix + tag + '/' + v.substring(3);
          }
        }
        f.urlAnchor.setAttribute('href', outV);
      }
    }

    if (f.helperType === 'vector')
      this.helpers.fieldVectorUpdateData(f, this.parent.fireSet, this.parent.key);
    if (f.helperType === 'singleSlider')
      this.helpers.fieldSliderUpdateData(f, this.parent.fireSet, this.parent.key);

    if (f.displayType)
      f.domContainer.classList.add(f.displayType);

    if (f.displayType === 'displayFilter')
      this._updateDisplayFilters();
    if (f.displayType === 'displayListFilter')
      this._updateDisplayListFilters();

    if (updateShown) {
      if (f.type === 'color') {
        this.__updateColorLabel(f);
      }
      if (f.type === 'url') {
        if (this.parent.tag === 'mesh') {
          if (this.loadedURL !== this.valueCache[f.fireSetField]) {
            contextReloadRequired = true;
          }
        }
      }
      if (f.type === 'font') {
        f.dom.style.fontFamily = f.dom.value;
      }
    }

    return {
      updateShown,
      value: v,
      contextReloadRequired
    };
  }
  __updateColorLabel(f) {
    let bColor = GLOBALUTIL.color(f.dom.value);
    let rH = Math.round(bColor.r * 255).toString(16);
    if (rH.length === 1)
      rH = '0' + rH;
    let gH = Math.round(bColor.g * 255).toString(16);
    if (gH.length === 1)
      gH = '0' + gH;
    let bH = Math.round(bColor.b * 255).toString(16);
    if (bH.length === 1)
      bH = '0' + bH;

    let hex = '#' + rH + gH + bH;
    f.colorPickerInput.value = hex;
  }
  _updateDisplayFilters() {
    for (let inner in this.fields) {
      let innerField = this.fields[inner];
      if (innerField.displayGroup) {
        let group = null;
        if (innerField.displayKey)
          group = this.valueCache[innerField.displayKey];
        else
          continue;

        let show = false;
        if (Array.isArray(innerField.displayGroup)) {
          if (innerField.displayGroup.indexOf(group) !== -1)
            show = true;
        } else
        if (innerField.displayGroup === group)
          show = true;

        if (show)
          innerField.domContainer.style.display = 'inline-block';
        else
          innerField.domContainer.style.display = 'none';
      }
    }

    for (let i in this.groups) {
      let childVisible = false;
      this.groups[i].style.display = 'none';
      let children = this.groups[i].childNodes
      for (let ii = 0; ii < children.length; ii++)
        if (children[ii].style.display !== 'none') {
          this.groups[i].style.display = '';
          continue;
        }
    }
  }
  _updateDisplayListFilters() {
    for (let inner in this.fields) {
      let innerField = this.fields[inner];
      let keyValue = '';
      if (innerField.listKey)
        keyValue = this.valueCache[innerField.listKey];
      else
        continue;

      let title = innerField.titlesByKey[keyValue];
      let lists = innerField.listsByKey[keyValue];
      if (!title)
        title = "";
      innerField.domLabel.querySelector('span').innerHTML = title;
      if (lists !== null)
        innerField.dom.setAttribute('list', lists);
    }
  }
}
