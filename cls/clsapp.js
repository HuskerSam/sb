class clsApp {
  constructor() {
    window.isNumeric = function(v) {
      let n = Number(v);
      return !isNaN(parseFloat(n)) && isFinite(n);
    };

    window.gAPPP = this;
    this.storagePrefix = 'https://firebasestorage.googleapis.com/v0/b/husker-ac595.appspot.com/o/';
    this.popupDialogs = new clsInitDialogs();
    this.sceneBuilder = new clsSceneBuilder();
    this.firebaseHelper = new clsFirebaseHelper('#sign-in-button', '#sign-out-button');
  }
  beautify(editor) {
    let val = editor.session.getValue();
    let array = val.split(/\n/);
    array[0] = array[0].trim();
    val = array.join("\n");
    val = js_beautify(val);
    editor.session.setValue(val);
  }
  editor(domId) {
    let e = ace.edit(domId);
    e.setTheme("ace/theme/textmate");
    e.getSession().setMode("ace/mode/json");
    e.setOptions({
      fontFamily: '"Lucida Console",Monaco,monospace',
      fontSize: '9pt'
    });

    return e;
  }
  stringify(obj) {
    let cache = [];
    let result = JSON.stringify(obj, function(key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          return;
        }
        cache.push(value);
      }
      return value;
    });
    cache = null;
    return result;
  }
  path(obj, is, value) {
    if (typeof is == 'string')
      return this.path(obj, is.split('.'), value);
    else if (is.length == 1 && value !== undefined)
      return obj[is[0]] = value;
    else if (is.length == 0)
      return obj;
    else
      return this.path(obj[is[0]], is.slice(1), value);
  }
  emptyPromise() {
    return new Promise((resolve) => resolve());
  }
}
