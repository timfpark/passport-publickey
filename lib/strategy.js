/**
 * Module dependencies.
 */
var passport = require('passport-strategy')
  , util = require('util');

/**
 * Default options for stategy
 */
const defaultOptions = {
  findBy: 'id',
  in: 'body'
};

/**
 * `Strategy` constructor.
 *
 * The publicKey authentication strategy authenticates requests based on verifying
 * that the client has encrypted a given string with his private key.
 * 
 * Applications should supply a `option` object with:
 * - a `findBy` field, from which the server will lookup the user in the database,
 *   (generally 'id', 'username', 'publicKey', 'findByValue'). Defaults to 'id'.
 * - a `in` field, which means in which part of the request the `findByValue` and
 *   `signature ` can be found (generally 'body' or 'headers'). Defaults to 'body'.
 *
 * Applications must supply a `verify` callback which accepts `{{findBy}}`
 * (a field with the same name as options.findBy) and `signature`. 
 * The server should lookup the principal with this `findByValue`,
 * and decrypt the challenge, and confirm that the encryptedAuth is of the form
 * "nonce:timestamp" and that timestamp is within an application defined envelope.
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  if (typeof options === 'function') {
    verify = options;
    options = {};
  }

  if (!verify) {
    throw new TypeError('PublicKeyStrategy requires a verify callback');
  }

  // Merge user options with default options
  options = Object.assign({}, defaultOptions, options);

  passport.Strategy.call(this);
  this.name = 'publicKey';
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
  // Merge user options with default options
  options = Object.assign({}, defaultOptions, options);

  if (req[options.in] == null) { // Note: "== null" means "=== null or undefined"
    return this.fail({ message: options.badRequestMessage || `Missing credentials` }, 400)
  }

  if (req[options.in][options.findBy] == null) {
    return this.fail({ message: options.badRequestMessage || `Missing ${options.findBy}` }, 400)
  }

  if (req[options.in].signature == null) {
    return this.fail({ message: options.badRequestMessage || `Missing signature` }, 400)
  }

  var findByValue = req[options.in][options.findBy];
  var signature = req[options.in].signature;

  var self = this;

  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }

  try {
    if (self._passReqToCallback) {
      this._verify(req, findByValue, signature, verified);
    } else {
      this._verify(findByValue, signature, verified);
    }
  } catch (ex) {
    return self.error(ex);
  }
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
