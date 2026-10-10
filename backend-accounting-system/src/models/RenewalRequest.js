const mongoose = require("mongoose");
const { Schema } = mongoose;

// A user asking to renew (or change) their plan; an admin approves or rejects it.
const renewalRequestSchema = new Schema({
  user:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  plan:      { type: String, enum: ["3months", "6months", "yearly"], required: true },
  note:      { type: String, trim: true, maxlength: 500, default: "" },
  status:    { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  handledBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  handledAt: { type: Date },
  response:  { type: String, trim: true, maxlength: 500, default: "" },
}, { timestamps: true });

renewalRequestSchema.index({ status: 1, createdAt: -1 });
renewalRequestSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("RenewalRequest", renewalRequestSchema);
