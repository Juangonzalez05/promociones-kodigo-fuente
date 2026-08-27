import { useState, useEffect } from 'react';

export function PromotionForm({ products, onSuccess, onError }) {
  const [formData, setFormData] = useState({
    nombre: "",
    productId: "",
    tipoDescuento: "porcentaje",
    valorDescuento: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
      onError("La fecha de fin debe ser posterior a la fecha de inicio");
      return;
    }

    if (formData.tipoDescuento === "porcentaje") {
      const val = Number(formData.valorDescuento);
      if (val < 1 || val > 100) {
        onError("Si el tipo es porcentaje, el valor debe estar entre 1 y 100");
        return;
      }
    }

    try {
      const payload = {
        ...formData,
        productId: Number(formData.productId),
        valorDescuento: Number(formData.valorDescuento),
        fechaInicio: new Date(formData.fechaInicio).toISOString(),
        fechaFin: new Date(formData.fechaFin).toISOString(),
      };

      await onSuccess(payload);
      setFormData({
        nombre: "",
        productId: "",
        tipoDescuento: "porcentaje",
        valorDescuento: "",
        fechaInicio: "",
        fechaFin: "",
      });
    } catch (err) {
      onError(err.message);
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h3>Crear Nueva Promoción</h3>
      
      <div className="form-group">
        <label>Nombre de la promoción</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          required
          placeholder="Ej: Descuento Fin de Semana"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Producto asociado</label>
          <select
            name="productId"
            value={formData.productId}
            onChange={handleChange}
            required
          >
            <option value="">-- Seleccionar producto --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tipo de descuento</label>
          <select
            name="tipoDescuento"
            value={formData.tipoDescuento}
            onChange={handleChange}
          >
            <option value="porcentaje">Porcentaje (%)</option>
            <option value="monto_fijo">Monto Fijo ($)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Valor del descuento</label>
          <input
            type="number"
            name="valorDescuento"
            value={formData.valorDescuento}
            onChange={handleChange}
            required
            min="1"
            step="any"
            placeholder="Ej: 20"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Fecha y hora de inicio</label>
          <input
            type="datetime-local"
            name="fechaInicio"
            value={formData.fechaInicio}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fecha y hora de fin</label>
          <input
            type="datetime-local"
            name="fechaFin"
            value={formData.fechaFin}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary">
        Registrar Promoción
      </button>
    </form>
  );
}