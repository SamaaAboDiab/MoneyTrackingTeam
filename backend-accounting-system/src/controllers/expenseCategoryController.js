const ExpenseCategory = require("../models/ExpenseCategory");

const DEFAULT_TYPE_COLORS = {
  daily: "#ef4444",
  fixed: "#facc15",
  emergency: "#9ca3af",
};

exports.list = async (req, res, next) => {
  try {
    const cats = await ExpenseCategory.find({ user: req.userId }).sort({ type: 1, createdAt: 1 });
    res.json({ success: true, data: cats });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, type, color } = req.body;
    const normalizedName = name?.trim();
    const normalizedType = type || "fixed";

    if (!normalizedName) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    if (!["daily", "fixed", "emergency"].includes(normalizedType)) {
      return res.status(400).json({ success: false, message: "Type is required and must be daily, fixed, or emergency" });
    }

    const cat = await ExpenseCategory.create({
      user: req.userId,
      name: normalizedName,
      type: normalizedType,
      color: color || DEFAULT_TYPE_COLORS[normalizedType],
    });

    res.status(201).json({ success: true, data: cat });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { type, color, name } = req.body;
    const payload = { ...req.body };

    if (name !== undefined) payload.name = name.trim();
    if (type !== undefined && !["daily", "fixed", "emergency"].includes(type)) {
      return res.status(400).json({ success: false, message: "Type is invalid" });
    }
    if (type !== undefined && !color && DEFAULT_TYPE_COLORS[type]) {
      payload.color = DEFAULT_TYPE_COLORS[type];
    }

    const cat = await ExpenseCategory.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      payload,
      { new: true, runValidators: true }
    );
    if (!cat) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, data: cat });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const cat = await ExpenseCategory.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!cat) return res.status(404).json({ success: false, message: "Category not found" });
    res.json({ success: true, message: "Category deleted" });
  } catch (err) { next(err); }
};
