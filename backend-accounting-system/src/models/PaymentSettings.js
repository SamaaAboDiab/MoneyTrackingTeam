const mongoose = require("mongoose");
const { Schema } = mongoose;

// Where users send money (a single document, edited from admin Settings → Payments).
const paymentSettingsSchema = new Schema({
  key:               { type: String, default: "main", unique: true },
  vodafoneCashNumber: { type: String, trim: true, maxlength: 30, default: "" },
  vodafoneCashName:   { type: String, trim: true, maxlength: 80, default: "" },
  instapayAddress:    { type: String, trim: true, maxlength: 80, default: "" },
  instapayName:       { type: String, trim: true, maxlength: 80, default: "" },
  instructions:       { type: String, trim: true, maxlength: 500, default: "" },
}, { timestamps: true });

paymentSettingsSchema.statics.get = async function get() {
  return (await this.findOne({ key: "main" }).lean()) ?? { key: "main" };
};

module.exports = mongoose.model("PaymentSettings", paymentSettingsSchema);
