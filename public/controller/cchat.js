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
    return `<div class="shape_and_text_block_options">
      <span>Line 1</span>
      <input type="text" class="texttext" value="My Message" />
      <br>
      <span>Line 2</span>
      <input type="text" class="texttextline2" />
      <br>
      <span>Font</span>
      <input type="text" class="textfontfamily"  list="fontfamilydatalist" />
      <br>
      <span>Open Face</span>
      <input type="checkbox" style="width:1.25em;line-height:1.5em" class="textstroke" />
      <br>
      <span>Text Material</span>
      <input type="text" class="textmaterial"  list="materialdatatitlelookuplist"/>
      <br>
      <span>Shape Type</span>
      <select class="createshapetype">
        <option>cube</option>
        <option>box</option>
        <option selected>cone</option>
        <option>cylinder</option>
        <option>sphere</option>
        <option>ellipsoid</option>
      </select>
      <br>
      <span>Rotate 90°</span>
      <input type="checkbox" style="width:1.25em;line-height:1.5em" class="cylinderhorizontal" />
      <br>

      <td>Shape Material</span>
      <input type="text" class="shapematerial" list="materialdatatitlelookuplist" />
      <br>
      <button class="submit_3d_text_msg">Submit Message</button>
    </div>`;
  }
}
