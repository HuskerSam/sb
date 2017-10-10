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
      aD.innerHTML = '<input type="range" min="1" max="500" value="100" /><input type="text" value="100" />% <button>Scale</button><div class="preview"></div>';
      hp.scaleButton = aD.querySelector('button');
      hp.scaleInput = aD.querySelector('input[type=text]');
      hp.sliderInput = aD.querySelector('input[type=range]');
      hp.scaleInput.addEventListener('input', e => this._handleScaleInputChange(hp, hp.scaleInput), false);
      hp.sliderInput.addEventListener('input', e => this._handleScaleInputChange(hp, hp.sliderInput), false);
      hp.scalePreview = aD.querySelector('.preview');
    }
    if (groups['offset']) {
      helperPanels['offset'] = this._createHelperDOM(groups['offset']);
    }
    if (groups['rotate']) {
      helperPanels['rotate'] = this._createHelperDOM(groups['rotate']);
    }

    this.context.helperPanels = helperPanels;
  }
  _handleScaleInputChange(helperPanel, sender) {
    helperPanel.scaleInput.value = sender.value;
    helperPanel.sliderInput.value = sender.value;
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
