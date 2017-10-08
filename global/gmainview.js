class gMainView {
  constructor() {
    this.canvasDOM = document.querySelector('#renderCanvas');
    this.context = new cContext(this.canvasDOM, true);
    this.context.activate(null);
    this.key = null;
    this.loadedSceneURL = '';
    this.fireSet = gAPPP.a.modelSets['scene'];
  }
  _updateSelectedScene() {
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
          this.context.loadSceneURL(this.loadedSceneURL).then(r => {});
        }
      }
    }
  }
}
