import { tarifsVtc } from "../data/tarifsVtc";
import React from "react";

const Tarifs = () => {
  const renderTarifs = (type) => {
    const data = tarifsVtc[type];

    return (
      <div>
        <h2 className="text-xl font-bold mt-6 mb-2">
          {type === "one-way" ? "🚗 Aller simple" : "🔁 Aller-retour"}
        </h2>
        <table className="w-full border border-gray-300 mb-4 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Trajet</th>
              {[...Array(8)].map((_, i) => (
                <th key={i} className="border px-2 py-1">{i + 1}p</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(data).map(([key, values]) => (
              <tr key={key}>
                <td className="border px-2 py-1 font-medium">
                  {key.replace(/-/g, " → ")}
                </td>
                {values.map((price, i) => (
                  <td key={i} className="border px-2 py-1 text-center">
                    {price}€
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4">
      {renderTarifs("one-way")}
      {renderTarifs("round-trip")}
    </div>
  );
};

export default Tarifs;
