class cDialogCreateItem {
  constructor(tag, title, hideFileDom) {
    let me = this;
    this.tag = tag;

    let d = document.createElement('div');
    d.innerHTML = document.getElementById('scene-builder-create-dialog-template').innerHTML;
    d.setAttribute('role', 'dialog');
    d.setAttribute('class', 'modal fade create-dialog');
    this.dialog = d;

    this.fileDom = this.dialog.querySelector('input[type="file"]');
    if (hideFileDom)
      this.fileDom.style.display = 'none';
    this.createBtn = this.dialog.querySelector('.create');
    this.cancelBtn = this.dialog.querySelector('.cancel');
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
    gAPPP.mV.activate();
  }
  show() {
    this.popupButtons.style.display = 'block';
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
    this.progressBar.style.display = 'block';
    let title = me.titleDom.value.trim();

    gAPPP.mV.context.uploadObject(this.tag, title, this.fileDom).then((r) => {
      me.clear();
      me.popupButtons.style.display = 'block';
      this.progressBar.style.display = 'none';
      me.close();
    });
  }
}
