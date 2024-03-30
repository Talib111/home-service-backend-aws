const nodeMailer = require("nodemailer");

const transport = nodeMailer.createTransport({
	host: "smtp.zoho.com",
	secure: true,
	port: 465,
	auth: {
		user: process.env.EMAIL_ID,
		pass: process.env.EMAIL_PASS,
	},
});

const sendMail = async ({ name, email, phoneNumber, messages, file }) => {
	try {
		console.log({
			name,
			email,
			phoneNumber,
			messages,
			file,
		});

		// const file = req.file;
		// console.log({ file });
		const option = {
			from: "service@ashadnasim.com",
			to: ["ashadnasim123@gmail.com", "info@ultratec3d.ae"],
			// to: "ashadnasim123@gmail.com",
			// to: ["info@ultratec3d.ae", "ashadnasim123@gmail.com"],
			subject: `New message from ${name}`,
			html: `
				<p>Hello UltraTech 3D service,</p>
				<p>You got a new message from ${name}:</p>
				<p>Email id is  ${email}:</p>
				<p>Phone Number is ${phoneNumber}:</p>
				
				<p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic;">${messages}</p>
				
				${
					file
						? `<p>Attached File: <a href="${file}" target="_blank">Open File</a></p>`
						: ""
				}
				
				<p>Best wishes,<br>8bytes team</p>
			`,
		};

		const mailRes = await transport.sendMail(option);
		console.log({
			mailRes,
		});
		return true;
	} catch (error) {
		console.log(error);
		return false;
	}
};

module.exports = sendMail;
