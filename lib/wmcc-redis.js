/*!
 * Copyright (c) 2018, Park Alter (pseudonym)
 * Distributed under the MIT software license, see the accompanying
 * file COPYING or http://www.opensource.org/licenses/mit-license.php
 *
 * https://github.com/worldmobilecoin/wmcc-redis
 * wmcc-redis.js - redis client for wmcc
 */
 'use strict';

const Assert = require('assert');
//--
const Logger = require('wmcc-logger');
const Redis = require('ioredis');
//--
const Errors = require('./errors');
//--
const {
  ERRNO,
  ERROR
} = Errors;

/**
 * Redis Client
 * A redis client for handling market price/kline.
 * @alias module:Redis.Client
 */
class Client{
  /**
   * Create a client.
   * @constructor
   * @param {Object} options
   */
  constructor(options) {
    this.options = new ClientOptions(options);

    this.logger = this.options.logger.context('redis-client');
    this.redis = new Redis(this.options);
    this._init();
  }

  /**
   * Initiate client
   * @private
   * @return {Promise}
   */
  _init() {
    this.redis.on('error',(err) => {
      this._handleError(err);
    });
  }

  /**
   * Open client
   * @return {Promise}
   */
  async open() {
    return new Promise((resolve) => {
      this.redis.connect(() => {
        resolve();
      });
    });
  }

  /**
   * Close client
   */
  close() {
    this.redis.disconnect();
  }

  _handleError(err) {
    this.logger.error(err);
  }

  /**
   * Set key for string value
   * @param {String} key
   * @param {String} value
   * @param {Array} Options [EX|PX] [NX|XX]
   * @return {Boolean|Promise}
   */
  async set(key, value, ...options) {
    const res = await this._cmd('set', key, value, ...options);
    if (res === 'OK')
      return true;

    return false;
  }

  /**
   * Get the value of key
   * @param {String} key
   * @return {String|Number|Promise} value | errno
   */
  get(key) {
    return this._cmd('get', key);
  }

  /**
   * Sets field in the hash stored at key to value
   * @param {String} key
   * @param {String} field
   * @param {String} value
   * @return {Number|Promise} 1=new, 0=update | errno
   */
  hset(key, field, value) {
    return this._cmd('hset', key, field, value);
  }

  /**
   * Get the value of a hash field
   * @param {String} key
   * @param {String} field
   * @return {String|Number|Promise} value | errno
   */
  hget(key, field) {
    return this._cmd('hget', key, field);
  }

  /**
   * Get all the fields and values in a hash
   * @param {String} key
   * @return {Object|Number|Promise} {field: value} | errno
   */
  hgetall(key) {
    return this._cmd('hgetall', key);
  }

  /**
   * Delete one or more hash fields
   * @param {String} key
   * @param {String} field
   * @return {Number|Promise} deleted fields | errno
   */
  hdel(key, fields) {
    if (!Array.isArray(fields))
      fields = [fields];

    return this._cmd('hdel', key, fields);
  }

  /**
   * Prepend one or multiple values to a list
   * @param {String} key
   * @param {Array} list
   * @return {Number|Promise} list size | errno
   */
  lpush(key, values) {
    return this._cmd('lpush', key, values);
  }

  /**
   * Trim a list to the specified range
   * @param {String} key
   * @param {Number} start
   * @param {Number} stop
   * @return {Boolean|Promise}
   */
  async ltrim(key, start, stop) {
    const res = await this._cmd('ltrim', key, [start, stop]);
    if (res === 'OK')
      return true;

    return false;
  }

  /**
   * Get a range of elements from a list
   * @param {String} key
   * @param {Number} start
   * @param {Number} stop
   * @return {Array|Number|Promise} list string | errno
   */
  lrange(key, start, stop) {
    return this._cmd('lrange', key, [start, stop]);
  }

  /**
   * Delete key/s
   * @param {Array} key strings
   * @return {Number|Promise} deleted keys | errno
   */
  delete(keys) {
    if (!Array.isArray(keys))
      keys = [keys];

    return this._cmd('del', keys);
  }

  /**
   * Redis command
   * @private
   * @param {String} command
   * @param {Any} arguments set
   * @return {Any|Promise} return | errno
   */
  _cmd(command, ...set) {
    return new Promise((resolve, reject) => {
      this.redis[command](...set, (err, res) => {
        if (err) {
          this.logger.error(ERROR.SEND_COMMAND_ERROR, command, set[0], err);
          return resolve(ERRNO.SEND_COMMAND_ERROR);
        }

        resolve(this._handleRes(res));
      });
    });
  }

  /**
   * Handle result
   * Note: no need for now
   * @private
   * @param {String} res
   */
  _handleRes(res) {
    return res;
  }
}

/**
 * Client Options
 * @internal
 * @alias module:Redis.ClientOptions
 */
class ClientOptions {
  /**
   * Create client options.
   * @constructor
   * @param {Object} options
   */
  constructor(options) {
    this.logger = Logger.global;
    this.name = 'mymaster';
    this.sentinels = [
      { host: '127.0.0.1', port: 57780 },
      { host: '127.0.0.1', port: 57781 },
      { host: '127.0.0.1', port: 57782 }
    ];
    this.lazyConnect = true;

    if (options)
      this.fromOptions(options);
  }

  /**
   * Inject properties from object.
   * @private
   * @param {Object} options
   * @returns {Object} ClientOptions
   */
  fromOptions(options) {
    if (options.logger != null) {
      Assert(typeof options.logger === 'object');
      this.logger = options.logger;
    }

    if (options.name != null) {
      Assert(typeof options.name === 'string');
      this.name = options.name;
    }

    if (options.sentinels != null) {
      Assert(Array.isArray(options.sentinels));
      this.sentinels = [];
      for (let addr of options.sentinels) {
        if (typeof addr === 'string') {
          const [host, port] = addr.split(":");
          addr = { host: host, port: parseInt(port) };
        }

        Assert(typeof addr.host === 'string');
        Assert(typeof addr.port === 'number');
        this.sentinels.push(addr);
      }
    }

    if (options.host != null) {
      Assert(typeof options.host === 'string');
      Assert(typeof options.port === 'number');
      this.host = options.host;
      this.port = options.port;
      delete this.sentinels;
    }

    if (options.lazyConnect != null) {
      Assert(typeof options.lazyConnect === 'boolean');
      this.lazyConnect = options.lazyConnect;
    }

    return this;
  }

  /**
   * Instantiate client options from object.
   * @param {Object} options
   * @returns {Object} ClientOptions
   */
  static fromOptions(options) {
    return new ClientOptions().fromOptions(options);
  }
}

/**
 * Expose
 */
module.exports = Client;