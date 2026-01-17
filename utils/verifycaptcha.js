const axios = require("axios");

exports.verifyCaptcha = async (token) => {
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: token,
        },
      }
    );
    return response.data.success;
  } catch (err) {
    console.error("Captcha error:", err.message);
    return false;
  }
};
