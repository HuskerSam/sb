class gMainView {
  constructor() {
    this.canvasDOM = document.querySelector('#renderCanvas');
    this.context = new cContext(this.canvasDOM, true);
    this.context.reset();
    this.key = null;
    this.fireSet = gAPPP.a.modelSets['scene'];
  }
  show() {
    this.context.activate();
  }
  updateSelectedScene() {
    let profileKey = gAPPP.a.profile.selectedSceneKey;
    if (this.key !== profileKey) {
      let sceneData = this.fireSet.getCache(profileKey);
      if (sceneData) {
        this.key = profileKey;
        let url = sceneData.url;
        if (this.loadedSceneURL !== sceneData.url) {
          this.loadedSceneURL = sceneData.url;
          this.context._loadSceneFromData(sceneData);
          this.context.activate();
        }
      }
    }
  }
}
