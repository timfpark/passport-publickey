/**
 * Module dependencies.
 */
var passport = require('passport-strategy')
  , util = require('util');

/**
 * `Strategy` constructor.
 *
 * The publickey authentication strategy authenticates requests based on verifying
 * that the client has encrypted a string with a
 *
 * Applications must supply a `verify` callback which accepts `publicKey` and
 * `encryptedChallenge`. The application should lookup the principal with this publickey,
 * and decrypt the challenge, and confirm that the encryptedAuth is of the form
 * "nonce:timestamp" and that timestamp is within an application defined envelope.
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */

function Strategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) { throw new TypeError('PublicKeyStrategy requires a verify callback'); }

  passport.Strategy.call(this);
  this.name = 'publickey';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
  options = options || {};

  var nonceString = req.headers.nonce;
  var signature = req.headers.signature;

  if (!nonceString || !signature) {
    return this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
  }

  var self = this;

  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }

  try {
    if (self._passReqToCallback) {
      this._verify(req, nonceString, signature, verified);
    } else {
      this._verify(nonceString, signature, verified);
    }
  } catch (ex) {
    return self.error(ex);
  }
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
