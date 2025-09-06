import React from "react";

export default function Step1b_TripOptions({
  t,
  passengers, setPassengers,
  childSeats, setChildSeats,
  luggage, setLuggage,
  selectedVehicle, setSelectedVehicle,
  price,
  filteredVehicles,
  vehicleImages,
  nextStep, prevStep
}) {
  return (
    <div className="w-full">
      <form
        className="bg-white rounded-xl shadow-md p-4 md:p-5 w-full max-w-sm mx-auto"
        onSubmit={e => { e.preventDefault(); nextStep(); }}
      >
        <h2 className="text-xl font-bold mb-4 text-center">Options du trajet</h2>

        {/* Passagers 
        <div className="mb-3">
          <label className="text-sm font-semibold mb-1 flex items-center gap-2">
            <span>🧑</span> <span>{passengers} {t.passengers}</span>
          </label>
          <input
            type="range"
            min="1"
            max="16"
            value={passengers}
            onChange={e => setPassengers(Number(e.target.value))}
            className="w-full"
          />
        </div> */}

        {/* Sièges enfant */}
        <div className="mb-3">
          <label className="text-sm font-semibold mb-1 flex items-center gap-2">
            <span>🍼</span> <span>{childSeats} {t.childSeats}</span>
          </label>
          <input
            type="range"
            min="0"
            max={Math.max(0, passengers - 1)}
            value={childSeats}
            onChange={e => setChildSeats(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Valises */}
        <div className="mb-3">
          <label className="text-sm font-semibold mb-1 flex items-center gap-2">
            <span>🧳</span> <span>{luggage} {t.luggage}</span>
          </label>
          <input
            type="range"
            min="0"
            max="14"
            value={luggage}
            onChange={e => setLuggage(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Choix véhicule */}
        <div className="mb-3">
          <label className="block text-sm font-semibold mb-1">🚗 {t.vehicleChoice}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 justify-center items-stretch mt-1">
            {filteredVehicles.map(vehicle => (
              <div
                key={vehicle.id}
                tabIndex={0}
                role="button"
                aria-pressed={selectedVehicle === vehicle.id}
                className={`cursor-pointer bg-white rounded-xl shadow p-2.5 border-2 flex flex-col items-center w-40
                  transition ${selectedVehicle === vehicle.id ? "border-blue-600 ring-2 ring-blue-200 bg-blue-50" : "border-gray-200"}
                  hover:shadow-md hover:border-blue-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-200`}
                onClick={() => setSelectedVehicle(vehicle.id)}
                onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setSelectedVehicle(vehicle.id); }}
              >
                <div className="w-full h-24 flex items-center justify-center mb-1.5">
                  <img
                    src={vehicleImages[vehicle.id]}
                    alt={t[vehicle.id] || vehicle.name}
                    className="object-contain h-20 w-auto"
                  />
                </div>
                <div className="font-semibold text-center text-sm mb-0.5">{t[vehicle.id] || vehicle.name}</div>
                <div className="text-[11px] text-gray-600 text-center">
                  {vehicle.id === "mercedes" && <>4 pers. max · Climatisation</>}
                  {vehicle.id === "van_standard" && <>7 pers. max · Climatisation</>}
                  {vehicle.id === "van_vito" && <>8 pers. max · Grand coffre</>}
                </div>
                {vehicle.id === "van_standard" && passengers <= 4 && (
                  <span className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-100">
                    +5 €
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {price !== null && (
          <div className="mb-3 text-center text-green-600 font-semibold text-base">
            {t.estimatedPrice} : {price} €
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={prevStep}
            className="w-1/2 bg-gray-100 text-gray-700 font-semibold py-2 rounded-lg text-sm hover:bg-gray-200 transition"
          >
            Retour
          </button>
          <button
            type="submit"
            className="w-1/2 bg-blue-600 text-white font-semibold py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Continuer
          </button>
        </div>
      </form>
    </div>
  );
}
