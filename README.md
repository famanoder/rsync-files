> a security and fast way use sftp to upload or download files.

## CLI Usage
---

* Install

```js
npm i rsync-files -g
// or
yarn global add rsync-files
```

## Local Install

### Install

```js
npm i rsync-files -S
// or
yarn add rsync-files
```

### use API

* upload files or directories

```js
const {sshUpload} = require('rsync-files');

// your server settings
const sftpOption = {
  ip: '***',
  port: 22,
  username: '***',
  password: '***',
  target: '/'
}

sshUpload({
  source: ['build', 'node_modules'],
  ignoreRegexp: /node_modules/,
  sftpOption,
  success(res) {
    console.log('all uploaded......', res);
  },
  fail(err) {
    console.log('upload error:', err)
  }
});
```

> 