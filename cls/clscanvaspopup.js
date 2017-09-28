class clsCanvasPopup {
  constructor(tag, fields) {
    let me = this;
    this.tag = tag;
    this.uiJSON = 'N/A';
    this.dialogQS = '#' + this.tag + '-details-dialog';
    this.dialog = document.querySelector(this.dialogQS);
    this.fileName = 'file.babylon';
    this.babyHelper = null;
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
    this.fireFields = new clsFireFields(this.fields, this.tag + '-fields-', this.fieldsContainer, this.lineBreaks);

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
    let json = gAPPP.stringify(this.uiObject);
    gAPPP.popupDialogs.dialogs['ace-editor-popup'].showAce(json);
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
      document.querySelector(mb).style.height = '100%';
    } else {
      document.querySelector(t).classList.remove('vertical-split-display');
      document.querySelector(b).classList.remove('vertical-split-display');
      document.querySelector(mb).style.height = '';
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
      this.fireEditor = gAPPP.editor(fireEditorId);
      this.fireEditor.$blockScrolling = Infinity;
      this.editors.push(this.fireEditor);
    }
  }
  splitDragEnd() {
    for (let i in this.editors)
      this.editors[i].resize();
  }
  uploadPromise() {
    if (this.tag === 'mesh') {
      let sceneJSON = BABYLON.SceneSerializer.Serialize(this.scene);
      let strScene = JSON.stringify(sceneJSON);
      return gAPPP.firebaseHelper.meshesFireSet.setString(this.fireFields.fireData.key, strScene, this.fileName);
    }
    return gAPPP.emptyPromise();
  }
  commit() {
    let me = this;
    return new Promise((resolve, reject) => {
      me.popupButtons.style.display = 'none';
      me.tabContent.style.display = 'none';
      me.progressBar.style.display = 'block';
      me.fireFields.scrape();

      me.uploadPromise().then((r1) => {
        if (this.tag === 'mesh') {
          me.fireFields.values.url = r1.downloadURL;
        }
        me.fireFields.commit(me.fireSet).then((r2) => resolve(r2));
      });
    });
  }
  close() {
    this.scene = this.babyHelper.createDefaultScene();
    this.babyHelper.setScene(this.scene);
    this.babyHelper.engine.resize();
    this.fireFields.active = false;
    $(this.dialog).modal('hide');
  }
  show(fireData, fireSet) {
    this.fireData = fireData;
    this.fireSet = fireSet;
    this.popupButtons.style.display = 'none';
    this.tabContent.style.display = 'none';
    this.progressBar.style.display = 'block';

    this.initEditors();
    if (this.babyHelper === null)
      this.babyHelper = new clsBabylonHelper(this.canvas);

    this.id = this.fireData.key;
    this.fireFields.setData(fireData);
    $(this.dialog).modal('show');

    this.scene = this.babyHelper.createDefaultScene();
    this.babyHelper.setScene(this.scene);
    this.babyHelper.engine.resize();

    if (this.tag === 'mesh') {
      let url = this.fireFields.values.url.replace(gAPPP.storagePrefix, '');
      let meshName = this.fireFields.values.meshName;
      let me = this;

      this.babyHelper.loadMesh(meshName, gAPPP.storagePrefix, url, this.scene)
        .then((m) => me.finishShow(m));

      return;
    }

    if (this.tag === 'material') {
      let s = this.babyHelper.addSphere('sphere1', 10, 5, this.scene, false);

      let material = new BABYLON.StandardMaterial('material', this.scene);
      s.material = material;
      this.sceneObjects.push(s);
      return this.finishShow({
        type: 'material',
        scene: this.scene,
        m: material
      });
    }

    if (this.tag === 'texture') {
      let values = this.fireData.val();
      let s = this.babyHelper.addGround('ground1', 6, 6, 20, this.scene);
      this.sceneObjects.push(s);

      let material = new BABYLON.StandardMaterial('material', this.scene);
      s.material = material;

      return this.finishShow({
        type: 'texture',
        scene: this.scene,
        m: material
      });
    }

    this.finishShow(null);
  }
  finishShow(uiObject) {
    this.uiObject = uiObject;

    this.fieldsContainer.style.display = 'block';
    this.fireEditor.setValue(JSON.stringify(this.fireFields.values));
    gAPPP.beautify(this.fireEditor);

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
