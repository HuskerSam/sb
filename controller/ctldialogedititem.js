/* edit dialog controller - binds to mdlFirebaseList and SCRender */
class ctlDialogEditItem extends ctlDialogRoot {
  constructor(tag) {
    super('#' + tag + '-details-dialog', tag);
    this.fireEditorId = this.tag + '-details-json';
    this.splitViewAlive = true;
    this.initScene = true;
  }
  commit() {
    let me = this;
    return new Promise((resolve, reject) => {
      me._startLoad();
      me.fireFields.scrape();
      let imageDataURL = gAPPP.renderEngine.getJPGDataURL().then((imageDataURL) => {
        let blob = scUtility.dataURItoBlob(imageDataURL);
        me.fireFields.commit(me.fireSet, blob, 'sceneRenderImage.jpg').then((r2) => resolve(r2));
      });
    });
  }
  show(key) {
    this.key = key;
    this.fireData = this.fireSet.fireDataByKey[this.key];
    this.fireFields.setData(this.fireData);
    super.show();
  }
}
