class BabylonHelper {
  constructor(canvasName) {
    this.canvas = document.getElementById(canvasName);
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.engine.enableOfflineSupport = false;

    var me = this;
    window.addEventListener("resize", function() {
      me.engine.resize();
    });
  }
  setScene(scene) {
    this.scene = scene;
    var me = this;
    this.engine.stopRenderLoop();
    this.scene.executeWhenReady(function() {
      me.engine.runRenderLoop(function() {
        me.scene.render();
      });
    });
  }
  createDefaultScene() {
    var scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color3(0, 1, 0);
    this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    this.camera.setTarget(BABYLON.Vector3.Zero());
    this.camera.attachControl(this.canvas, false);
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .5;
    var ground = BABYLON.Mesh.CreateGround("ground1", 5, 5, 2, scene);
    return scene;
  }
  loadMesh(meshName, path, fileName, scene) {
    return new Promise(function(resolve, reject) {
      BABYLON.SceneLoader.ImportMesh(meshName, path, fileName, scene, function(newMeshes) {
        return resolve(newMeshes[0]);
      });
    });
  }
  serializeMesh(meshName, path, fileName) {
    var me = this;
    return new Promise(function(resolve, reject) {
      var scene = new BABYLON.Scene(me.engine);
      me.loadMesh(meshName, path, fileName, scene).then(function(newMesh) {
        return resolve(BABYLON.SceneSerializer.Serialize(scene));
      });
    });
  }
  fileToURL(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.addEventListener("loadend", function() {
        resolve(reader.result);
      });
      reader.readAsText(file);
    }, false);
  }
}
