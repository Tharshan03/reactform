// src/components/Step3_Recap.jsx
import React, { useEffect } from "react";

const CONFIRM_URL =
  "https://parisairportdisneyprestigetransfer.fr/booking-taxi/confirmation.html";

const Step3_Recap = ({
  t = {},
  // données trajet
  tripType,
  departure,
  arrival,
  selectedHotel,
  departureDate,
  returnDate,
  passengers,
  childSeats,
  luggage,
  selectedVehicle,
  // client + prix
  price,
  fullName,
  email,
  phone,
  flightNumber,
  comment,
  // actions / états
  prevStep,
  sending,
  mailStatus,       // "idle" | "success" | "error"
  handleConfirm,
  embedded = false, // si affiché dans un conteneur (stepper) ou en page autonome
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

  // Redirection automatique si l'email a bien été envoyé
  useEffect(() => {
    if (mailStatus === "success") {
      window.location.href = CONFIRM_URL;
    }
  }, [mailStatus]);

  const Title = (
    <h1 className="summary-title">
      {t.step3_title || "Booking summary"}
    </h1>
  );

  const TripSection = (
    <section className="summary-section">
      <h3><span className="dot" /> {t.recapTrip || "Trajet"}</h3>
      <ul className="summary-list">
        <li><strong>{t.tripType || "Type"} :</strong> {t[tripType] || tripType}</li>
        <li><strong>{t.departure || "Pick-Up Location"} :</strong> {t[departure] || (departure?.[0]?.toUpperCase() + departure?.slice(1))}</li>
        <li><strong>{t.arrival || "Drop-Off Location"} :</strong> {t[arrival] || (arrival?.[0]?.toUpperCase() + arrival?.slice(1))}</li>
        {(departure === "disney" || arrival === "disney") && selectedHotel && (
          <li><strong>{t.selectHotel || "Hôtel Disney"} :</strong> {selectedHotel.label}</li>
        )}
        <li><strong>{t.departureDate || "Pick-Up Date & Time"} :</strong> {fmt(departureDate)}</li>
        {tripType === "round-trip" && (
          <li><strong>{t.returnDate || "Return Date"} :</strong> {fmt(returnDate)}</li>
        )}
        <li><strong>{t.passengers || "Passengers"} :</strong> {passengers}</li>
        <li><strong>{t.childSeats || "Child seats"} :</strong> {childSeats}</li>
        <li><strong>{t.luggage || "Luggage"} :</strong> {luggage}</li>
        <li><strong>{t.vehicleChoice || "Car"} :</strong> {t[selectedVehicle] || selectedVehicle}</li>
      </ul>
    </section>
  );

  const ClientSection = (
    <section className="summary-section">
      <h3><span className="dot" /> {t.customerInfo || "Client"}</h3>
      <ul className="summary-list">
        <li><strong>{t.fullName || "Nom"} :</strong> {fullName}</li>
        <li><strong>{t.email || "Email"} :</strong> {email}</li>
        <li><strong>{t.phone || "Téléphone"} :</strong> {phone}</li>
        {flightNumber && (
          <li><strong>{t.flightNumber || "Vol"} :</strong> {flightNumber}</li>
        )}
        {comment && (
          <li><strong>{t.comment || "Commentaire"} :</strong> {comment}</li>
        )}
      </ul>
    </section>
  );

  const PriceLine = (
    <div className="price-line">
      <span>{t.estimatedPrice || "Estimated price"}</span>
      <span>{price ? `${price} €` : "--"}</span>
    </div>
  );

  const Actions = (
    <div className="action-row">
      <button type="button" className="btn btn-secondary" onClick={prevStep}>
        {t.previous || "Back"}
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleConfirm}
        disabled={!!sending}
      >
        {sending ? (t.sending || "Sending…") : (t.confirmReservation || "Confirm")}
      </button>
    </div>
  );

  const Status = (
    <>
      {mailStatus === "error" && (
        <p className="mt-2" style={{ color: "#dc2626", textAlign: "center", fontWeight: 700 }}>
          {t.error || "Erreur lors de l'envoi, veuillez réessayer."}
        </p>
      )}
      {mailStatus === "success" && (
        <p className="mt-2" style={{ color: "#16a34a", textAlign: "center", fontWeight: 700 }}>
          {t.success || "Réservation confirmée ! Redirection…"}
        </p>
      )}
    </>
  );

  const Card = (
    <div className="summary-card">
      {Title}
      {TripSection}
      {ClientSection}
      {PriceLine}
      {Actions}
      {Status}
    </div>
  );

  // Variante intégrée (dans un stepper) : on garde ta prop embedded
  if (embedded) {
    return (
      <div className="origin-top-left scale-[0.75] w-[65%] mx-auto" style={{ transformOrigin: "top left" }}>
        {Card}
      </div>
    );
  }

  // Page autonome : centrée, fond géré par le CSS global
  return (
    <div className="step3-page">
      {Card}
    </div>
  );
};

export default Step3_Recap;
