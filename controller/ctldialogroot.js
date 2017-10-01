class ctlDialogRoot {
  constructor(id) {
    let me = this;
    this.dialog = document.getElementById(id);
    this.okBtn = this.dialog.querySelector('.save-details');
    this.cancelBtn = this.dialog.querySelector('.cancel-details');
    this.popupContent = this.dialog.querySelector('.popup-content');

    this.okBtn.addEventListener('click', () => me.save(), false);
  }
  save() {
    this.scrape();
    $(this.dialog).modal('hide');
  }
  scrape() {

  }
  paint() {

  }
  show() {
    this.paint();
    $(this.dialog).modal('show');
    if (this.cancelBtn)
      this.cancelBtn.focus();
    else if (this.okBtn)
      this.okBtn.focus();
  }
}
