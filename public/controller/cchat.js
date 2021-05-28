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
    this.next_message_status = this.panel.querySelector('.next_message_status');
    this.updateMessageStatus();
    this.loadFontList();
    this.loadMaterialLists();

    this.submit_3d_text_msg = this.panel.querySelector('.submit_3d_text_msg');
    this.submit_3d_text_msg.addEventListener('click', e => this.postMessage());

    this.status_line = this.panel.querySelector('.status_line');
  }
  loadMaterialLists() {
    let materials = document.querySelector('#materialdatatitlelookuplist');

    this.textmaterial.innerHTML = materials.innerHTML;
    this.textmaterial.value = 'circuit_wood1';

    this.shapematerial.innerHTML = materials.innerHTML;
    this.shapematerial.value = 'circuit_metal2';
  }
  updateMessageStatus() {
    if (!this.next_message_status)
      return;

    let lastMessageDate = gAPPP.appData.lastMessageDate;
    let lD = new Date(gAPPP.appData.lastMessageDate);
    let validDate = !isNaN(lD.getTime());
    let msg_gap = 10000;
    if (validDate && (new Date() - lD) < msg_gap) {
      let time_to_next = Math.round((msg_gap - (new Date() - lD)) / 1000.0);
      this.next_message_status.innerHTML = 'Next: ' + time_to_next.toString();
      setTimeout(() => this.updateMessageStatus(), 500);
    } else {
      this.next_message_status.innerHTML = 'Last: ' + (validDate ? lD.toLocaleTimeString() : 'none');
    }
  }
  async postMessage() {
    //firebase.database().ref('applicationData/lastMessageDate').set(new Date().toISOString());
    if (!this.texttext.value) {
      alert('msg required');
      return;
    }

    let displayName = gAPPP.a.profile.displayName;
    if (!displayName)
      displayName = 'Anonymous';

    let serverId = firebase.app().options.projectId;
    let url = 'https://us-central1-' + serverId + '.cloudfunctions.net/post3dmessage';
    //url = 'http://localhost:5001/handtopbuilder/us-central1/post3dmessage';
    url += '?id=' + encodeURIComponent(gAPPP.loadedWID);
    url += '&texttext=' + encodeURIComponent(this.texttext.value);
    url += '&createshapetype=' + encodeURIComponent(this.createshapetype.value);
    url += '&textmaterial=' + encodeURIComponent(this.textmaterial.value);
    url += '&shapematerial=' + encodeURIComponent(this.shapematerial.value);
    url += '&textfontfamily=' + encodeURIComponent(this.textfontfamily.value);
    url += '&displayname=' + encodeURIComponent(displayName);
    url += '&cylinderhorizontal=' + (this.cylinderhorizontal.checked ? '1' : '0');
    let genResponse = await fetch(url, {
      method: "post"
    });
    let gr = await genResponse.text();
    let genResults = JSON.parse(gr);

    if (genResults.success) {
      this.texttext.value = '';
    } else {
    }
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
      <div class="next_message_status">&nbsp;</div>
      <input type="text" class="texttext" value="" />
      <br>
      <select class="textfontfamily"></select>
      <br>
      <select class="textmaterial"></select>
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
      <select class="shapematerial"></select>
      <br>
      <button class="submit_3d_text_msg">Submit</button>
      <div class="status_line">&nbsp;</div>
    </div>`;
  }
}
