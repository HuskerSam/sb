class cBandProfileOptions {
  constructor(btn, fields, fieldsContainer, panel) {
    this.expanded = false;

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
    this.closeOthersCallback = null;
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
      this.collapseButton.style.background = '';
      this.collapseButton.style.color = '';
    } else {
      if (this.closeOthersCallback && callback)
        this.closeOthersCallback();
      this.expanded = true;
      this.panel.style.display = 'inline-block';
      this.collapseButton.style.background = 'rgb(50,50,50)';
      this.collapseButton.style.color = 'white';
    }
  }
}
