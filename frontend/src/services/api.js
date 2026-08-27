const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || data.details?.[0]?.message || "Error en la solicitud";
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  getProducts: () => fetch(`${API_URL}/products`).then(handleResponse),
  getPromotions: () => fetch(`${API_URL}/promotions`).then(handleResponse),
  getSummary: () => fetch(`${API_URL}/promotions/resumen`).then(handleResponse),
  
  createPromotion: (promotionData) =>
    fetch(`${API_URL}/promotions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promotionData),
    }).then(handleResponse),

  updateEstado: (id, nuevoEstado) =>
    fetch(`${API_URL}/promotions/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevoEstado }),
    }).then(handleResponse),

  deletePromotion: (id) =>
    fetch(`${API_URL}/promotions/${id}`, {
      method: "DELETE",
    }).then(handleResponse),
};