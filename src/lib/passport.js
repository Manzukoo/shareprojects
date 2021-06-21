const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const db = require("../database");
const helpers = require("./helpers");

passport.use(
  "local.login",
  
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "pass",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      console.log(req.body)
      const rows = await db.query("SELECT * FROM users WHERE username = ?", [username]);
      
      if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.matchPassword(
          password,
          user.password
        );
        
        if (validPassword) {
          done(null, user, req.flash("loginSuccess", "Hola " + user.fullname));
        } else {
          done(null, false, req.flash("err", "Este usuario o contraseña no existe."));
        }
      } else {
        console.log(password)
        return done(null, false, req.flash("err", "Este usuario o contraseña no existe."));
      }
    }
  )
);

passport.use(
  "local.register",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "pass",
      passReqToCallback: true,
    },
    async (req, username, password, done) => {
      const { fullname, email } = req.body;

      const newUser = {
        username,
        password,
        fullname,
        email,
      };
      newUser.password = await helpers.encryptPassword(password);
      const result = await db.query("INSERT INTO users SET ?", [newUser]);
      newUser.id = result.insertId;
      return done(null, newUser);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  done(null, rows[0]);
});
