class cDialogEditItem extends cDialogSuper {
  constructor(tag, title) {
    let d = document.createElement('div');
    d.innerHTML = document.getElementById('scene-builder-edit-dialog-template').innerHTML;
    d.setAttribute('role', 'dialog');
    d.setAttribute('class', 'modal fade edit-modal');
    d.querySelector('.popup-title').innerHTML = title;
    super('#' + tag + '-details-dialog', tag, d);
    this._splitViewAlive = true;
    this.initScene = true;
    this._initMeshSpecificElements();
  }
  show(key) {
    this.key = key;
    this.fireFields.values = this.fireSet.fireDataByKey[this.key].val();

    if (! this.fireFields.values['renderImageURL'])
      this.fireFields.renderImageUpdateNeeded = true;
    super.show();
  }
  _initMeshSpecificElements() {
    if (this.tag !== 'mesh')
      return;

    let helperPanels = {};

    let groups = this.fireFields.groups;
    // scale, offset, rotate
    if (groups['scale']) {
      let g = groups['scale'];
      let h = document.createElement('div');
      h.setAttribute('class', 'selected-mesh-bounds-helper-box');
      g.appendChild(h);
      helperPanels['scale'] = {
        groupDom: groups['scale'],
        helperDom: h
      };
    }
    if (groups['offset']) {
      let g = groups['offset'];
      let h = document.createElement('div');
      h.setAttribute('class', 'selected-mesh-bounds-helper-box');
      g.appendChild(h);
      helperPanels['offset'] = {
        groupDom: groups['offset'],
        helperDom: h
      };
    }

    this.context.helperPanels = helperPanels;
  }
}
