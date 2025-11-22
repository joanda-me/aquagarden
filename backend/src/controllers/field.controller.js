import Field from "../models/field.js";
import User from "../models/user.js";
import UserField from "../models/userField.js"; 

// Obtener todas las fincas del usuario logueado
export const getFields = async (req, res) => {
  try {
    const userId = req.user.id_usuario || req.user.uid; 

    const user = await User.findByPk(userId, {
      include: {
        model: Field,
        through: { attributes: ['rol_en_campo'] } 
      }
    });

    res.json(user ? user.Fields : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear una nueva finca y asignarla al usuario
export const addField = async (req, res) => {
  try {
    const { nombre_campo, ubicacion } = req.body;
    const userId = req.user.id_usuario;

    if (!userId) return res.status(400).json({ error: "Usuario no identificado" });

    // 1. Crear la Finca
    const newField = await Field.create({ nombre_campo, ubicacion });

    // 2. Crear la relación en la tabla intermedia
    await UserField.create({
      id_usuario: userId,
      id_campo: newField.id_campo,
      rol_en_campo: 'principal'
    });

    res.json(newField);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar una finca existente
export const updateField = async (req, res) => {
  try {
    const { id } = req.params; // El router envía /:id
    
    // Usamos 'id_campo' que es la nueva Primary Key
    const [updated] = await Field.update(req.body, { 
      where: { id_campo: id } 
    });

    if (updated) {
      const updatedField = await Field.findByPk(id);
      res.json(updatedField);
    } else {
      res.status(404).json({ error: "Finca no encontrada" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar una finca
export const deleteField = async (req, res) => {
  try {
    const { id } = req.params;

    // Borramos usando id_campo
    const deleted = await Field.destroy({ 
      where: { id_campo: id } 
    });

    if (deleted) {
      res.json({ success: true, message: "Finca eliminada correctamente" });
    } else {
      res.status(404).json({ error: "Finca no encontrada" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};