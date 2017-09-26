class clsBabylonHelper {
  constructor(canvas) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.engine.enableOfflineSupport = false;

    let me = this;
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
    let scene = new BABYLON.Scene(this.engine);
    scene.clearColor = new BABYLON.Color3(0, 1, 0);
    this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
    this.camera.setTarget(BABYLON.Vector3.Zero());
    this.camera.attachControl(this.canvas, false);
    let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = .5;
    return scene;
  }
  addSphere(name, faces, diameter, scene, refresh) {
    if (! refresh)
      refresh = false;
    return BABYLON.Mesh.CreateSphere(name, faces, diameter, scene, refresh);
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
}
