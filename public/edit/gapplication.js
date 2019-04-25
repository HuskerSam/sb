'use strict';
class gApplication extends gAppSuper {
  constructor() {
    super();
    document.addEventListener("keyup", e => {
      if (e.keyCode === 27) {
        if (this.mV)
          this.mV.closeOpenPanels();
      }
    });

    this.a = new gAuthorization();
    this.a.signInWithURL();
    document.querySelector('#sign-in-button').addEventListener('click', e => this.a.signIn(), false);
    this.emailBtn = document.querySelector('#sign-in-email-button');
    this.emailBtn.addEventListener('click', e => {
      let email = document.querySelector('#sign-in-by-email-link').value;
      this.a.signInByEmail(email);
      this.emailBtn.innerHTML = 'Email Sent';
      setTimeout(() => this.emailBtn.innerHTML = 'Send Link', 5000);
    }, false);
    document.querySelector('#sign-out-button').addEventListener('click', e => this.a.signOut(), false);

    this.loadDataLists('sbimageslist').then(() => {});
    this.loadDataLists('sbmesheslist').then(() => {});
    this.loadDataLists('skyboxlist').then(() => {});
    this.loadDataLists('fontfamilydatalist').then(() => {});
  }
  loadDataLists(name) {
    return fetch(`/global/${name}.json`)
      .then(rrr => rrr.json())
      .then(json => {
        let list = document.getElementById(name);
        if (!list) {
          list = document.createElement('datalist');
          list.setAttribute('id', name);
          document.body.appendChild(list);
        }
        let outHtml = '';
        for (let c = 0, l = json.length; c < l; c++)
          outHtml += `<option>${json[c]}</option>`
        list.innerHTML = outHtml;
      });
  }
}
