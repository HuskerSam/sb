class cChat {
  constructor(panelDiv) {
    this.panel = panelDiv;
    this.panel.innerHTML = this.template();
    this.register();
  }
  register() {
    this.submit_3d_text_msg = this.panel.querySelector('.submit_3d_text_msg');
    this.submit_3d_text_msg.addEventListener('click', e=> this.submitMessage());
  }
  submitMessage() {

  }
  template() {
    return `<div class="cchat_wrapper">
      Message<br>
      <input type="text" class="texttext" value="My Message" />
      <br>
      <input type="text" class="textfontfamily"  list="fontfamilydatalist" />
      <br>
      <label><input type="checkbox" class="textstroke" />
      <span>Open Face</span></label>
      <br>
      <input type="text" class="textmaterial"  list="materialdatatitlelookuplist"/>
      <br>
      Shape
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
      <button class="submit_3d_text_msg">Submit Message</button>
    </div>`;
  }
}
