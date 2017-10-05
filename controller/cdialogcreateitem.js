class cDialogCreateItem {
  constructor(tag, title) {
    let me = this;
    this.tag = tag;
    this.sC = new cBoundScene();

    let d = document.createElement('div');
    d.innerHTML = document.getElementById('scene-builder-create-dialog-template').innerHTML;
    d.setAttribute('role', 'dialog');
    d.setAttribute('class', 'modal fade create-dialog');
    this.dialog = d;

    this.fileDom = this.dialog.querySelector('input[type="file"]');
    this.createBtn = this.dialog.querySelector('.create');
    this.cancelBtn = this.dialog.querySelector('.cancel');
    this.popupContent = this.dialog.querySelector('.popup-content');
    this.popupButtons = this.dialog.querySelector('.popup-buttons');
    this.progressBar = this.dialog.querySelector('.popup-progress-bar');
    this.dialog.querySelector('.modal-title').innerHTML = title;
    this.titleDom = this.dialog.querySelector('.input-title');
    $(this.dialog).on('hidden.bs.modal', () => me.close()); //force cleanup if closed via escape

    this.cancelBtn.addEventListener('click', () => me.close(), false);
    this.createBtn.addEventListener('click', (e) => me.create(), false);
  }
  close() {
    $(this.dialog).modal('hide');
    gAPPP.renderEngine.renderDefault();
  }
  show() {
    this.popupButtons.style.display = 'block';
    this.popupContent.style.display = 'block';
    this.progressBar.style.display = 'none';
    this.clear();
    $(this.dialog).modal('show');
  }
  clear() {
    this.titleDom.value = '';
    this.fileDom.value = '';
  }
  create() {
    let me = this;
    if (this.titleDom.value.trim() === '') {
      alert('please supply a title');
      return;
    }
    this.popupButtons.style.display = 'none';
    this.popupContent.style.display = 'none';
    this.progressBar.style.display = 'block';
    let title = me.titleDom.value.trim();

    this.sC.uploadObject(this.tag, title, this.fileDom).then((r) => {
      me.clear();
      me.popupButtons.style.display = 'block';
      me.popupContent.style.display = 'block';
      this.progressBar.style.display = 'none';
      me.close();
    });
  }
}
