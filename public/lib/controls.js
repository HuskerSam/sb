import gUtility from '/lib/gutility.js';

class bBand {
  constructor(modelSet, tag) {
    this.modelSet = modelSet;
    this.tag = tag;

    this.bindingsList = [{
      dataName: 'title',
      type: 'innerText'
    }, {
      dataName: 'renderImageURL',
      type: 'background-image',
      classKey: 'OUTER'
    }];

    this.modelSet.childListeners.push((values, type, fireData) => this.handleDataChange(fireData, type));
    this.myKey = Math.floor(Math.random() * 100).toString();
  }
  childAdded(fireData) {
    this._getDomForChild(fireData.doc.id, fireData.doc.data());
    this.childMoved();
  }
  childMoved() {}
  childChanged(fireData) {
    let div = this.childrenContainer.querySelector('.' + this.tag + this.myKey + '-' + fireData.doc.id);
    if (!div)
      return console.log(fireData, 'changed bBand missing dom');
    let values = fireData.doc.data();
    this._nodeApplyValues(values, div.querySelector('.band-background-preview'));
    this.childMoved();
  }
  childRemoved(fireData) {
    let post = this.childrenContainer.querySelector('.' + this.tag + this.myKey + '-' + fireData.doc.id);
    if (post)
      this.childrenContainer.removeChild(post);
    this.childMoved();
  }
  handleDataChange(fireData, type) {
    if (type === 'add')
      return this.childAdded(fireData);
    if (type === 'change')
      return this.childChanged(fireData);
    if (type === 'remove')
      return this.childRemoved(fireData);
    if (type === 'clear')
      return this.clearChildren();
    if (type === 'moved')
      return this.childMoved(fireData);
  }
  childMoved(fireData) {}
  clearChildren() {
    this.childrenContainer.innerHTML = '';
  }
  refreshUIFromCache() {
    this.clearChildren();

    let children = this.fireSet.fireDataValuesByKey;

    for (let i in children)
      this._getDomForChild(i, children[i]);
  }
  _nodeApplyValues(values, outer) {
    for (let i in this.bindingsList) {
      let binding = this.bindingsList[i];
      try {
        let classKey = binding.dataName;
        if (binding.classKey)
          classKey = binding.classKey;
        let element = outer.querySelector('.band-' + classKey);
        if (classKey === 'OUTER')
          element = outer;
        if (element === null)
          continue;
        let val = values[binding.dataName];

        if (binding.type === 'background-image') {
          let url = val;
          if (url) {
            let imgHolder = element.querySelector('.img-holder');
            if (imgHolder)
              imgHolder.style.backgroundImage = 'url("' + url + '")';
          }
        }

        if (val === undefined)
          continue;
        if (binding.type === 'innerText')
          element.innerText = val;
      } catch (e) {
        console.log('bBand apply value', e, binding);
      }
    }
  }
}
export class cBandProfileOptions {
  constructor(btn, fields, fieldsContainer, panel) {
    this.expanded = false;
    this.panelHideDisplayCSS = 'none';
    this.panelDisplayCSS = 'inline-block';


    if (!btn)
      btn = document.createElement('button');
    this.collapseButton = btn;
    this.collapseButton.addEventListener('click', e => this.toggle(), false);

    this.fieldsContainer = fieldsContainer;
    this.panel = panel;
    this.fields = fields;
    this.fireSet = gAPPP.sets.profile;
    this.fireFields = new cPanelData(this.fields, this.fieldsContainer, this);

    this.fireFields.helpers.expandAll();

    this.fireSet.childListeners.push((values, type, fireData) => {
      this.fireFields._handleDataChange(values, type, fireData);
      if (gAPPP.activeContext)
        gAPPP.activeContext.refreshFocus();
    });

    this.closeOthersCallback = null;
  }
  profileUpdatesPreview(fieldUpdates, key) {
    /*
    TO FIX
    //limited use preview of updates before they're sent - for fast UI refresh
    for (let i = 0; i < fieldUpdates.length; i++) {
      if (fieldUpdates[i].field === 'lightIntensity') {
        gAPPP.a.profile.lightIntensity = fieldUpdates[i].newValue;
        if (gAPPP.activeContext)
          gAPPP.activeContext._updateDefaultLight();
      }
      if (fieldUpdates[i].field === 'fontSize') {
        gAPPP.a.profile.fontSize = fieldUpdates[i].newValue;
      }
      if (fieldUpdates[i].field === 'canvasColor') {
        if (gAPPP.a.profile.canvasColor !== fieldUpdates[i].newValue) {
          gAPPP.a.profile.canvasColor = fieldUpdates[i].newValue;
          if (gAPPP.mV.rootBlock)
            gAPPP.mV.rootBlock.__renderSceneOptions();
        }
      }
    }
    */
  }
  activate() {
    this.fireFields.paint();
  }
  deactivate() {
    this.fireFields.active = false;
  }
  toggle(callback = true) {
    if (this.expanded) {
      this.expanded = false;
      if (this.panelShownClass)
        this.panel.classList.remove(this.panelShownClass);
      else
        this.panel.style.display = this.panelHideDisplayCSS;

      if (this.panelClosedCallback && callback)
        this.panelClosedCallback();

      this.collapseButton.classList.remove('app-inverted');
    } else {
      if (this.closeOthersCallback && callback)
        this.closeOthersCallback();
      this.expanded = true;

      if (this.panelShownClass)
        this.panel.classList.add(this.panelShownClass);
      else
        this.panel.style.display = this.panelDisplayCSS;
      this.collapseButton.classList.add('app-inverted');
    }
  }
}
export class cPanelData {
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
        g.classList.add('app-transparent');
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
      t.setAttribute('type', 'text');
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
    if (f.uploadType === 'skybox') {
      f.progressBar.style.display = '';
      f.dom.style.display = 'none';

      if (f.fileDom.files.length > 0) {
        this.parent.context.updateObjectURL('skybox', this.parent.key, f.fileDom.files[0]).then(results => {
          f.fileDom.value = '';
          f.progressBar.style.display = 'none';
          f.dom.style.display = '';
        });
      }
    } else if (f.uploadType === 'mesh') {
      f.progressBar.style.display = '';
      f.dom.style.display = 'none';

      if (f.fileDom.files.length > 0) {
        this.parent.context.updateObjectURL('mesh', this.parent.key, f.fileDom.files[0]).then(results => {
          f.fileDom.value = '';
          f.progressBar.style.display = 'none';
          f.dom.style.display = '';

          let cT = this.parent.context;
          if (cT.activeBlock)
            if (this.parent.tag === 'mesh' && cT)
              cT.activeBlock.loadMesh().then(() => this.paint());
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
    } else if (f.uploadType === 'audio') {
      f.progressBar.style.display = '';
      f.dom.style.display = 'none';

      if (f.fileDom.files.length > 0) {
        this.parent.context.updateObjectURL('audio', this.parent.key, f.fileDom.files[0]).then(results => {
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
    if (!this.fireSet)
      return;

    let updates = this._generateUpdateList(newValues);
    if (updates) {
      this.fireSet.update(updates, this.key);

      for (let i in this.fields) {
        let f = this.fields[i];
        if (f.fireSetField)
          gUtility.path(this.values, f.fireSetField, newValues[f.fireSetField]);
      }
    }
  }
  _generateUpdateList(newValues) {
    let updates = {};
    let noData = true;
    for (let i in this.fields) {
      let f = this.fields[i];
      let v = newValues[f.fireSetField];
      let o = gUtility.path(this.values, f.fireSetField);
      if (o === undefined)
        o = '';
      o = o.toString();
      if (v !== o) {
        updates[f.fireSetField] = v;
      }
    }

    if (noData)
      return null;
    return updates;
  }
  _handleDataChange(values, type, fireData) {
    if (!this.active)
      return;
    if (this.parent.key === null || this.parent.key === undefined)
      return;
    if (type === "moved")
      return;

    if (this.fireSet.keyList) {
      if (this.parent.key !== fireata.doc.id)
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

    this.helpers.initHelperField(field, this.fireSet);
  }
  __handleColorInputChange(field) {
    let bColor = gUtility.HexToRGB(field.colorPickerInput.value);
    field.dom.value = bColor.r.toFixed(2) + ',' + bColor.g.toFixed(2) + ',' + bColor.b.toFixed(2);
    this.scrape(null);
  }
  _updateFieldDom(f) {
    let updateShown = false;
    let contextReloadRequired = false;
    let v = gUtility.path(this.values, f.fireSetField);
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

            let outTag = tag;
            if (f.fireSetField === 'audioURL')
              outTag = 'textures';
            outV = gAPPP.cdnPrefix + outTag + '/' + v.substring(3);
          }
        }
        f.urlAnchor.setAttribute('href', outV);
      }
    }

    if (f.helperType === 'vector')
      this.helpers.fieldVectorUpdateData(f, this.fireSet, this.parent.key);
    if (f.helperType === 'singleSlider')
      this.helpers.fieldSliderUpdateData(f, this.fireSet, this.parent.key);

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
    f.colorPickerInput.value = gUtility.colorToHex(gUtility.color(f.dom.value));
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
export class cPanelHelpers {
  constructor(fireFields) {
    this.fireFields = fireFields;
    this.helperPanels = {};
    this.toggleButtons = [];
    this.fieldPanels = [];
    this.context = null;
    document.addEventListener('contextRefreshActiveObject', e => this.handleDataUpdate(e), false);
  }
  updateConfig(context, tag, key) {
    this.context = null;
    this.tag = null;
    this.key = null;
    if (!context)
      return;
    this.context = context;
    this.tag = tag;
    this.key = key;
  }
  resetUI() {
    let helperPanel = this.helperPanels['rotate'];
    if (helperPanel) {
      helperPanel.input[0].value = 0;
      helperPanel.slider[0].value = 0;
      helperPanel.input[1].value = 0;
      helperPanel.slider[1].value = 0;
      helperPanel.input[2].value = 0;
      helperPanel.slider[2].value = 0;
    }

    helperPanel = this.helperPanels['scale'];
    if (helperPanel) {
      helperPanel.input.value = 100;
    }
  }
  handleDataUpdate(event) {
    if (event.detail.context !== this.context)
      return;

    if (!this.context)
      return;
    if (!this.context.activeBlock)
      return;

    if (this.helperPanels['scale']) this._scaleDataUpdate();
    if (this.helperPanels['rotate']) this._rotateDataUpdate();
  }
  initHelperField(field) {
    if (field.helperType === 'vector') {
      let hp = this.__initDOMWrapper(field.domContainer);

      let aD = hp.actionDom;
      let sliderText0 = `<input type="range" min="${field.rangeMin}" max="${field.rangeMax}" step="${field.rangeStep}" value="0" /><br>`;
      let sliderText1 = `<input type="range" min="${field.rangeMin}" max="${field.rangeMax}" step="${field.rangeStep}" value="0" /><br>`;
      let sliderText2 = `<input type="range" min="${field.rangeMin}" max="${field.rangeMax}" step="${field.rangeStep}" value="0" /><br>`;
      let htmlAction = '<div class="preview"></div>';
      aD.innerHTML = sliderText0 + sliderText1 + sliderText2 + htmlAction;
      hp.slider = aD.querySelectorAll('input[type=range]');
      hp.slider[0].addEventListener('input', e => this._fieldHandleVectorChange(field), false);
      hp.slider[1].addEventListener('input', e => this._fieldHandleVectorChange(field), false);
      hp.slider[2].addEventListener('input', e => this._fieldHandleVectorChange(field), false);
      hp.preview = aD.querySelector('.preview');
      field.helperPanel = hp;
      this.fieldPanels.push(hp);
    }
    if (field.helperType === 'singleSlider') {
      let hp = this.__initDOMWrapper(field.domContainer);

      let aD = hp.actionDom;
      let sliderText0 = `<input type="range" class="singleslider" min="${field.rangeMin}" max="${field.rangeMax}" step="${field.rangeStep}" value="0" /><br>`;
      let htmlAction = '<div class="preview"></div>';
      aD.innerHTML = sliderText0 + htmlAction;
      hp.slider = aD.querySelector('input[type=range]');
      hp.slider.addEventListener('input', e => this._fieldHandleSliderChange(field), false);
      hp.preview = aD.querySelector('.preview');
      field.helperPanel = hp;
      this.fieldPanels.push(hp);
    }
  }
  _fieldHandleVectorChange(field) {
    let hp = field.helperPanel;
    let oldValue = field.dom.value;
    let r = hp.slider[0].value;
    let g = hp.slider[1].value;
    let b = hp.slider[2].value;

    let str = r + ',' + g + ',' + b;

    if (!hp.fireSet)
      return;

    hp.fireSet.update({
      [field.fireSetField]: str
    }, hp.key);
  }
  _fieldHandleSliderChange(field) {
    let hp = field.helperPanel;
    let oldValue = field.dom.value;
    let str = hp.slider.value;

    if (!hp.fireSet)
      return;

    hp.fireSet.update({
      [field.fireSetField]: str
    }, hp.key);
  }
  fieldVectorUpdateData(field, fireSet, key) {
    let hp = field.helperPanel;
    hp.fireSet = fireSet;
    hp.key = key;

    let vector = gUtility.getVector(field.dom.value, 0, 0, 0);
    hp.slider[0].value = vector.x.toFixed(3);
    hp.slider[1].value = vector.y.toFixed(3);
    hp.slider[2].value = vector.z.toFixed(3);
  }
  fieldSliderUpdateData(field, fireSet, key) {
    let hp = field.helperPanel;
    hp.fireSet = fireSet;
    hp.key = key;

    hp.slider.value = field.dom.value;
  }
  initHelperGroups() {
    if (this.fireFields.groups['scale']) this._scaleInitDom();
    if (this.fireFields.groups['rotate']) this._rotateInitDom();
  }
  __inputarrayHandleDomChange(hp, sender) {
    for (let c = 0, l = hp.input.length; c < l; c++) {
      if (hp.input[c] === sender)
        hp.slider[c].value = hp.input[c].value;
      if (hp.slider[c] === sender)
        hp.input[c].value = hp.slider[c].value;
    }
    this.context.refreshFocus();
  }
  _rotateChangeApply() {
    let helperPanel = this.helperPanels['rotate'];
    let sObj = this.context.activeBlock.sceneObject;
    let nObj = this.context.ghostBlocks['rotatePreview'].sceneObject;

    helperPanel.input[0].value = 0;
    helperPanel.slider[0].value = 0;
    helperPanel.input[1].value = 0;
    helperPanel.slider[1].value = 0;
    helperPanel.input[2].value = 0;
    helperPanel.slider[2].value = 0;
    this.fireSet.update({
      rotationX: gUtility.formatNumber(nObj.rotation.x).trim(),
      rotationY: gUtility.formatNumber(nObj.rotation.y).trim(),
      rotationZ: gUtility.formatNumber(nObj.rotation.z).trim()
    }, this.key);
  }
  _rotateDataUpdate() {
    let hp = this.helperPanels['rotate'];
    let sObj = this.context.activeBlock.sceneObject;
    hp.moveButton.disabled = true;

    this.context.setGhostBlock('rotatePreview', null);
    if (!sObj) {
      hp.infoDom.innerHTML = ' ';
      hp.preview.innerHTML = ' ';
      return;
    }
    this.__updateBoundingInfo();

    let r = sObj.rotation;
    let html = `x ${gUtility.formatNumber(r.x * 57.2958).trim()}&deg;`;
    html += ` y ${gUtility.formatNumber(r.y * 57.2958).trim()}&deg;`;
    html += ` z ${gUtility.formatNumber(r.z * 57.2958).trim()}&deg;`;
    if (this.tag === 'mesh') {
      let meshData = this.context.activeBlock.sceneObjectMeshData;
      if (meshData)
        html += `\n  Import x${gUtility.formatNumber(meshData.rotationX)} y${gUtility.formatNumber(meshData.rotationY)} z${gUtility.formatNumber(meshData.rotationZ)}`;
    }

    hp.infoDom.innerHTML = html;

    let x = hp.input[0].value;
    let y = hp.input[1].value;
    let z = hp.input[2].value;

    if (x === '0' && y === '0' && z === '0') {
      hp.preview.innerHTML = ' ';
      return;
    }

    let tNode = sObj.clone('rotateClonePreview');
    let x2 = Number(sObj.rotation.x);
    let y2 = Number(sObj.rotation.y);
    let z2 = Number(sObj.rotation.z);
    let vector = new BABYLON.Vector3(x2, y2, z2);
    tNode.rotation = vector;

    let adjVector = gUtility.getVector(x + ',' + y + ',' + z, 0, 0, 0);
    tNode.rotation.x += (adjVector.x / 57.2958);
    tNode.rotation.y += (adjVector.y / 57.2958);
    tNode.rotation.z += (adjVector.z / 57.2958);

    let xDegrees = gUtility.formatNumber(tNode.rotation.x * 57.2958).trim();
    let yDegrees = gUtility.formatNumber(tNode.rotation.y * 57.2958).trim();
    let zDegrees = gUtility.formatNumber(tNode.rotation.z * 57.2958).trim();
    let previewHtml = `x ${xDegrees}&deg; y ${yDegrees}&deg; z ${zDegrees}&deg;`;
    hp.preview.innerHTML = previewHtml;

    let m = new BABYLON.StandardMaterial('material', this.context.scene);
    m.diffuseColor = gUtility.color('0,.3,.8');
    m.diffuseColor.alpha = 0.7;
    this.context.__setMaterialOnObj(tNode, m);
    this.context.setGhostBlock('rotatePreview', new wBlock(this.context, null, tNode));

    hp.moveButton.disabled = false;
  }
  _rotateInitDom() {
    this.helperPanels['rotate'] = this.__initDOMWrapper(this.fireFields.groups['rotate']);
    let hp = this.helperPanels['rotate'];
    let aD = hp.actionDom;
    aD.classList.add('rotate');
    let html = '<div>x <input type="range" min="-360" max="360" step=".01" value="0" />' +
      ' <input class="form-control" type="text" value="0" />&deg;<br>' +
      'y <input type="range" min="-360" max="360" step=".01" value="0" />' +
      ' <input class="form-control" type="text" value="0" />&deg;<br>' +
      'z <input type="range" min="-360" max="360" step=".01" value="0" />' +
      ' <input class="form-control" type="text" value="0" />&deg;<br></div>' +
      '<button class="btn-sb-icon">Rotate</button><div class="preview"></div>';
    aD.innerHTML = html;
    hp.moveButton = aD.querySelector('button');
    hp.input = aD.querySelectorAll('input[type=text]');
    hp.slider = aD.querySelectorAll('input[type=range]');

    for (let c = 0, l = hp.input.length; c < l; c++)
      hp.input[c].addEventListener('input', e => this.__inputarrayHandleDomChange(hp, hp.input[c]), false);
    for (let c = 0, l = hp.slider.length; c < l; c++)
      hp.slider[c].addEventListener('input', e => this.__inputarrayHandleDomChange(hp, hp.slider[c]), false);

    hp.moveButton.addEventListener('click', e => this._rotateChangeApply(hp), false);
    hp.preview = aD.querySelector('.preview');
  }
  _scaleChangeApply() {
    let helperPanel = this.helperPanels['scale'];
    if (helperPanel.input.value === '100' || !gUtility.isNumeric(helperPanel.input.value))
      return;

    let sObj = this.context.activeBlock.sceneObject;
    let nObj = this.context.ghostBlocks['scalePreview'].sceneObject;

    helperPanel.input.value = 100;
    this.fireSet.update({
      scalingX: gUtility.formatNumber(nObj.scaling.x).trim(),
      scalingY: gUtility.formatNumber(nObj.scaling.y).trim(),
      scalingZ: gUtility.formatNumber(nObj.scaling.z).trim()
    }, this.key);
  }
  _scaleDataUpdate() {
    let hp = this.helperPanels['scale'];
    this.context.setGhostBlock('scalePreview', null);
    hp.scaleButton.disabled = true;

    if (!this.context.activeBlock.sceneObject) {
      hp.infoDom.innerHTML = ' ';
      hp.preview.innerHTML = ' ';
      return;
    }
    this.__updateBoundingInfo();

    let html = `Original w${gUtility.formatNumber(this._oDim.size.x)} h${gUtility.formatNumber(this._oDim.size.y)} d${gUtility.formatNumber(this._oDim.size.z)}`;
    html += `\n  Actual w${gUtility.formatNumber(this._wDim.size.x)} h${gUtility.formatNumber(this._wDim.size.y)} d${gUtility.formatNumber(this._wDim.size.z)}`;
    if (this.tag === 'mesh') {
      let meshData = this.context.activeBlock.sceneObjectMeshData;
      if (meshData)
        html += `\n  Import x${gUtility.formatNumber(meshData.scalingX)} y${gUtility.formatNumber(meshData.scalingY)} z${gUtility.formatNumber(meshData.scalingZ)}`;
    }
    hp.infoDom.innerHTML = html;

    if (hp.input.value === "100" || !gUtility.isNumeric(hp.input.value)) {
      hp.preview.innerHTML = ' ';
    } else {
      let val = Number(hp.input.value) / 100.0;
      let width = this._wDim.size.x * val;
      let height = this._wDim.size.y * val;
      let depth = this._wDim.size.z * val;
      let html = '';
      html += `Scaled w${gUtility.formatNumber(width)} h${gUtility.formatNumber(height)} d${gUtility.formatNumber(depth)}`;

      let tNode = this._sObj.clone('scaleClonePreview');
      tNode.scaling.x = val * this._sObj.scaling.x;
      tNode.scaling.y = val * this._sObj.scaling.y;
      tNode.scaling.z = val * this._sObj.scaling.z;

      let m = new BABYLON.StandardMaterial('material', this.context.scene);
      m.diffuseColor = gUtility.color('1,.5,0');
      m.diffuseColor.alpha = 0.7;
      this.context.__setMaterialOnObj(tNode, m);
      this.context.setGhostBlock('scalePreview', new wBlock(this.context, null, tNode));
      hp.preview.innerHTML = html;
      hp.scaleButton.disabled = false;
    }
  }
  _scaleInitDom() {
    let c = this.fireFields.groups['scale'];
    this.helperPanels['scale'] = this.__initDOMWrapper(c);
    let hp = this.helperPanels['scale'];
    let aD = hp.actionDom;
    aD.innerHTML = ' <input class="form-control scale-value" type="text" value="100" />% &nbsp;' +
      '<button class="btn-sb-icon scale-button">Scale</button><div class="preview"></div>' +
      '<div class="scale-to-fit">' +
      '<label><span>W</span><input type="text" class="mesh-width" value="1" /></label>' +
      '<label><span>H</span><input type="text" class="mesh-height" value="1" /></label>' +
      '<label><span>D</span><input type="text" class="mesh-depth" value="1" /></label>' +
      '<button class="fit-button">Fit</button></div>';
    hp.scaleButton = aD.querySelector('.scale-button');
    hp.input = aD.querySelector('.scale-value');
    hp.fitButton = aD.querySelector('.fit-button');
    hp.fitWidth = aD.querySelector('.mesh-width');
    hp.fitHeight = aD.querySelector('.mesh-height');
    hp.fitDepth = aD.querySelector('.mesh-depth');
    hp.fitButton.addEventListener('click', e => this._fitChangeApply(hp), false);
    hp.input.addEventListener('input', e => this.context.refreshFocus(), false);
    hp.scaleButton.addEventListener('click', e => this._scaleChangeApply(hp), false);
    hp.preview = aD.querySelector('.preview');
  }
  _fitChangeApply(hp) {
    let fitWidth = gUtility.getNumberOrDefault(hp.fitWidth.value, 1);
    let fitHeight = gUtility.getNumberOrDefault(hp.fitHeight.value, 1);
    let fitDepth = gUtility.getNumberOrDefault(hp.fitDepth.value, 1);
    this.__updateBoundingInfo();

    let xF = fitWidth / this._oDim.size.x;
    let xH = fitHeight / this._oDim.size.y;
    let xD = fitDepth / this._oDim.size.z;

    let factor = Math.min(xF, Math.min(xH, xD));

    this.fireSet.update({
      scalingX: factor.toFixed(6),
      scalingY: factor.toFixed(6),
      scalingZ: factor.toFixed(6)
    }, this.key);
  }
  collapseAll() {
    for (let c = 0, l = this.toggleButtons.length; c < l; c++)
      this.__toggleHelper(this.toggleButtons[c].helperDom, this.toggleButtons[c], false);
  }
  expandAll() {
    for (let c = 0, l = this.toggleButtons.length; c < l; c++)
      this.__toggleHelper(this.toggleButtons[c].helperDom, this.toggleButtons[c], true);
  }
  __initDOMWrapper(containerDom) {
    let helperDom = document.createElement('div');
    helperDom.setAttribute('class', 'selected-mesh-bounds-helper-box');
    helperDom.style.display = 'none';
    let collapseButton = document.createElement('button');
    collapseButton.setAttribute('class', 'selected-mesh-helper-collapse-button');
    collapseButton.innerHTML = '<i class="material-icons">unfold_more</i>';
    collapseButton.addEventListener('click', e => this.__toggleHelper(helperDom, collapseButton));
    collapseButton.helperDom = helperDom;
    this.toggleButtons.push(collapseButton);

    containerDom.appendChild(collapseButton);

    let actionDom = document.createElement('div');
    actionDom.setAttribute('class', 'action-area');
    helperDom.appendChild(actionDom);
    let infoDom = document.createElement('div');
    infoDom.classList.add('info-area');
    helperDom.appendChild(infoDom);
    containerDom.appendChild(helperDom);
    return {
      containerDom,
      helperDom,
      infoDom,
      actionDom,
      collapseButton
    };
  }
  __toggleHelper(helperDom, collapseButton, forceState = undefined) {
    let vState = false;

    if (helperDom.style.display === 'none')
      vState = true;

    if (forceState !== undefined)
      vState = forceState;

    if (vState) {
      helperDom.style.display = 'block';
      collapseButton.innerHTML = '<i class="material-icons">unfold_less</i>';
      collapseButton.classList.add('app-inverted');
    } else {
      helperDom.style.display = 'none';
      collapseButton.innerHTML = '<i class="material-icons">unfold_more</i>';
      collapseButton.classList.remove('app-inverted');
    }
  }
  __updateBoundingInfo() {
    this._sObj = this.context.activeBlock.sceneObject;
    if (!this._sObj)
      return;
    this._boundingBox = this._sObj.getBoundingInfo().boundingBox;
    this._oDim = {
      center: this._boundingBox.center,
      size: this._boundingBox.extendSize,
      minimum: this._boundingBox.minimum,
      maximum: this._boundingBox.maximum
    };
    this._wDim = {
      center: this._boundingBox.centerWorld,
      size: this._boundingBox.extendSizeWorld,
      minimum: this._boundingBox.minimumWorld,
      maximum: this._boundingBox.maximumWorld
    };
  }
}
export class cBandIcons extends bBand {
  constructor(tag, dialog, childrenContainer, deleteOnly = false) {
    super(gAPPP.a.modelSets[tag], tag);
    this.fireSet = gAPPP.a.modelSets[tag];
    this.dialog = dialog;
    this.deleteOnly = deleteOnly;

    if (childrenContainer)
      this.childrenContainer = childrenContainer;
    else
      this.childrenContainer = this.dialog.assetsFieldsContainer;

    setTimeout(() => {
      this.refreshUIFromCache();
      this.childMoved();
    }, 1);
  }
  childMoved() {
    this.modelSet.updateChildOrder();
    let keyOrder = this.modelSet.childOrderByKey;
    for (let i in keyOrder) {
      let key = keyOrder[i];
      let div = document.querySelector('.' + this.tag + this.myKey + '-' + key);
      if (div)
        this.childrenContainer.appendChild(div);
    }
    this._updateNoRecords();
  }
  _updateNoRecords() {
    let keyOrder = this.modelSet.childOrderByKey;
    if (Object.keys(keyOrder).length === 0) {
      let noAssets = document.createElement('div');
      let html = 'No ' + this.tag;
      if (this.tag === 'mesh')
        html += 'es';
      else
        html += 's';
      html +=  ' found';
      noAssets.innerHTML = html;
      noAssets.classList.add('noassetsfound');
      this.childrenContainer.appendChild(noAssets);
    } else {
      let noAssets = this.childrenContainer.querySelector('.noassetsfound');
      if (noAssets)
        noAssets.remove();
    }
  }
  getDateString(values) {
    let d = new Date(values.sortKey);
    if (values.sortKey === undefined)
      d = new Date('1/1/1970');
    let od = d.toISOString().substring(0,10);
    od += ' ' + d.toISOString().substring(11,16);
    return od;
  }
  _getDomForChild(key, values) {
    let html = '<span class="img-holder"></span><div class="band-title"></div><br>';
    let od = this.getDateString(values);
    html += `<div class="sort-date-last-edit">${od}</div>`;
    let outer = document.createElement('div');
    outer.setAttribute('class', `band-background-preview app-border`);
    outer.innerHTML = html.trim();
    let button = outer.childNodes[0];
    let dd = document.createElement('div');
    dd.setAttribute('class', `${this.tag}${this.myKey}-${key} menu-clipper-wrapper`);
    dd.appendChild(outer);

    outer.addEventListener('click',  e => this.selectItem(e, key));

    if (! this.deleteOnly) {
      this.__addMenuItem(outer, 'open_in_new', e => this.selectItem(e, key, true));
      this.__addMenuItem(outer, 'file_download', e => this.downloadJSON(e, key), true);
    }
    this.__addMenuItem(outer, 'delete', e => this._removeElement(e, key), true);

    if (this.tag === 'block') {
      this.__addMenuItem(outer, 'visibility', e => this._viewElement(e, key), true);
    }

    this._nodeApplyValues(values, outer);

    this.childrenContainer.insertBefore(dd, this.childrenContainer.firstChild);
  }
  _removeElement(e, key) {
    if (!confirm('Are you sure you want to delete this ' + this.tag + '?'))
      return;
    gAPPP.a.modelSets[this.tag].removeByKey(key);
  }
  _viewElement(e, key) {
    this.dialog.openViewerForAsset(key);
  }
  downloadJSON(e, key) {
    let json = cWorkspace.assetJSON(this.tag, key);
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', this.tag + '-' + key + '-asset.json');

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
  selectItem(e, newKey, newWindow) {
    this.dialog.selectItem(newKey, newWindow);
  }
  __addMenuItem(button, title, clickHandler, prependDivider) {
    let btn = document.createElement('button');
    btn.innerHTML = '<i class="material-icons">' + title + '</i>';
    btn.classList.add('btn-sb-icon');
    button.appendChild(btn);
    btn.addEventListener('click', e =>
    {
      e.stopPropagation();
      clickHandler(e);
      return false;
    }, false);
    return btn;
  }
}
