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
  addGround(name, width, depth, subdivs, scene) {
    let ground = BABYLON.Mesh.CreateGround("ground1", 6, 6, 2, scene);
    return ground;
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
  getNewMeshData() {
    return {
      title: 'Mesh',
      name: '',
      url: '',
      type: 'url',
      size: 0,
      simpleUIDetails: {
        scaleX: 1.0,
        scaleY: 1.0,
        scaleZ: 1.0,
        positionX: 0.0,
        positionY: 0.0,
        positionZ: 0.0,
        rotateX: 0.0,
        rotateY: 0.0,
        rotateZ: 0.0
      }
    };
  }
  getNewTextureData() {
    return {
      title: 'Texture',
      url: '',
      vOffset: 0.0,
      uOffset: 0.0,
      vScale: 1.0,
      uScale: 1.0,
      hasAlpha: false
    };
  }
  getNewMaterialData() {
    return {
      title: 'Material',
      name: '',
      alpha: 1.0,
      diffuseTextureColor: '',
      diffuseTextureName: '',
      emissiveTextureColor: '',
      emissiveTextureName: '',
      ambientTextureColor: '',
      ambientTextureName: '',
      specularTextureColor: '',
      specularTextureName: '',
      specularPower: 64.0,
      useSpecularOverAlpha: false,
      useGlossinessFromSpecularMapAlpha: false,
      backFaceCulling: true,
      wireframe: false
    };
  }
}
