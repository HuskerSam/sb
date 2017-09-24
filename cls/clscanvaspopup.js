class clsCanvasPopup {
  constructor(dialogQS, canvasQS, tabs, fields, editorIds, splitQS) {
    let me = this;
    this.dialog = document.querySelector(dialogQS);
    this.fields = fields;
    this.fieldsContainer = this.dialog.querySelector('.fields-container')
    this.fireFields = new FireFields(fields, this.fieldsContainer);
    this.tabs = tabs;
    this.serializeScene = true;
    this.fileName = 'file.babylon';

    if (!this.dialog.showModal) {
      dialogPolyfill.registerDialog(this.dialog);
    }

    this.babyHelper = new BabylonHelper(canvasQS);
    this.scene = this.meshEditBabyHelper.createDefaultScene();
    this.babyHelper.setScene(this.scene);

    this.editorIds = editorsIds;
    this.editors = [];
    for (let i in editorIds) {
      let id = editorIds[i];
      this.editors.push(gG.editor(id));
    }

    this.buttonBar = this.dialog.querySelector('.canvas-popup-button-bar');
    this.progressBar = this.dialog.querySelector('.canvas-popup-progress-bar');

    this.closeButton = this.buttonBar.querySelector('.close-details');
    this.saveButton = this.buttonBar.querySelector('.save-details');

    this.closeButton.addEventListener('click', () => me.close());
    this.saveButton.addEventListener('click', () => me.save());

    this.tabButtons = [];
    this.tabPanels = [];

    function initTab(tab) {
      let btn = this.dialog.querySelector('tab-button-' + tab);
      let pnl = this.dialog.querySelector('tab-panel-' + tab);
      me.tabButtons.push(btn);
      me.tabPanels.push(pnl);
      btn.addEventListener('click', (e) => me.showTab(pnl), false);
    }
    for (let i in this.tabs) {
      let tab = this.tabs[i];
      initTab(tab);
    }

    this.splitQS = splitQS;
    window.Split(splitQS, {
      minSize: [100, 100],
      direction: 'vertical'
    });
  }
  showTab(tab) {
    for (let i in this.tabPanels)
      this.tabPanels[i].style.display = 'none';

    tab.style.display = '';
  }
  uploadPromise() {
    if (this.serializeScene) {
      let sceneJSON = BABYLON.SceneSerializer.Serialize(this.scene);
      let strScene = JSON.stringify(sceneJSON);
      return this.fireSet.setString(me.meshId, strScene, this.fileName);
    }

    return gG.emptyPromise();
  }
  commit() {
    let me = this;
    return new Promise((resolve, reject) => {
      me.buttonBar.style.display = 'none';
      me.progressBar.style.display = '';
      me.fireFields.scrape();

      me.uploadPromise().then((r1) => {
        me.fireFields.values.url = r1.downloadURL;
        me.fireFields.commit().then((r2) => resolve(r2));
      });
    });
  }
  show(fireData) {
    this.fireFields.container.style.display = 'none';
    this.buttonBar.style.display = 'none';
    this.progressBar.style.display = '';
    this.id = fireData.key;
    this.fireSet.setData(fireData);

    this.dialog.showModal();

    this.editors[0].setValue(JSON.stringify(this.fireSet.values));
    gG.beautify(this.editors[0]);

    this.babyHelper.engine.resize();
    this.showTab(this.tabPanels[0]);

    let url = this.fireSet.values.url.replace(gG.storagePrefix, '');
    let meshName = this.fireSet.values.meshName;
    let me = this;

    this.babyHelper.loadMesh(meshName, gG.storagePrefix, url, this.scene)
      .then((m) => me.finishShow(m));
  }
  finishShow(uiObject) {
    this.uiObject = uiObject;

    let s = gG.stringify(m);
    this.editors[1].setValue(s);
    gG.beautify(this.editors[1]);
    this.meshFireFields.paint(firebaseMeshData, this.uiObject);
    this.fireFields.container.style.display = '';
    this.buttonBar.style.display = '';
    this.progressBar.style.display = 'none';
  }
  save() {
    this.commit().then((result) => {
      me.buttonBar.style.display = '';
      me.progressBar.style.display = 'none';
      this.close();
    });
  }
  close() {
    this.dialog.close();
  }
}
