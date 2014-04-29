# passport-publickey

[Passport](http://passportjs.org/) strategy for authenticating using a public/private key pair to sign a nonce challenge.

This module lets you authenticate using a public/private key pair in your Node.js
applications.  By plugging into Passport, local authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-publickey

## Usage

#### Configure Strategy

The public key authentication strategy authenticates users by verifying a signature was made by someone in possession of the private key. The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user.

    passport.use(new PublicKeyStrategy(
      function(nonce, signature, done) {
        User.findByNonce(nonce, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false); }

          var verifier = crypto.createVerify("RSA-SHA256");
          verifier.update(nonceString);

          var publicKeyBuf = new Buffer(user.public_key, 'base64');

          var result = verifier.verify(publicKeyBuf, signature, "base64");

          if (result) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'publicKey'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.post('/login', 
      passport.authenticate('publicKey', { failureRedirect: '/login' }),
      function(req, res) {
        res.redirect('/');
      });

## Examples

For complete, working examples, refer to the multiple [examples](https://github.com/jaredhanson/passport-local/tree/master/examples) included.

## Tests

    $ npm install
    $ npm test
