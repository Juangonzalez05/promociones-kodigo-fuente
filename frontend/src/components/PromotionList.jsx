import React from "react";

export function PromotionList({ promotions, onUpdateEstado, onDelete }) {
  const formatFecha = (str) => new Date(str).toLocaleString("es-CO");

  const getBadgeClass = (estado) => {
    switch (estado) {
      case "programada": return "badge badge-yellow";
      case "activa": return "badge badge-green";
      case "finalizada": return "badge badge-gray";
      default: return "badge";
    }
  };

  return (
    <div className="table-container">
      <h3>Listado de Promociones</h3>
      {promotions.length === 0 ? (
        <p className="empty-msg">No hay promociones registradas.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Producto</th>
              <th>Descuento</th>
              <th>Vigencia</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p.id}>
                <td>#{p.id}</td>
                <td className="font-bold">{p.nombre}</td>
                <td>{p.product?.nombre || "N/A"}</td>
                <td>
                  {p.tipoDescuento === "porcentaje"
                    ? `${p.valorDescuento}%`
                    : `$${Number(p.valorDescuento).toLocaleString("es-CO")}`}
                </td>
                <td className="text-sm">
                  {formatFecha(p.fechaInicio)} <br />
                  <span className="text-gray">hasta</span> {formatFecha(p.fechaFin)}
                </td>
                <td>
                  <span className={getBadgeClass(p.estado)}>{p.estado}</span>
                </td>
                <td className="actions-cell">
                  {p.estado === "programada" && (
                    <>
                      <button
                        className="btn btn-sm btn-green"
                        onClick={() => onUpdateEstado(p.id, "activa")}
                      >
                        Activar
                      </button>
                      <button
                        className="btn btn-sm btn-red"
                        onClick={() => onDelete(p.id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                  {p.estado === "activa" && (
                    <button
                      className="btn btn-sm btn-gray"
                      onClick={() => onUpdateEstado(p.id, "finalizada")}
                    >
                      Finalizar
                    </button>
                  )}
                  {p.estado === "finalizada" && (
                    <span className="text-gray text-sm">Sin acciones</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}