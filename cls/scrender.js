class SCRender {
  constructor(defaultCanvas) {
    let me = this;
    this.defaultCanvas = defaultCanvas;
    this.setCanvas(defaultCanvas);
    window.addEventListener("resize", function() {
      if (me.engine)
        me.engine.resize();
    });
  }
  setCanvas(canvas) {
    this.canvas = canvas;
    this.engine = new BABYLON.Engine(this.canvas, true, {preserveDrawingBuffer: true});
    this.engine.enableOfflineSupport = false;
  }
  setSceneDetails(sceneDetails) {
    this.scene = sceneDetails.scene;
    this.sceneDetails = sceneDetails;
    sceneDetails.camera.attachControl(this.canvas, false);
    var me = this;
    this.engine.stopRenderLoop();
    this.scene.executeWhenReady(function() {
      me.engine.runRenderLoop(function() {
        me.scene.render();
      });
    });
    this.engine.resize();
  }
  addSphere(name, faces, diameter, scene, refresh) {
    if (!refresh)
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
  loadScene(path, fileName) {
    let me = this;
    return new Promise(function(resolve, reject) {
      BABYLON.SceneLoader.Load(path, fileName, me.engine, function(scene) {
        return resolve(scene);
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
      materialName: '',
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
  getNewSceneData() {
    return {
      title: 'Mesh',
      url: '',
      type: 'url',
      size: 0,
      simpleUIDetails: {}
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
      diffuseColor: '',
      diffuseTextureName: '',
      emissiveColor: '',
      emissiveTextureName: '',
      ambientColor: '',
      ambientTextureName: '',
      specularColor: '',
      specularTextureName: '',
      specularPower: 64.0,
      useSpecularOverAlpha: false,
      useGlossinessFromSpecularMapAlpha: false,
      backFaceCulling: true,
      wireframe: false
    };
  }
  getJPGDataURL() {
    let me = this;
    return new Promise((resolve, reject) => {
      BABYLON.Tools.CreateScreenshot(me.engine, me.sceneDetails.camera, { width: 500 }, (base64Image) => resolve(base64Image));
    });
  }
  setDefaultSceneDetails(sceneDetails) {
    this.defaultSceneDetails = sceneDetails;
  }
  renderDefault() {
    this.setCanvas(this.defaultCanvas);
    this.setSceneDetails(this.defaultSceneDetails);
  }
}
