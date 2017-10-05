/* babylon singleton wrapper - only 1 instance for many canves */
class gRender {
  constructor(defaultCanvas) {
    let me = this;
    this.defaultCanvas = defaultCanvas;
    this.setCanvas(defaultCanvas);
    window.addEventListener("resize", function() {
      if (me.engine)
        me.engine.resize();
    });
    this._disableRender = false;
  }
  setCanvas(canvas) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(this.canvas, false, {
      preserveDrawingBuffer: true
    });
    this.engine.enableOfflineSupport = false;
  }
  restart() {
    this.setCanvas(this.canvas);
    this.setSceneDetails(this.sceneDetails)
  }
  setSceneDetails(sceneDetails) {
    this.sceneDetails = sceneDetails;
    this.enableRender();
    gAPPP.renderEngine.sceneDetails.scene.clearColor = gAPPP.renderEngine.color(gAPPP.a.profile.canvasColor);
  }
  renderFrame() {
    if (!this._disableRender)
      if (this.sceneDetails.scene) {
        this.sceneDetails.scene.render();
      }
  }
  disableRender() {
    this._disableRender = true;
    this.engine.stopRenderLoop();
  }
  enableRender() {
    let me = this;
    this._disableRender = false;
    this.engine.stopRenderLoop();
    this.sceneDetails.camera.attachControl(this.canvas, false);
    this.sceneDetails.scene.executeWhenReady(() => {
      me.engine.runRenderLoop(() => me.renderFrame());
    });
    this.engine.resize();
  }
  loadScene(path, fileName) {
    let me = this;
    return new Promise(function(resolve, reject) {
      BABYLON.SceneLoader.Load(path, fileName, me.engine, scene => {
        return resolve(scene);
      });
    });
  }
  getJPGDataURL() {
    let me = this;
    return new Promise((resolve, reject) => {
      BABYLON.Tools.CreateScreenshot(me.engine, me.sceneDetails.camera, {
        width: 500
      }, (base64Image) => resolve(base64Image));
    });
  }
  setDefaultSceneDetails(sceneDetails) {
    this.defaultSceneDetails = sceneDetails;
  }
  renderDefault() {
    this.setCanvas(this.defaultCanvas);
    this.setSceneDetails(this.defaultSceneDetails);
  }
  color(str) {
    if (!str) {
      str = '1,1,1';
    }
    let parts = str.split(',');
    let cA = [];
    return new BABYLON.Color3(Number(parts[0]), Number(parts[1]), Number(parts[2]));
  }
  colorRGB255(str) {
    let bC = this.color(str);
    if (isNaN(bC.r))
      bC.r = 1;
    if (isNaN(bC.g))
      bC.g = 1;
    if (isNaN(bC.b))
      bC.b = 1;

    return 'rgb(' + (bC.r * 255.0).toFixed(0) + ',' + (bC.g * 255.0).toFixed(0) + ',' + (bC.b * 255.0).toFixed(0) + ')'
  }
  setColorLabel(dom, defaultValue) {
    let v = dom.value;
    if (v === '')
      if (defaultValue)
        v = defaultValue;

    let rgb = '';
    if (v !== '')
      rgb = gAPPP.renderEngine.colorRGB255(v);
    dom.parentNode.style.background = rgb;
  }
  importMesh(file, meshName) {
    let me = this;
    return new Promise((resolve, reject) => {
      sUtility.fileToURI(file)
        .then(d => me.serializeMesh(meshName, "", "data:" + d)
          .then(strMesh => resolve(strMesh)));
    });
  }

  loadMesh(meshName, path, fileName, scene) {
    let me = this;
    if (meshName === undefined)
      meshName = '';
    return new Promise((resolve, reject) => {
      BABYLON.SceneLoader.ImportMesh(meshName, path, fileName, scene,
        (newMeshes, particleSystems, skeletons) => {
          return resolve(newMeshes[0]);
        }, progress => {},
        err => reject(err));
    });
  }
  serializeMesh(meshName, path, fileName) {
    var me = this;
    return new Promise((resolve, reject) => {
      let scene = new BABYLON.Scene(me.engine);
      me.loadMesh(meshName, path, fileName, scene).then(newMesh => {
        resolve(BABYLON.SceneSerializer.Serialize(scene));
        scene.dispose();
      });
    });
  }
}
