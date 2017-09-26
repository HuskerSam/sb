class clsToolbarItem {
  constructor(tag, title) {
    let me = this;
    this.tag = tag;
    this.title = title;
    this.container = document.querySelector('#sb-floating-toolbar');
    let d = this.container.querySelector('#sb-floating-toolbar-item-template').cloneNode(true);
    this.wrapper = d.querySelector('.sb-floating-toolbar-item');

    this.wrapper.id = 'sb-' + this.tag + '-floating-toolbar-item';
    this.container.appendChild(this.wrapper);
    this.wrapper.querySelector('.button-title').innerHTML = this.title;

    this.bar = this.wrapper.querySelector('.sb-floating-toolbar-content');
    this.createBtn = this.wrapper.querySelector('.sb-floating-toolbar-create-btn');
    this.expandBtn = this.wrapper.querySelector('.sb-floating-toolbar-expand-btn')

    this.expandBtn.addEventListener('click', (e) => me.toggle(), false);
    this.createBtn.addEventListener('click', (e) => me.showPopup(), false);
  }
  toggle() {
    if (this.bar.style.display !== 'inline-block') {
      this.bar.style.display = 'inline-block';
      this.createBtn.style.display = 'inline-block';
      this.bar.parentNode.style.display = 'block';
      this.bar.parentNode.parentNode.insertBefore(this.bar.parentNode, this.bar.parentNode.parentNode.childNodes[0]);
    //  this.expandBtn.querySelector('i').innerHTML = 'expand_more';
      this.wrapper.style.display = 'flex';
    } else {
      this.bar.style.display = 'none';
      this.createBtn.style.display = 'none';
      this.bar.parentNode.style.display = 'inline-block';
  //    this.expandBtn.querySelector('i').innerHTML = 'expand_less';
      this.bar.parentNode.parentNode.insertBefore(this.bar.parentNode, null);
      this.wrapper.style.display = 'inline-block';
    }
  }
  showPopup() {
    gAPPP.popupDialogs.dialogs[this.tag + '-create'].show();
  }
}
