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

The public key authentication strategy authenticates users by verifying a signature was made by someone in possession of the private key. The strategy takes in an optional `options` object, and a required `verify` callback.

- The `options` object accepts to fields (below are the defaults):
```
{
  findBy: 'id', // or 'email' or 'nonce' or 'publicKey' or any unique field in your database for your users
  in: 'body' // or 'headers'
}
```
The `in` parameter specifies where in the request is the authentication data, i.e. in `req.body` or in `req.headers`. The `findBy` parameter specifies by which (unique) field we should find the user in the database.

- The `verify` function accepts these credentials and calls done providing a user:
```
passport.use(new PublicKeyStrategy(
  {
    findBy: 'email',
    in: 'body'
  },
  function(findByValue, signature, done) {
    User.findOneBy({ email: findByValue }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }

      var verifier = crypto.createVerify("RSA-SHA256");
      verifier.update(user.nonce);

      var publicKeyBuf = new Buffer(user.publicKey, 'base64');

      var result = verifier.verify(publicKeyBuf, signature, "base64");

      if (result) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  }
));
```

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

For an example incorporated inside [FeathersJS](https://feathersjs.com), please see [here](https://github.com/amaurymartiny/feathers-authentication-publickey/tree/master/example)

## Tests

    $ npm test
