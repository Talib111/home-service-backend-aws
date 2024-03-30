const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate-v2");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const DynamicContentSchema = new Schema(
	{
		title: {
			type: String,
		},
		description: {
			type: String,
		},
		subtitle: {
			type: String,
		},
		thumbnail: {
			type: String,
		},
		key: {
			type: String,
		},
		order: Number,
	},
	{
		timestamps: true,
	}
);
DynamicContentSchema.plugin(mongoosePaginate);
DynamicContentSchema.plugin(AutoIncrement, { inc_field: "order" });

module.exports = DynamicContent = mongoose.model(
	"dynamiccontent",
	DynamicContentSchema
);

// password and phone for auth
