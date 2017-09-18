class UIHelper {
  constructor() {
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
    let editor = ace.edit(domId);
    editor.setTheme("ace/theme/textmate");
    editor.getSession().setMode("ace/mode/json");
    editor.setOptions({
      fontFamily: '"Lucida Console",Monaco,monospace',
      fontSize: '9pt'
    });

    return editor;
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
}
