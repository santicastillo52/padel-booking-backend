const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const {User} = require('../models');

module.exports = function(passport) {
  passport.use(new LocalStrategy(
    {
      usernameField: 'email', 
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) return done( console.log('User not found'), null, false, { message: 'User not found' }
    
        );

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(console.log('contraseña incorrecta'), null, false, { message: 'Incorrect password' });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
