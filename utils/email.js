const nodemailer = require("nodemailer");
// const Transport = require('nodemailer-brevo-transport');
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
    this.from = `Ripal <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        // service: 'Brevo',
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
          user:
            "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",
          pass: "KOGLQbrXV9xIUWsC",
        },
      });

      // const transporter = nodemailer.createTransport(
      //   new Transport({'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'})
      // );
    }

    return nodemailer.createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: "cb6adb00b720ea",
        pass: "c462b5c48ba67b",
      },
    });
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("Welcome", "Welcome to the TripMind Family!");
  }

  async passwordReset() {
    await this.send(
      "passwordReset",
      "Your Reset password token (valid  for 10 minutes"
    );
  }
};
