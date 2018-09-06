/**
 * Todo: Need proper test unit such mocha, chai
 * Todo: Use MockServer instead of real redis server
 * Note: To run this test, must install Redis Server with sentinal
 * on port 57780, 57781, 57782, see example
 */
'use strict';

const Redis = require('../lib/wmcc-redis');
const Logger = require('wmcc-logger');
const log = Logger.global;
log.setLevel('debug');
log.open();

const redis = new Redis({
  sentinels: [
    { host: '127.0.0.1', port: 57780 },
    { host: '127.0.0.1', port: 57781 },
    { host: '127.0.0.1', port: 57782 }
  ],
  name: 'mymaster',
  logger: log
});

(async()=>{
  const o = await redis.open();
  let set, get, hset, hget, hgetall, hdel, del, list, trim, range;
  const _list = [ 'one', 2, 'three', 4, 'five'];

  set = await redis.set('key', 'bar');
  log.debug('set `key`:', set);
  get = await redis.get('key');
  log.debug('get `key`:', get, '\n');

  hset = await redis.hset('hkey', 'field0', 'value0');
  log.debug('hset `hkey`:', hset);
  hset = await redis.hset('hkey', 'field0', 'updated value0');
  log.debug('hset `hkey`(update):', hset);
  hget = await redis.hget('hkey', 'field0');
  log.debug('hget `hkey`:', hget);
  await redis.hset('hkey', 'field1', 'value1');
  await redis.hset('hkey', 'field2', 'value2');
  hgetall = await redis.hgetall('hkey');
  log.debug('hgetall `hkey`:', hgetall);
  hdel = await redis.hdel('hkey', ['field0', 'field1', 'field2']);
  log.debug('hdel `hkey fields`:', hdel, '\n');

  list = await redis.lpush('list', _list);
  log.debug('lpush `list`:', list);
  range = await redis.lrange('list', 0, -1);
  log.debug('lrange `list`:', range);
  trim = await redis.ltrim('list', 0, 2);
  log.debug('ltrim `list`:', trim);
  range = await redis.lrange('list', 0, -1);
  log.debug('lrange `list`:', range, '\n');

  del = await redis.delete('key');
  log.debug('delete `key`:', del);
  del = await redis.delete('hkey');
  log.debug('delete `hkey`: ', del);
  del = await redis.delete('list');
  log.debug('del `list`: ', del, '\n');

  set = await redis.set('key', 'bar', 'PX', 100);
  log.debug('set `key` exp. in 100 milisecs: ', set);
  setTimeout(async ()=>{
    get = await redis.get('key');
    log.debug('get expired `key`: ', get);
    await redis.delete('key');
    process.exit(1);
  }, 101);
})();