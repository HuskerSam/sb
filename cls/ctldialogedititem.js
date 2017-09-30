/* edit dialog controller - binds to mdlFirebaseList and SCRender */
'use strict';
class CTLDialogEditItem {
  constructor(tag, fields, fireSetTag) {
    let me = this;
    this.tag = tag;
    this.fireSetTag = fireSetTag;
    this.uiJSON = 'N/A';
    this.dialogQS = '#' + this.tag + '-details-dialog';
    this.dialog = document.querySelector(this.dialogQS);
    this.fileName = 'file.babylon';
    this.editors = null;
    this.sceneObjects = [];

    this.progressBar = this.dialog.querySelector('.popup-progress-bar');
    this.okBtn = this.dialog.querySelector('.save-details');
    this.cancelBtn = this.dialog.querySelector('.close-details');
    this.rotateBtn = this.dialog.querySelector('.rotate-details');
    this.tabContent = this.dialog.querySelector('.tab-content');
    this.popupButtons = this.dialog.querySelector('.popup-buttons');
    this.sceneJSONBtn = this.dialog.querySelector('.scene-pill-button');

    this.fields = fields;
    this.fieldsContainer = this.dialog.querySelector('.fields-container');
    this.fieldsContainer.style.display = 'none';
    this.fireFields = new CTLBoundFields(this.fields, this.tag + '-fields-', this.fieldsContainer, this);

    this.canvas = this.dialog.querySelector('.popup-canvas');

    this.cancelBtn.addEventListener('click', () => me.close(), false);
    this.okBtn.addEventListener('click', () => me.save(), false);
    this.rotateBtn.addEventListener('click', () => me.rotateView(), false);
    if (this.sceneJSONBtn)
      this.sceneJSONBtn.addEventListener('click', () => me.showSceneJSON(), false);
    this.tabButtons = [];
    this.tabPanels = [];

    this.rotateState = 'vertical';
    this.splitView();
  }
  showSceneJSON() {
    let json = gAPPP.u.stringify(this.uiObject);
    gAPPP.dialogs['ace-editor-popup'].showAce(json);
  }
  splitView() {
    if (this.splitInstance)
      this.splitInstance.destroy();

    let t = this.dialogQS + ' .popup-canvas';
    let b = this.dialogQS + ' .popup-details';
    let mb = this.dialogQS + ' .popup-main-body';

    if (this.rotateState === 'horizontal') {
      document.querySelector(t).classList.add('vertical-split-display');
      document.querySelector(b).classList.add('vertical-split-display');
    } else {
      document.querySelector(t).classList.remove('vertical-split-display');
      document.querySelector(b).classList.remove('vertical-split-display');
    }

    let me = this;
    this.splitInstance = window.Split([t, b], {
      sizes: [50, 50],
      direction: this.rotateState,
      onDragEnd: () => me.splitDragEnd()
    });
  }
  rotateView() {
    if (this.rotateState === 'vertical') {
      this.rotateState = 'horizontal';
    } else {
      this.rotateState = 'vertical';
    }
    this.splitView();
  }
  initEditors() {
    if (this.editors !== null)
      return;

    this.editors = [];
    let fireEditorId = this.tag + '-details-json';
    if (this.dialog.querySelector('#' + fireEditorId)) {
      this.fireEditor = gAPPP.u.editor(fireEditorId);
      this.fireEditor.$blockScrolling = Infinity;
      this.editors.push(this.fireEditor);
    }
  }
  splitDragEnd() {
    for (let i in this.editors)
      this.editors[i].resize();
  }
  commit() {
    let me = this;
    return new Promise((resolve, reject) => {
      me.popupButtons.style.display = 'none';
      me.tabContent.style.display = 'none';
      me.progressBar.style.display = 'block';
      me.fireFields.scrape();
      let imageDataURL = gAPPP.renderEngine.getJPGDataURL().then((imageDataURL) => {
        let blob = gAPPP.u.dataURItoBlob(imageDataURL);
        me.fireFields.commit(me.fireSet, blob, 'sceneRenderImage.jpg').then((r2) => resolve(r2));
      });
    });
  }
  uploadSceneFile() {
    let sceneJSON = BABYLON.SceneSerializer.Serialize(this.scene);
    let strScene = JSON.stringify(sceneJSON);
    return gAPPP.a.meshesFireSet.setString(this.fireFields.fireData.key, strScene, this.fileName);
    if (this.tag === 'mesh') {
      me.fireFields.values.url = r1.downloadURL;
    }
  }
  close() {
    this.fireFields.active = false;
    $(this.dialog).modal('hide');
    gAPPP.renderEngine.renderDefault();
  }
  show(key) {
    this.key = key;
    this.fireSet = gAPPP.a.modelSets[this.fireSetTag];
    this.fireData = this.fireSet.fireDataByKey[this.key];

    this.popupButtons.style.display = 'none';
    this.tabContent.style.display = 'none';
    this.progressBar.style.display = 'block';

    this.initEditors();

    this.fireFields.setData(this.fireData);
    $(this.dialog).modal('show');

    gAPPP.renderEngine.setCanvas(this.canvas);
    let sceneDetails = gAPPP.sceneController.createDefaultScene();
    this.sceneDetails = sceneDetails;
    gAPPP.renderEngine.setSceneDetails(this.sceneDetails);
    this.scene = sceneDetails.scene;

    if (this.tag === 'mesh') {
      let url = this.fireFields.values.url.replace(gAPPP.storagePrefix, '');
      let meshName = this.fireFields.values.meshName;
      let me = this;

      gAPPP.renderEngine.loadMesh(meshName, gAPPP.storagePrefix, url, this.scene)
        .then((mesh) => me.finishShow({
          type: 'mesh',
          mesh
        }));

      return;
    }
    if (this.tag === 'scene') {
      let url = this.fireFields.values.url.replace(gAPPP.storagePrefix, '');
      let me = this;

      gAPPP.renderEngine.loadScene(gAPPP.storagePrefix, url)
        .then((scene) => {
          me.scene = scene;
//          me.scene.clearColor = gAPPP.renderEngine.color(gAPPP.a.profile.canvasColor);
      me.finishShow({
            type: 'scene',
            scene: me.scene
          });
        });
      return;
    }

    if (this.tag === 'material') {
      let s = gAPPP.renderEngine.addSphere('sphere1', 10, 5, this.scene, false);

      let material = new BABYLON.StandardMaterial('material', this.scene);
      s.material = material;
      this.sceneObjects.push(s);
      return this.finishShow({
        type: 'material',
        mesh: s,
        material,
        scene: this.scene
      });
    }

    if (this.tag === 'texture') {
      let values = this.fireData.val();
      let s = gAPPP.renderEngine.addGround('ground1', 6, 6, 20, this.scene);
      this.sceneObjects.push(s);

      let material = new BABYLON.StandardMaterial('material', this.scene);
      s.material = material;

      return this.finishShow({
        type: 'texture',
        mesh: s,
        material,
        scene: this.scene
      });
    }

    this.finishShow(null);
  }
  finishShow(uiObject) {
    this.uiObject = uiObject;

    this.fieldsContainer.style.display = 'block';
    this.fireEditor.setValue(JSON.stringify(this.fireFields.values));
    gAPPP.u.beautify(this.fireEditor);

    this.fireFields.paint(this.uiObject);
    this.popupButtons.style.display = 'block';
    this.tabContent.style.display = 'block';
    this.progressBar.style.display = 'none';

    this.cancelBtn.focus();
  }
  save() {
    let me = this;
    this.commit().then((result) => {
      this.popupButtons.style.display = 'block';
      this.tabContent.style.display = 'block';
      this.progressBar.style.display = 'none';
      me.close();
    });
  }
}
