// src/components/Step3_Recap.jsx
import React from "react";

const Step3_Recap = ({
  t,
  tripType, departure, arrival, selectedHotel,
  departureDate, returnDate, passengers, childSeats, luggage, selectedVehicle,
  price, fullName, email, phone, flightNumber, comment,
  prevStep, sending, mailStatus, handleConfirm,
  embedded = false,
}) => {
  const fmt = (d) =>
    d
      ? d.toLocaleString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  // Contenu principal
  const Content = (
    <>
      <h2 className="text-xl font-bold mb-4 text-center">
        {t.step3_title || "Récapitulatif de la réservation"}
      </h2>

      {/* Trajet */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">{t.recapTrip || "📝 Trajet"} </h3>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="font-medium">{t.tripType || "Type"} :</span>{" "}
            {t[tripType] || tripType}
          </li>
          <li>
            <span className="font-medium">{t.departure || "Départ"} :</span>{" "}
            {t[departure] || (departure?.[0]?.toUpperCase() + departure?.slice(1))}
          </li>
          <li>
            <span className="font-medium">{t.arrival || "Arrivée"} :</span>{" "}
            {t[arrival] || (arrival?.[0]?.toUpperCase() + arrival?.slice(1))}
          </li>
          {(departure === "disney" || arrival === "disney") && selectedHotel && (
            <li>
              <span className="font-medium">
                {t.selectHotel || "Hôtel Disney"} :
              </span>{" "}
              {selectedHotel.label}
            </li>
          )}
          <li>
            <span className="font-medium">
              {t.departureDate || "Date de départ"} :
            </span>{" "}
            {fmt(departureDate)}
          </li>
          {tripType === "round-trip" && (
            <li>
              <span className="font-medium">
                {t.returnDate || "Date de retour"} :
              </span>{" "}
              {fmt(returnDate)}
            </li>
          )}
          <li>
            <span className="font-medium">
              {t.passengers || "Passagers"} :
            </span>{" "}
            {passengers}
          </li>
          <li>
            <span className="font-medium">
              {t.childSeats || "Sièges enfant"} :
            </span>{" "}
            {childSeats}
          </li>
          <li>
            <span className="font-medium">{t.luggage || "Valises"} :</span>{" "}
            {luggage}
          </li>
          <li>
            <span className="font-medium">
              {t.vehicleChoice || "Véhicule"} :
            </span>{" "}
            {t[selectedVehicle] || selectedVehicle}
          </li>
        </ul>
      </div>

      {/* Client */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">{t.customerInfo || "👤 Client"}</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <span className="font-medium">{t.fullName || "Nom"} :</span>{" "}
            {fullName}
          </li>
          <li>
            <span className="font-medium">{t.email || "Email"} :</span>{" "}
            {email}
          </li>
          <li>
            <span className="font-medium">{t.phone || "Téléphone"} :</span>{" "}
            {phone}
          </li>
          {flightNumber && (
            <li>
              <span className="font-medium">
                {t.flightNumber || "Vol"} :
              </span>{" "}
              {flightNumber}
            </li>
          )}
          {comment && (
            <li>
              <span className="font-medium">{t.comment || "Commentaire"} :</span>{" "}
              {comment}
            </li>
          )}
        </ul>
      </div>

      {/* Prix */}
      <div className="mb-4 text-center text-green-600 font-semibold">
        {(t.estimatedPrice || "Prix total")} : {price ? `${price} €` : "--"}
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-4">
        <button
          type="button"
          className="w-1/2 bg-gray-100 text-gray-900 font-semibold py-2 rounded-lg shadow hover:bg-gray-200 transition"
          onClick={prevStep}
        >
          {t.previous || "Précédent"}
        </button>
        <button
          type="button"
          className={`w-1/2 bg-green-600 text-white font-semibold py-2 rounded-lg shadow hover:bg-green-700 transition ${
            sending ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleConfirm}
          disabled={sending}
        >
          {sending ? (t.sending || "Envoi en cours...") : (t.confirmReservation || "Confirmer")}
        </button>
      </div>

      {/* Statut */}
      {mailStatus === "success" && (
        <div className="mt-3 text-center text-green-600 font-semibold">
          {t.success || "Réservation confirmée !"}
        </div>
      )}
      {mailStatus === "error" && (
        <div className="mt-3 text-center text-red-600 font-semibold">
          {t.error || "Erreur lors de l'envoi, veuillez réessayer."}
        </div>
      )}
    </>
  );

  // Version intégrée (même gabarit que Step 1)
  if (embedded) {
    return (
      <div
        className="origin-top-left scale-[0.75] w-[60%]"
        style={{ transformOrigin: "top left" }}
      >
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
          {Content}
        </div>
      </div>
    );
  }

  // Version autonome (plein écran centré)
  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="bg-white rounded-xl shadow-md p-4 md:p-5 w-full max-w-sm mx-auto">
        {Content}
      </div>
    </div>
  );
};

export default Step3_Recap;
