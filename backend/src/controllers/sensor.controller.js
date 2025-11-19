// controllers/sensor.controller.js
import { firestore } from "../config/firebaseAdmin.js";

const coll = () => firestore ? firestore.collection("sensors") : null;

export const getSensors = async (req, res) => {
  try {
    if (!coll()) return res.status(500).json({ error: "Firestore not initialized" });
    const snapshot = await coll().orderBy("timestamp", "desc").limit(200).get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addSensor = async (req, res) => {
  try {
    if (!coll()) return res.status(500).json({ error: "Firestore not initialized" });
    const { fieldId, type, value, timestamp = Date.now() } = req.body;
    const docRef = await coll().add({ fieldId, type, value, timestamp: new Date(timestamp) });
    res.json({ id: docRef.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
