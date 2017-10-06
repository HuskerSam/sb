class gMainView {
  constructor() {
    this.canvasDOM = document.querySelector('#renderCanvas');
    this.context = new cContext(this.canvasDOM, true);
    this.context.createEmptyScene();
    this.loadedSceneURL = '';
    this.key = null;
    this.fireSet = gAPPP.a.modelSets['scene'];
  }
  show() {
    this.context.activate();
  }
  updateSelectedScene() {
    if (this.key !== gAPPP.a.profile.selectedSceneKey) {
      let sceneData = sceneFireSet.getCache(selectedKey);
      if (sceneData) {
        let url = sceneData.url;
        if (this.loadedSceneURL !== sceneData.url) {
          this.loadedSceneURL = sceneData.url;
          this.context.loadScene(this.loadedSceneURL);
        }
      }
    }
  }
}
