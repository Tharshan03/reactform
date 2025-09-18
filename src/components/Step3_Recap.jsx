// src/components/Step3_Recap.jsx
import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";

const CONFIRM_URL =
  "https://parisairportdisneyprestigetransfer.fr/booking-taxi/confirmation.html";

const Step3_Recap = ({
  t = {},
  // Données trajet
  tripType,
  departure,
  arrival,
  selectedHotel,
  hotelOther = "",
  departureDate,
  returnDate,
  passengers,
  childSeats,
  luggage,
  selectedVehicle,

  // Client + prix
  price,
  fullName,
  email,
  phone,
  phoneCode, // ← objet optionnel { iso2:'FR', dialCode:'33', flagEmoji:'🇫🇷', label:'France (+33)' } ou similaire
  flightNumber,
  comment,

  // Actions / états
  prevStep,
  sending,
  mailStatus, // "idle" | "success" | "error"
  handleConfirm,
  embedded = false,

  // Ajout de la prop
  departureAddress,
  arrivalAddress,
}) => {
  // ========= Helpers =========
  const fmtDate = (d) =>
    d
      ? d.toLocaleString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  // Nom lisible pour le véhicule
  const vehicleLabel = useMemo(() => {
    const map = {
      mercedes: "Mercedes Classe E",
      van_standard: "Van Standard",
      van_vito: "Van Vito Premium",
    };
    return map[selectedVehicle] || selectedVehicle?.replace(/_/g, " ");
  }, [selectedVehicle]);

  // Phone affiché: [drapeau] +[code]  numéro
  const displayPhone = useMemo(() => {
    if (!phoneCode) return phone || "";
    const flag =
      phoneCode.flagEmoji ||
      (phoneCode.iso2 ? countryIsoToEmoji(phoneCode.iso2) : "");
    const dial =
      phoneCode.dialCode?.toString().startsWith("+")
        ? phoneCode.dialCode
        : `+${phoneCode.dialCode ?? ""}`;
    const trimmed = (phone || "").toString().trim();
    return `${flag ? flag + " " : ""}${dial || ""}${trimmed ? " " + trimmed : ""}`;
  }, [phoneCode, phone]);

  // Convertit FR → 🇫🇷 (fallback si flagEmoji absent)
  function countryIsoToEmoji(iso) {
    try {
      return iso
        .toUpperCase()
        .replace(/./g, (c) =>
          String.fromCodePoint(127397 + c.charCodeAt())
        );
    } catch {
      return "";
    }
  }

  // Redirection automatique si l'email a bien été envoyé
  useEffect(() => {
    if (mailStatus === "success") {
      window.location.href = CONFIRM_URL;
    }
  }, [mailStatus]);

  // Disney hotel label (prend en compte Others + champ libre)
  const disneyHotelLabel =
    selectedHotel?.value === "others" && hotelOther?.trim()
      ? hotelOther.trim()
      : selectedHotel?.label;

  // ========= UI =========
  return (
    <div
      className={`${
        embedded ? "" : "origin-top-left scale-[.75] w-[65%]"
      }`}
      style={{ transformOrigin: "top left" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {t.step3_title || "Booking summary"}
        </h1>

        {/* TRIP */}
        <section className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
            <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
            {t.recapTrip || "Trajet"}
          </h3>
          <ul className="space-y-2 text-[15px]">
            <Li icon="🚗" label={t.tripType || "Type"}>
              {t[tripType] || pretty(tripType)}
            </Li>

            {/* Pour les excursions, on n'affiche pas departure/arrival mais seulement l'adresse de pickup */}
            {tripType === "excursion" ? (
              <>
                {departureAddress && (
                  <Li icon="📍" label={t.pickup_address || "Pick-up Address"}>
                    {departureAddress}
                  </Li>
                )}
              </>
            ) : (
              <>
                <Li icon="🏁" label={t.departure || "Pick-Up Location"}>
                  {t[departure] || pretty(departure)}
                </Li>
                <Li icon="🎯" label={t.arrival || "Drop-Off Location"}>
                  {t[arrival] || pretty(arrival)}
                </Li>

                {(departure === "disney" || arrival === "disney") && disneyHotelLabel && (
                  <Li icon="🏨" label={t.selectHotel || "Choose your Disney hotel"}>
                    {disneyHotelLabel}
                  </Li>
                )}

                {/* Ajout des adresses si Paris est sélectionné pour les trajets normaux */}
                {departure === "paris" && departureAddress && (
                  <Li icon="📍" label={t.pickup_address || "Pick-up Address"}>
                    {departureAddress}
                  </Li>
                )}
                {arrival === "paris" && arrivalAddress && (
                  <Li icon="📍" label={t.dropoff_address || "Drop-off Address"}>
                    {arrivalAddress}
                  </Li>
                )}
              </>
            )}

            <Li icon="📅" label={t.departureDate || "Pick-Up Date & Time"}>
              {fmtDate(departureDate)}
            </Li>
            {tripType === "round-trip" && (
              <Li icon="↩️" label={t.returnDate || "Return Date"}>
                {fmtDate(returnDate)}
              </Li>
            )}

            <Li icon="👥" label={t.passengers || "Passengers"}>
              {passengers}
            </Li>
            <Li icon="👶" label={t.childSeats || "Child seats"}>
              {childSeats}
            </Li>
            <Li icon="🧳" label={t.luggage || "Luggage"}>
              {luggage}
            </Li>
            <Li icon="🚘" label={t.vehicleChoice || "Vehicle"}>
              {vehicleLabel}
            </Li>
          </ul>
        </section>

        {/* CLIENT */}
        <section className="mb-6">
          <h3 className="flex items-center gap-2 text-lg font-semibold mb-3">
            <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
            {t.customerInfo || "Client"}
          </h3>
          <ul className="space-y-2 text-[15px]">
            <Li icon="👤" label={t.fullName || "Full name"}>
              {fullName}
            </Li>
            <Li icon="✉️" label={t.email || "Email"}>
              {email}
            </Li>
            <Li icon="📞" label={t.phone || "Phone"}>
              {phoneCode} {phone}
            </Li>
            {flightNumber && (
              <Li icon="🛫" label={t.flightNumber || "Flight number"}>
                {flightNumber}
              </Li>
            )}
            {comment && (
              <Li icon="💬" label={t.comment || "Comment"}>
                {comment}
              </Li>
            )}
          </ul>
        </section>

        {/* FOOTER prix + actions */}
        <div className="mt-6 flex items-center gap-3">
          <div className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <div className="text-sm font-semibold text-emerald-800">
              {t.estimatedPrice || "Estimated price"}
            </div>
            <div className="text-lg font-bold">{price != null ? `${price} €` : "—"}</div>
          </div>

          <button
            type="button"
            onClick={prevStep}
            className="btn-secondary"
          >
            {t.back || "Back"}
          </button>

          <button
            type="button"
            disabled={sending}
            onClick={handleConfirm}
            className="h-12 px-6 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 active:translate-y-[1px] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? (t.sending || "Sending…") : (t.confirm || "Confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

// Petit composant ligne récap
function Li({ icon, label, children }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-lg leading-6">{icon}</span>
      <span>
        <strong className="capitalize">{label} :</strong>{" "}
        <span className="text-slate-800">{children}</span>
      </span>
    </li>
  );
}

// Met un label lisible à partir d'un id
function pretty(v = "") {
  return v.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

// Ajout de la validation des props
Step3_Recap.propTypes = {
  t: PropTypes.object.isRequired,
  tripType: PropTypes.string.isRequired,
  departure: PropTypes.string.isRequired,
  arrival: PropTypes.string.isRequired,
  departureDate: PropTypes.instanceOf(Date).isRequired,
  returnDate: PropTypes.instanceOf(Date),
  departureAddress: PropTypes.string,
  arrivalAddress: PropTypes.string,
  passengers: PropTypes.number.isRequired,
  childSeats: PropTypes.number.isRequired,
  luggage: PropTypes.number.isRequired,
  fullName: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  phone: PropTypes.string.isRequired,
  phoneCode: PropTypes.string.isRequired,
  flightNumber: PropTypes.string,
  comment: PropTypes.string,
  price: PropTypes.number,
  onBack: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default Step3_Recap;
