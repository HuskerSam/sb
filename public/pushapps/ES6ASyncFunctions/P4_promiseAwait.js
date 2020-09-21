// await and the difference in error catching
function getPromise() {
  return new Promise((res, rej) => {
    throw {
      msg: 'error',
      type: 'fake'
    };
  });
}

function testError() {
  getPromise().then(r => {

  }).catch(e => {
    console.log('catch()ed', e);
  });

  return 'testError';
}

async function testAwaitError() {
  try {
    await getPromise();
  } catch (e) {
    console.log('awaited', e);
  }

  return 'testAwaitError';
}

testError();
testAwaitError();
