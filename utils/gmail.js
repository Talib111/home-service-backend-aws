// controllers/emailController.js
const nodemailer = require("nodemailer");
const path = require("path");
const email1 = require("./template/email1");

// ════════════════════║ NODEMAILER SETUP  ║═════════════════════════
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: "imonn439@gmail.com",
		pass: "zfih enmr nkar iydc",
	},
});

const pdfPath = path.join(__dirname, "..", "template", "bugs.pdf");

const sendGmail = async ({
	orderId,
	customerEmail,
	customerName,
	packageName,
	packagePrice,
	discount,
	totalPrice,
	paymentMode,
}) => {
	console.log("the template data at email js..", {
		orderId,
		customerEmail,
		customerName,
		packageName,
		packagePrice,
		discount,
		totalPrice,
		paymentMode,
	});

	const mailOptions = {
		from: "imonn439@gmail.com",
		to: customerEmail,
		subject: " Collibet Service Successfully Completed",
		text: "Service Close Notification",
		html: email1({
			orderId,
			customerEmail,
			customerName,
			packageName,
			packagePrice,
			discount,
			totalPrice,
			paymentMode,
		}),
		//   attachments: [
		//     {
		//         filename: 'bugs.pdf',
		//         path: pdfPath // Update with the path to your PDF file
		//     }
		// ]
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending email:", error);
			res.status(500).send("Error sending email");
		} else {
			console.log("Email sent:", info.response);
			res.status(200).send("Email sent successfully");
		}
	});
};

module.exports = sendGmail;
