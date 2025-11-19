// controllers/fields.controller.js
import Field from "../models/field.model.js";
import User from "../models/user.model.js";

export const getFields = async (req, res) => {
  try {
    // prefer firebase uid or jwt id -- user mapping might be needed later
    const ownerId = req.query.ownerId || (req.user && (req.user.uid || req.user.id));
    const where = ownerId ? { ownerId } : {};
    const fields = await Field.findAll({ where, include: [{ model: User, as: "owner", attributes: ["id", "username", "email"] }] });
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addField = async (req, res) => {
  try {
    const { name, image, meta } = req.body;
    const ownerId = req.user && (req.user.uid || req.user.id);
    if (!ownerId) return res.status(400).json({ error: "ownerId not found in token" });
    const newField = await Field.create({ name, image, meta, ownerId });
    res.json(newField);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateField = async (req, res) => {
  try {
    const { id } = req.params;
    await Field.update(req.body, { where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteField = async (req, res) => {
  try {
    const { id } = req.params;
    await Field.destroy({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
