if (window.location.hostname === 'xrcharting.com')
  window.location = 'https://www.handtop.com/reality';
else if (window.location.hostname === 'xrgrafter.com')
  window.location = 'https://www.handtop.com';
else if (window.location.hostname === 'xrgrafter.com')
  window.location = '/edit';
else if (window.location.hostname === 'braingrafter.com')
  window.location = '/asset';
else if (window.location.hostname === 'xrscenes.com')
  window.location = '/asset';
else if (window.location.hostname === 'localhost')
; //window.location = '/asset';
else if (window.location.hostname === 'deliciousculture.com')
  window.location = '/dc';
else if (window.location.hostname === 'handtop.com')
;
else
  window.location = '/display';

window.addEventListener('DOMContentLoaded', e => {
  let wrapperList = document.querySelectorAll('.video-wrapper');

  wrapperList.forEach(wrapper => {
    let video = wrapper.querySelector('video');
    let btn = wrapper.querySelector('.playpause');

    video.setAttribute('controls', '');
    btn.addEventListener('click', e => {
      if (video.paused) {
        video.play();
      }
    });

    video.addEventListener('pause', e => {
      btn.style.display = '';
    });
    video.addEventListener('play', e => {
      btn.style.display = 'none';
    });
  })
});
