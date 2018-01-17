class cViewMain {
  constructor() {
    this.canvasDOM = document.querySelector('#renderCanvas');
    this.context = new wContext(this.canvasDOM, true);
    this.context.activate(null);
    this.key = null;
    this.loadedSceneURL = '';
    gAPPP.a.modelSets['project'].childListeners.push((values, type, fireData) => this.updateProjectList(values, type, fireData));
    this.workplacesSelect = document.querySelector('#workspaces-select');
    this.workplacesSelect.addEventListener('input', e => this.selectProject());
  }
  _updateSelectedScene() {
    if (gAPPP.activeContext !== this.context)
      return;

    let profileKey = gAPPP.a.profile.selectedSceneKey;
    if (! profileKey)
      return;

    if (this.key !== profileKey) {
      let sceneData = gAPPP.a.modelSets['scene'].getCache(profileKey);
      if (sceneData) {
        this.key = profileKey;
        let url = sceneData.url;
        if (this.loadedSceneURL !== sceneData.url) {
          this.loadedSceneURL = sceneData.url;
          this.context.loadSceneURL(this.loadedSceneURL).then(r => {});
        }
      }
    }
  }
  updateProjectList(values, type, fireData) {
    let records = gAPPP.a.modelSets['project'].fireDataValuesByKey;
    let html = '';

    for (let i in records)
      html += `<option value=${i}>${records[i].title}</option>`;
    this.workplacesSelect.innerHTML = html;
    this.workplacesSelect.value = gAPPP.a.profile.selectedWorkspace;
  }
  selectProject() {
    gAPPP.a.modelSets['userProfile'].commitUpdateList([{
      field: 'selectedWorkspace',
      newValue: gAPPP.mV.workplacesSelect.value
    }]);
    setTimeout(() => location.reload(), 100);
  }
}
