class gMainView {
  constructor() {
    this.canvasDOM = document.querySelector('#renderCanvas');
    this.context = new cContext(this.canvasDOM, true);
    this.context.reset();
    this.key = null;
    this.fireSet = gAPPP.a.modelSets['scene'];
  }
  show() {
    this.context.reset();
    this.updateSelectedScene();
  }
  updateSelectedScene() {
    if (gAPPP.activeContext !== this.context)
      return;

    let profileKey = gAPPP.a.profile.selectedSceneKey;
    if (! profileKey)
      return;

    if (this.key !== profileKey) {
      let sceneData = this.fireSet.getCache(profileKey);
      if (sceneData) {
        this.key = profileKey;
        let url = sceneData.url;
        if (this.loadedSceneURL !== sceneData.url) {
          this.loadedSceneURL = sceneData.url;
          this.context._loadSceneFromData(sceneData).then(r => this.context.activate());
        }
      }
    }
  }
}
