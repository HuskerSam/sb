class scUtility {
  static beautify(editor) {
    let val = editor.session.getValue();
    let array = val.split(/\n/);
    array[0] = array[0].trim();
    val = array.join("\n");
    val = js_beautify(val);
    editor.session.setValue(val);
  }
  static editor(domId) {
    let e = ace.edit(domId);
    e.setTheme("ace/theme/textmate");
    e.getSession().setMode("ace/mode/json");
    e.setOptions({
      fontFamily: '"Lucida Console",Monaco,monospace',
      fontSize: '9pt'
    });

    return e;
  }
  static stringify(obj) {
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
  static path(obj, is, value) {
    if (typeof is == 'string')
      return this.path(obj, is.split('.'), value);
    else if (is.length == 1 && value !== undefined)
      return obj[is[0]] = value;
    else if (is.length == 0)
      return obj;
    else
      return this.path(obj[is[0]], is.slice(1), value);
  }
  static fileToURI(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.addEventListener("loadend", function() {
        resolve(reader.result);
      });
      reader.readAsText(file);
    }, false);
  }
  static dataURItoBlob(dataURI) {
    let byteString = atob(dataURI.split(',')[1]);
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    let blob = new Blob([ab], {
      type: mimeString
    });
    return blob;
  }
}
