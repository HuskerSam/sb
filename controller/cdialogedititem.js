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

    if (!this.fireFields.values['renderImageURL'])
      this.fireFields.renderImageUpdateNeeded = true;
    super.show();
  }
  _initMeshSpecificElements() {
    if (this.tag !== 'mesh')
      return;

    let helperPanels = {};

    let groups = this.fireFields.groups;
    if (groups['scale']) {
      helperPanels['scale'] = this._createHelperDOM(groups['scale']);
      let hp = helperPanels['scale'];
      let aD = hp.actionDom;
      aD.innerHTML = '<input type="range" min="1" max="500" step=".1" value="100" /> <input class="form-control" type="text" value="100" />% <button class="btn">Scale</button><div class="preview"></div>';
      hp.scaleButton = aD.querySelector('button');
      hp.input = aD.querySelector('input[type=text]');
      hp.slider = aD.querySelector('input[type=range]');
      hp.input.addEventListener('input', e => this._handleInputChange(hp, hp.scale), false);
      hp.slider.addEventListener('input', e => this._handleInputChange(hp, hp.slider), false);
      hp.scaleButton.addEventListener('click', e => this._handleScaleInputCommit(hp), false);
      hp.preview = aD.querySelector('.preview');
    }
    if (groups['offset']) {
      helperPanels['offset'] = this._createHelperDOM(groups['offset']);
      let hp = helperPanels['offset'];
      let aD = hp.actionDom;
      aD.classList.add('offset');
      let html = '<select class="form-control"><option>X</option><option selected>Y</option><option>Z</option></select>';
      html += ' <input type="range" min="-15" max="15" step=".01" value="0" /> <input class="form-control" type="text" value="0" /> <button class="btn">Move</button><div class="preview"></div>';
      aD.innerHTML = html;
      hp.moveButton = aD.querySelector('button');
      hp.select = aD.querySelector('select');
      hp.input = aD.querySelector('input[type=text]');
      hp.slider = aD.querySelector('input[type=range]');
      hp.input.addEventListener('input', e => this._handleInputChange(hp, hp.input), false);
      hp.slider.addEventListener('input', e => this._handleInputChange(hp, hp.slider), false);
      hp.moveButton.addEventListener('click', e => this._handleOffsetInputCommit(hp), false);
      hp.preview = aD.querySelector('.preview');
    }
    if (groups['rotate']) {
      helperPanels['rotate'] = this._createHelperDOM(groups['rotate']);
    }

    this.context.helperPanels = helperPanels;
  }
  _handleScaleInputCommit(helperPanel) {
    this.context.scaleChangeApply(helperPanel, this.fireSet, this.key);
  }
  _handleOffsetInputCommit(helperPanel) {
    this.context.offsetChangeApply(helperPanel, this.fireSet, this.key);
  }
  _handleInputChange(helperPanel, sender) {
    helperPanel.input.value = sender.value;
    helperPanel.slider.value = sender.value;
    this.fireFields.paint(this.contextObject);
  }
  _createHelperDOM(groupDom) {
    let helperDom = document.createElement('div');
    helperDom.setAttribute('class', 'selected-mesh-bounds-helper-box');
    let infoDom = document.createElement('div');
    infoDom.classList.add('info-area');
    helperDom.appendChild(infoDom);
    let actionDom = document.createElement('div');
    actionDom.setAttribute('class', 'action-area');
    helperDom.appendChild(actionDom);
    groupDom.appendChild(helperDom);
    return {
      groupDom,
      helperDom,
      infoDom,
      actionDom
    };
  }
}
