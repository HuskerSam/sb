class cSceneToolsBand {
  constructor(domContainer, context) {
    this.expanded = false;
    this.readonlyContext = context;

    this.container = document.createElement('div');
    this.container.setAttribute('class', 'scene-tools-band-container sb-floating-toolbar-item');
    domContainer.appendChild(this.container);

    this.collapseButton = document.createElement('button');
    this.collapseButton.innerHTML = '<i class="material-icons">aspect_ratio</i>';
    this.collapseButton.setAttribute('class', 'btn btn-toolbar-icon');
    this.collapseButton.addEventListener('click', e => this.toggle(), false);
    this.container.appendChild(this.collapseButton);

    this.innerContainer = document.createElement('div');
    this.innerContainer.setAttribute('class', 'sb-floating-toolbar-content');
    this.container.appendChild(this.innerContainer);

    this.fields = sDataDefinition.bindingFieldsCloned('sceneToolsBar');
    this.fieldsContainer = document.createElement('div');
    this.fieldsContainer.setAttribute('class', 'fields-container');
    this.innerContainer.appendChild(this.fieldsContainer);

    this.fireSet = gAPPP.a.modelSets['userProfile'];
    this.fireFields = new cDataView(this.fields, this.fieldsContainer, this);

    this.fireFields.helpers.expandAll();

    this.fireSet.childListeners.push((values, type, fireData) =>{
      this.fireFields._handleDataChange(values, type, fireData);
      this.readonlyContext.refreshFocus();
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
      this.innerContainer.style.display = 'none';
      this.collapseButton.style.background = '';
      this.container.style.display = 'inline-block';
      this.container.style.width = '';
    } else {
      this.expanded = true;
      this.innerContainer.style.display = 'block';
      this.collapseButton.style.background = 'rgba(0,0,0,.2)';
      this.container.style.display = 'flex';
      this.container.style.width = '100%';
    }
  }
}
