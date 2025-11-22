import User from "./user.js";
import Field from "./field.js";
import Device from "./device.js";
import Sector from "./sector.js";
import Crop from "./crop.js";
import IrrigationProgram from "./irrigationProgram.js";
import UserField from "./userField.js";

export default function setupAssociations() {
  // 1. Usuarios <-> Campos (Muchos a Muchos)
  User.belongsToMany(Field, { through: UserField, foreignKey: "id_usuario" });
  Field.belongsToMany(User, { through: UserField, foreignKey: "id_campo" });

  // 2. Campo -> Dispositivo (Uno a Uno)
  Device.hasOne(Field, { foreignKey: "id_dispositivo" });
  Field.belongsTo(Device, { foreignKey: "id_dispositivo" });

  // 3. Campo -> Sectores (Uno a Muchos)
  Field.hasMany(Sector, { foreignKey: "id_campo" });
  Sector.belongsTo(Field, { foreignKey: "id_campo" });

  // 4. Cultivo -> Sectores (Uno a Muchos)
  Crop.hasMany(Sector, { foreignKey: "id_cultivo" });
  Sector.belongsTo(Crop, { foreignKey: "id_cultivo" });

  // 5. Sector -> Programas de Riego (Uno a Muchos)
  Sector.hasMany(IrrigationProgram, { foreignKey: "id_sector" });
  IrrigationProgram.belongsTo(Sector, { foreignKey: "id_sector" });

  console.log("✅ Associations setup completed");
}