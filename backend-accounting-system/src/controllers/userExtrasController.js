const mongoose = require("mongoose");
const User = require("../models/User");
const Announcement = require("../models/Announcement");
const RenewalRequest = require("../models/RenewalRequest");
const { PLAN_PRICES, SUBSCRIPTION_CURRENCY } = require("../config/subscriptionPlans");
const { userStatus } = require("../utils/subscription");

const PAID_PLANS = ["3months", "6months", "yearly"];

/* ── GET /api/announcements ──────────────────────── */
exports.listMyAnnouncements = async (req, res, next) => {
  try {
    const items = await Announcement.find({ recipients: new mongoose.Types.ObjectId(req.userId) })
      .sort({ createdAt: -1 })
      .limit(30)
      .select("title body createdAt")
      .lean();
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

/* ── GET /api/renewal — my plan, prices and my latest request ── */
exports.getMyRenewal = async (req, res, next) => {
  try {
    const [user, latest] = await Promise.all([
      User.findById(req.userId).select("subscriptionType subscriptionStart subscriptionEnd isSuspended").lean(),
      RenewalRequest.findOne({ user: req.userId }).sort({ createdAt: -1 }).lean(),
    ]);
    res.json({
      success: true,
      data: {
        subscription: user ? { ...user, _status: userStatus(user) } : null,
        plans: PAID_PLANS.map((plan) => ({ plan, price: PLAN_PRICES[plan] ?? 0 })),
        currency: SUBSCRIPTION_CURRENCY,
        latest,
      },
    });
  } catch (err) { next(err); }
};

/* ── POST /api/renewal { plan, note } ────────────── */
exports.requestRenewal = async (req, res, next) => {
  try {
    const plan = PAID_PLANS.includes(req.body?.plan) ? req.body.plan : null;
    if (!plan) return res.status(400).json({ success: false, message: "اختار الباقة" });
    const note = typeof req.body?.note === "string" ? req.body.note.trim().slice(0, 500) : "";
    if (await RenewalRequest.exists({ user: req.userId, status: "pending" })) {
      return res.status(409).json({ success: false, message: "عندك طلب تجديد لسه تحت المراجعة" });
    }
    const request = await RenewalRequest.create({ user: req.userId, plan, note });
    res.status(201).json({ success: true, data: request });
  } catch (err) { next(err); }
};

/* ── DELETE /api/renewal — cancel my pending request ── */
exports.cancelMyRenewal = async (req, res, next) => {
  try {
    await RenewalRequest.deleteOne({ user: req.userId, status: "pending" });
    res.json({ success: true });
  } catch (err) { next(err); }
};
