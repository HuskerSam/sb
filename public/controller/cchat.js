class cChat {
  constructor(panelDiv) {
    this.panel = panelDiv;
    this.panel.innerHTML = this.template();
    this.register();
  }
  register() {
    this.submit_3d_text_msg = this.panel.querySelector('.submit_3d_text_msg');
    this.submit_3d_text_msg.addEventListener('click', e=> this.submitMessage());

    this.texttext = this.panel.querySelector('.texttext');
    this.textfontfamily = this.panel.querySelector('.textfontfamily');
    this.textfontfamily.addEventListener('input', e => {
      this.textfontfamily.style.fontFamily = this.textfontfamily.value;
      this.texttext.style.fontFamily = this.textfontfamily.value;
    });
    this.loadFontList();
  }
  loadFontList() {
    let fonts = document.querySelector('#fontfamilydatalist');
    if (!fonts)
      return setTimeout(() => this.loadFontList(), 500);

    if (!document.querySelector('#fontfamilydatalist option'))
      return setTimeout(() => this.loadFontList(), 500);

    this.textfontfamily.innerHTML = fonts.innerHTML;
    this.textfontfamily.value = 'Georgia';
    this.textfontfamily.style.fontFamily = this.textfontfamily.value;
    this.texttext.style.fontFamily = this.textfontfamily.value;
  }
  submitMessage() {

  }
  template() {
    return `<div class="cchat_wrapper">
      Message<br>
      <input type="text" class="texttext" value="" />
      <br>
      <select type="text" class="textfontfamily"></select>
      <br>
      <label><input type="checkbox" class="textstroke" />
      <span>Open Face</span></label>
      <br>
      <input type="text" class="textmaterial"  list="materialdatatitlelookuplist"/>
      <br>

      <select class="createshapetype">
        <option>cube</option>
        <option>box</option>
        <option selected>cone</option>
        <option>cylinder</option>
        <option>sphere</option>
        <option>ellipsoid</option>
      </select>
      <label>
        <input type="checkbox" class="cylinderhorizontal" />
        <span>Rotate 90°</span>
      </label>
      <br>
      <input type="text" class="shapematerial" list="materialdatatitlelookuplist" />
      <br>
      <button class="submit_3d_text_msg">Submit</button>
    </div>`;
  }
}
