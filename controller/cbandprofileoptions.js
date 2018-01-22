class cBandProfileOptions {
  constructor(btn, container, fields, fieldsContainer, panel) {
    this.expanded = false;

    this.collapseButton = btn;
    this.collapseButton.addEventListener('click', e => this.toggle(), false);

    if (container) {
      this.panel = document.createElement('div');
      this.panel.style.display = 'none';
      this.panel.setAttribute('class', 'context-scene-tools-panel');
      this.panelContainer = container;
      this.panelContainer.appendChild(this.panel);
      this.fieldsContainer = document.createElement('div');
      this.fieldsContainer.setAttribute('class', 'fields-container');
      this.panel.appendChild(this.fieldsContainer);
    }
    else {
      this.fieldsContainer = fieldsContainer;
      this.panel = panel;
    }


    this.fields = fields;
    this.fireSet = gAPPP.a.modelSets['userProfile'];
    this.fireFields = new cPanelData(this.fields, this.fieldsContainer, this);

    this.fireFields.helpers.expandAll();

    this.fireSet.childListeners.push((values, type, fireData) => {
      this.fireFields._handleDataChange(values, type, fireData);
      if (gAPPP.activeContext)
        gAPPP.activeContext.refreshFocus();
    });
  }
  activate() {
    this.fireFields.paint();
  }
  deactivate() {
    this.fireFields.active = false;
  }
  toggle() {
    if (this.expanded) {
      this.expanded = false;
      this.panel.style.display = 'none';
      this.collapseButton.style.background = '';
      this.collapseButton.style.color = '';
    } else {
      this.expanded = true;
      this.panel.style.display = 'inline-block';
      this.collapseButton.style.background = 'rgba(0,0,0,.5)';
      this.collapseButton.style.color = 'white';
    }
  }
}
