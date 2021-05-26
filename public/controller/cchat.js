class cChat {
  constructor(panelDiv, app) {
    this.panel = panelDiv;
    this.app = app;
    this.panel.innerHTML = this.template();
    this.register();
  }
  register() {
    this.texttext = this.panel.querySelector('.texttext');
    this.textfontfamily = this.panel.querySelector('.textfontfamily');
    this.textmaterial = this.panel.querySelector('.textmaterial');
    this.shapematerial = this.panel.querySelector('.shapematerial');
    this.cylinderhorizontal = this.panel.querySelector('.cylinderhorizontal');
    this.createshapetype = this.panel.querySelector('.createshapetype');
    this.textfontfamily = this.panel.querySelector('.textfontfamily');
    this.textfontfamily.addEventListener('input', e => {
      this.textfontfamily.style.fontFamily = this.textfontfamily.value;
      this.texttext.style.fontFamily = this.textfontfamily.value;
    });
    this.loadFontList();

    this.submit_3d_text_msg = this.panel.querySelector('.submit_3d_text_msg');
    this.submit_3d_text_msg.addEventListener('click', e => this.postMessage());

    this.status_line = this.panel.querySelector('.status_line');
  }
  async postMessage() {
    let name = 'chatitem_' + Math.floor(100 + Math.random() * 900).toString();

    if (!this.texttext.value.trim()) {
      alert('No msg to send');
      return;
    }

    let csv_row = {
      name,
      texttext: this.texttext.value,
      textfontfamily: this.textfontfamily.value,
      textmaterial: this.textmaterial.value,
      createshapetype: this.createshapetype.value,
      shapematerial: this.shapematerial.value,
      cylinderhorizontal: (this.cylinderhorizontal.checked) ? '1' : '0',
      asset: 'shapeandtext',
      width: "8",
      height: "3",
      depth: "2",
      textdepth: '.25',
      tessellation: '',
      textstroke: '',
      texttextline2: 'user shortname',
      parent: '::scene::_chatWrapper'
    };

    let seconds = Math.round(new Date().getSeconds());
    let angle = -4.0 * Math.PI * (seconds % 60) / 60.0;

    let radius = 15;
    csv_row.x = radius * Math.cos(angle);
    csv_row.z = radius * Math.sin(angle);
    csv_row.y = 5.0;
    csv_row.ry = Math.atan2(csv_row.x, csv_row.z);


    let blockResult = await (new gCSVImport(this.app.loadedWID)).addCSVRow(csv_row);
    let key = blockResult.key;

    this.texttext.value = '';
    this.status_line.innerHTML = 'Sent ' + new Date().toLocaleTimeString();
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
  template() {
    return `<div class="cchat_wrapper app-control">
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
      <div class="status_line">&nbsp;</div>
    </div>`;
  }
}
