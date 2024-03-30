const gcm = require("node-gcm");
// Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
var sender = new gcm.Sender(
	"AAAAIxnyNJ0:APA91bHfNjBmeRMksK9uONYHL5Ywn8cFNT0uAd6mSlsW_SmP05q-vc8FKrRTse024fsOMVWNctrRW3d28tXWFwfjCC8i287wNw94Ah0kMxfSvAPiTkWYMXIu8bVWZBZAz2otZyYpeTfa"
);

module.exports = {
	gcm,
	sender,
};
