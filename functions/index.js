var functions = require('firebase-functions');
var admin = require("firebase-admin");

const serviceAccount = require('./fbcreds.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://groceryblocks.firebaseio.com"
});

exports.submitEmailToList = functions.https.onRequest((req, res) => {
  if (req.method === 'POST') {
    if (!req.query.email)
      return res.status(200).send('{ empty email }');

    let email = req.query.email.replace(/[[\]{}()*+?.\\^$|]/g, '');
    return admin.database().ref(`/userNewsletter/emails`).update({
        [email]: {
          when: new Date().toISOString(),
          fullEmail: req.query.email
        }
      })
      .then(results => res.status(200).send('{ "success": true }'))
      .catch(e => {
        res.status(500).send(e);
        console.log(e);
      });
  }
  return res.send("Post Only");
});
