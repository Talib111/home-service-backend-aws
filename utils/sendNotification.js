const Notification = require("../model/v1/Notification");
const { sender, gcm } = require("./gcm");
const sendNotification = async (tokenId, title, body, userId, url) => {
	var message = new gcm.Message({
		priority: "high",
		contentAvailable: true,
		delayWhileIdle: true,
		timeToLive: 3,
		notification: {
			title: title,
			icon: "ic_launcher",
			body: body,
		},
	});

	// Specify which registration IDs to deliver the message to
	var regTokens = [tokenId];

	console.log(regTokens);

	// Actually send the message
	const response = sender.send(message, {
		registrationTokens: regTokens,
	});
	console.log(response);
	const notification = await new Notification({
		tokenId,
		title,
		body,
		url,
		user: userId,
	}).save();
	return;
};

module.exports = sendNotification;
