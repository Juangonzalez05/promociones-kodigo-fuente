import React from "react";

export function SummaryPanel({ summary }) {
  if (!summary) return null;

  const { resumenEstado, vigentesHoy } = summary;

  return (
    <div className="summary-grid">
      <div className="card card-blue">
        <span className="card-title">Vigentes Hoy</span>
        <span className="card-value">{vigentesHoy}</span>
      </div>
      <div className="card card-yellow">
        <span className="card-title">Programadas</span>
        <span className="card-value">{resumenEstado?.programadas || 0}</span>
      </div>
      <div className="card card-green">
        <span className="card-title">Activas</span>
        <span className="card-value">{resumenEstado?.activas || 0}</span>
      </div>
      <div className="card card-gray">
        <span className="card-title">Finalizadas</span>
        <span className="card-value">{resumenEstado?.finalizadas || 0}</span>
      </div>
    </div>
  );
}