var scenebuilder = {};

scenebuilder.init = function() {
  let me = this;
  this.meshesCollapseButton = document.getElementById('collapse-meshes');
  this.meshesCollapsePanel = document.getElementById('models-content');
  this.skinsCollapseButton = document.getElementById('collapse-skins');
  this.skinsCollapsePanel = document.getElementById('skins-content');

  this.meshesCollapseButton.addEventListener('click',
    (e) => me.toggleBar(me.meshesCollapseButton, me.meshesCollapsePanel), false);

  this.skinsCollapseButton.addEventListener('click',
    (e) => me.toggleBar(me.skinsCollapseButton, me.skinsCollapsePanel), false);
};
scenebuilder.toggleBar = function(button, bar) {
  if (bar.style.display === 'none') {
    bar.style.display = '';
    button.querySelector('i').innerHTML = 'expand_more';
    bar.parentNode.style.display = '';
  } else {
    bar.style.display = 'none';
    bar.parentNode.style.display = 'inline-block';
    button.querySelector('i').innerHTML = 'expand_less';
  }
};
