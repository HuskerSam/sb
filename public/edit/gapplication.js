'use strict';
window.addEventListener('load', () => new gApplication());
class gApplication extends gAppSuper {
  constructor() {
    super();
    document.addEventListener("keyup", e => {
      if (e.keyCode === 27) {
        this.mV.closeOpenPanels();
      }
    });

    this.a = new gAuthorization();
    document.querySelector('#sign-in-button').addEventListener('click', e => this.a.signIn(), false);
    document.querySelector('#sign-out-button').addEventListener('click', e => this.a.signOut(), false);
  }
}
