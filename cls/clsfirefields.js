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
    c.addEventListener('change', (e) => me.scrape(e), false);
    if (g)
      g.appendChild(c);
    else {
      let w = document.createElement('div');
      w.classList.add('form-group-container-group');
      w.appendChild(c);
      this.container.appendChild(w);
    }
    f.dom = c;
  }
  scrape(e) {
    if (!this.active)
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
  commit(fireSet) {
    let me = this;
    return new Promise((resolve, reject) => {
      fireSet.set(me.fireData.key, me.values).then((r) => resolve(r));
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
  }
}
