class cBandProfileOptions {
  constructor(btn, fields, fieldsContainer, panel) {
    this.expanded = false;

    if (!btn)
      btn = document.createElement('button');
    this.collapseButton = btn;
    this.collapseButton.addEventListener('click', e => this.toggle(), false);

    this.fieldsContainer = fieldsContainer;
    this.panel = panel;
    this.fields = fields;
    this.fireSet = gAPPP.a.modelSets['userProfile'];
    this.fireFields = new cPanelData(this.fields, this.fieldsContainer, this);

    this.fireFields.helpers.expandAll();

    this.fireSet.childListeners.push((values, type, fireData) => {
      this.fireFields._handleDataChange(values, type, fireData);
      if (gAPPP.activeContext)
        gAPPP.activeContext.refreshFocus();
    });
    this.fireSet.updatesCallback = (fieldUpdates, key) => this.profileUpdates(fieldUpdates, key);
    this.closeOthersCallback = null;
  }
  profileUpdates(fieldUpdates, key) {
    for (let i = 0; i < fieldUpdates.length; i++) {
      if (fieldUpdates[i].field === 'lightIntensity') {
        gAPPP.a.profile.lightIntensity = fieldUpdates[i].newValue;
        if (gAPPP.activeContext)
          gAPPP.activeContext._updateDefaultLight();
      }
      if (fieldUpdates[i].field === 'fontSize') {
        gAPPP.a.profile.fontSize = fieldUpdates[i].newValue;
        gAPPP._handleDataUpdate();
      }
      if (fieldUpdates[i].field === 'canvasColor') {
        if (gAPPP.a.profile.canvasColor !== fieldUpdates[i].newValue) {
          gAPPP.a.profile.canvasColor = fieldUpdates[i].newValue;
          if (gAPPP.mV.rootBlock)
            gAPPP.mV.rootBlock.__renderSceneOptions();
        }
      }
    }
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
      this.panel.style.display = 'none';
      this.collapseButton.classList.remove('app-inverted');
//      this.collapseButton.style.background = '';
//      this.collapseButton.style.color = '';
    } else {
      if (this.closeOthersCallback && callback)
        this.closeOthersCallback();
      this.expanded = true;
      this.panel.style.display = 'inline-block';
      this.collapseButton.classList.add('app-inverted');
//      this.collapseButton.style.background = gAPPP.appStyleDetails.foreColor;
//      this.collapseButton.style.color = 'white';
    }
  }
}
