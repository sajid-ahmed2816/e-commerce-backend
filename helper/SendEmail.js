const transporter = require("../config/NodemailerConfig");

const SendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"Fashion Store" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification OTP",
    html: `
      <h3>Email Verification</h3>
      <p>Your OTP is:</p>
      <h2>${otp}</h2>
      <p>This OTP will expire in 10 minutes.</p>
    `
  });
};

const SendOCEmail = async ({to, subject, html}) => {
  await transporter.sendMail({
    from: `"Fashion Store" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    html
  });
};

module.exports = {SendOTPEmail, SendOCEmail};