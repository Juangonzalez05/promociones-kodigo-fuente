import React, { useState, useEffect } from "react";
import { api } from "./services/api";
import { SummaryPanel } from "./components/SummaryPanel";
import { PromotionForm } from "./components/PromotionForm";
import { PromotionList } from "./components/PromotionList";

export default function App() {
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      const [prodData, promoData, summaryData] = await Promise.all([
        api.getProducts(),
        api.getPromotions(),
        api.getSummary(),
      ]);
      setProducts(prodData);
      setPromotions(promoData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreatePromotion = async (payload) => {
    await api.createPromotion(payload);
    await loadData();
  };

  const handleUpdateEstado = async (id, nuevoEstado) => {
    try {
      await api.updateEstado(id, nuevoEstado);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePromotion = async (id) => {
    try {
      await api.deletePromotion(id);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Módulo POS — Gestión de Promociones</h1>
      </header>

      {error && (
        <div className="alert alert-danger">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      <main className="main-content">
        <SummaryPanel summary={summary} />
        <PromotionForm
          onError={(msg) => setError(msg)}
          onSuccess={handleCreatePromotion}
          products={products}
        />
        <PromotionList
          onDelete={handleDeletePromotion}
          onUpdateEstado={handleUpdateEstado}
          promotions={promotions}
        />
      </main>
    </div>
  );
}