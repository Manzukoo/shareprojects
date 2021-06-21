const bcrypt = require("bcryptjs");

const helpers = {};
const { format } = require("timeago.js");


helpers.encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const pass = await bcrypt.hash(password, salt);
  return pass;
};

helpers.matchPassword = async (password, savedPassword) => {
  try {
    return await bcrypt.compare(password, savedPassword);
  } catch (e) {
    console.log(e);
  }
};

helpers.timeago = (timestamp) => {
  return format(timestamp);
};

module.exports = helpers;
