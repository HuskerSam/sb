import cWebApplication from "/lib/firestoreapp.js";

export class cApplication extends cWebApplication {
  constructor() {
    super();

    this.loadPickerData();
//    this.a.signInAnon();
  }
}
