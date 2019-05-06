module.exports = {
  sftpOption: {
    host: "132.232.60.18",
    port: 22,
    username: "root",
    password: "!Famanoder1",
    target: "/home/others/test-ssh-upload"
  },
  source: "node_modules",
  target: '/home/others/test-ssh-uload/',
  uploadConcurrencyNumber: 6000
}

// upload后可以exec