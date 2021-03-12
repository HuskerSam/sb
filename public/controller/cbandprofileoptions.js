class cBandProfileOptions {
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
    this.fireSet = gAPPP.a.modelSets['userProfile'];
    this.fireFields = new cPanelData(this.fields, this.fieldsContainer, this);

    this.fireFields.helpers.expandAll();

    this.fireSet.childListeners.push((values, type, fireData) => {
      this.fireFields._handleDataChange(values, type, fireData);
      if (gAPPP.activeContext)
        gAPPP.activeContext.refreshFocus();
    });

    //limited use preview of updates before they're sent - for fast UI refresh
    this.fireSet.updatesCallback = (fieldUpdates, key) => this.profileUpdatesPreview(fieldUpdates, key);
    this.closeOthersCallback = null;
  }
  profileUpdatesPreview(fieldUpdates, key) {
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
