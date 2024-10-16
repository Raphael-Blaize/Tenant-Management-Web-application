const bcrypt = require('bcrypt');

const password = 'randh'; // Replace this with the password you want to hash
const saltRounds = 10; // Number of salt rounds

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Hashed Password:', hash);
    }
});
