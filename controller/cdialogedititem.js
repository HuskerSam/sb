class cDialogEditItem extends cDialogSuper {
  constructor(tag, title) {
    let d = document.createElement('div');
    d.innerHTML = document.getElementById('scene-builder-edit-dialog-template').innerHTML;
    d.setAttribute('role', 'dialog');
    d.setAttribute('class', 'modal fade edit-modal');
    d.querySelector('.popup-title').innerHTML = title;
    super('#' + tag + '-details-dialog', tag, d);
    this.splitViewAlive = true;
    this.initScene = true;
  }
  _renderImageUpdate() {
    let me = this;
    gAPPP.renderEngine.getJPGDataURL().then((imageDataURL) => {
      let blob = sUtility.dataURItoBlob(imageDataURL);
      me.fireSet.setBlob(me.key, blob, 'sceneRenderImage.jpg').then(uploadResult => {
        let updateInfo = {
          field: 'renderImageURL',
          newValue: uploadResult.downloadURL
        };
        me.fireSet.commitUpdateList([updateInfo], me.key);
      });
    });
  }
  show(key) {
    this.key = key;
    this.fireFields.values = this.fireSet.fireDataByKey[this.key].val();

    if ( ! this.fireFields.values['renderImageURL'] )
      this.fireFields.renderImageUpdateNeeded = true;
    super.show();
  }
}
