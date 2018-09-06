# wmcc-redis (WorldMobileCoin)

__NOTE__: The first release of wmcc-redis.

---

## WMCC Redis

Market Data for WMCC-Exchange.

### Usage:
```js
const Redis = require('wmcc-redis');
const Client = new Redis({
  sentinels: [
    { host: '127.0.0.1', port: 57780 },
    { host: '127.0.0.1', port: 57781 },
    { host: '127.0.0.1', port: 57782 }
  ],
  name: 'mymaster'
});

(async() => {
  await Client.open();
  await Client.set('foo', 'bar');
  const bar = await Client.get('foo');
  console.log(bar);
  ...
})();
```

**WorldMobileCoin** is a new generation of cryptocurrency.

## Disclaimer

WorldMobileCoin does not guarantee you against theft or lost funds due to bugs, mishaps,
or your own incompetence. You and you alone are responsible for securing your money.

## Contribution and License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work.

## License

--Copyright (c) 2018, Park Alter (pseudonym)  
--Distributed under the MIT software license, see the accompanying  
--file COPYING or http://www.opensource.org/licenses/mit-license.php