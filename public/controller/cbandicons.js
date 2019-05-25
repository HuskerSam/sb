class cBandIcons extends bBand {
  constructor(tag, dialog) {
    super(gAPPP.a.modelSets[tag], tag);
    this.fireSet = gAPPP.a.modelSets[tag];
    this.dialog = dialog;

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
  _getDomForChild(key, values) {
    let html = '<span class="img-holder"></span><div class="band-title"></div><br>';
    let d = new Date(values.sortKey);
    if (values.sortKey === undefined)
      d = new Date('1/1/1970');
    let od = d.toISOString().substring(0,10);
    od += ' ' + d.toISOString().substring(11,16);
    html += `<div class="sort-date-last-edit">${od}</div>`;
    let outer = document.createElement('div');
    outer.setAttribute('class', `band-background-preview app-border`);
    outer.innerHTML = html.trim();
    let button = outer.childNodes[0];
    let dd = document.createElement('div');
    dd.setAttribute('class', `${this.tag}${this.myKey}-${key} menu-clipper-wrapper`);
    dd.appendChild(outer);

    outer.addEventListener('click',  e => this.selectItem(e, key));

    let b = this.__addMenuItem(outer, 'open_in_new', e => this.selectItem(e, key, true));
    b = this.__addMenuItem(outer, 'file_download', e => this.downloadJSON(e, key), true);
    b = this.__addMenuItem(outer, 'delete', e => this._removeElement(e, key), true);

    this._nodeApplyValues(values, outer);

    this.childrenContainer.insertBefore(dd, this.childrenContainer.firstChild);
  }
  _removeElement(e, key) {
    if (!confirm('Are you sure you want to delete this ' + this.tag + '?'))
      return;
    gAPPP.a.modelSets[this.tag].removeByKey(key);
  }
  downloadJSON(e, key) {
    let json = cMacro.assetJSON(this.tag, key);
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
