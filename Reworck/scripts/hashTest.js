const passwordHash = require('password-hash')

const hash = passwordHash.generate('helloWorld')

console.log(hash)

console.log(passwordHash.verify('password123', hash));
console.log(passwordHash.verify('helloWorld', hash));