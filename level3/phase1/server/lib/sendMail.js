import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

const configTransporter = async () => {
  // 1) Create transporter (Gmail SMTP)
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for 587
      auth: {
        user: process.env.HOST_GMAIL, // your Gmail
        pass: process.env.HOST_APP_PASSWORD, // 16-char app password (not normal login)
      },
    });
    return transporter;
    console.log("Transporter Configured");
  } catch (error) {
    console.log(error);
  }
};

const sendMail = async (transporter, otp, mailReceiver) => {
  try {
    let info = await transporter.sendMail({
      from: '"Redis" <joyiashab267@gmail.com>', // sender
      to: mailReceiver, // receiver
      subject: "Redis OTP Code",
      text: `Your OTP is: ${otp}`,
      // You can also send HTML:
      // html: "<p>Salam Joyia, this is a <b>quick test</b> email sent using Nodemailer.</p>",
    });

    console.log(`Email send: ${info.messageId}`);
  } catch (error) {
    console.log(error);
  }
};

export { configTransporter, sendMail };
