class gMainView {
  constructor() {
    this.canvasDOM = document.querySelector('#renderCanvas');
    this.sC = new cBoundScene(this.canvasDOM, true);
    this.sC.createEmptyScene();
    this.loadedSceneURL = '';
    this.key = null;
    this.fireSet = gAPPP.a.modelSets['scene'];
  }
  show() {
    this.sC.activate();
  }
  updateSelectedScene() {
    if (this.key !== gAPPP.a.profile.selectedSceneKey) {
      let sceneData = sceneFireSet.getCache(selectedKey);
      if (sceneData) {
        let url = sceneData.url;
        if (this.loadedSceneURL !== sceneData.url) {
          this.loadedSceneURL = sceneData.url;
          this.sC.loadScene(this.loadedSceneURL);
        }
      }
    }
  }
}
