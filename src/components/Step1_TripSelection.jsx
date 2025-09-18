import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import { destinations } from "../data/destinations";
import { excursions } from "../data/excursions";

export default function Step1_TripSelection({
  t,
  tripType, setTripType,
  departure, setDeparture,
  arrival, setArrival,
  selectedHotel, setSelectedHotel,
  departureDate, setDepartureDate,
  returnDate, setReturnDate,
  hotelOther,
  setHotelOther,
  price,
  hotelOptions,
  departureAddress, setDepartureAddress,
  arrivalAddress, setArrivalAddress,
  passengers, setPassengers,
  childSeats, setChildSeats,
  luggage, setLuggage,
  // Excursion
  selectedExcursion, setSelectedExcursion,
  // Nav
  nextStep,
  embedded = false,
  // Images
  vehicleImages,
}) {
  const isRoundTrip = tripType === "round-trip";
  const isDisney = departure === "disney" || arrival === "disney";

  // When the user selects the "Others" option for Disney hotels, we want
  // to keep a local copy of the free-text input. Directly using the
  // `hotelOther` prop can lead to a stale value during typing due to
  // React state updates being asynchronous. By storing the value locally
  // and syncing it with the parent via `setHotelOther`, we ensure the
  // input is responsive and the `canContinue` condition updates
  // immediately.
  const [internalHotelOther, setInternalHotelOther] = useState(hotelOther || "");

  // Keep our internal state in sync when the parent changes. This
  // addresses cases where the parent resets `hotelOther` when another
  // hotel is selected.
  useEffect(() => {
    setInternalHotelOther(hotelOther || "");
  }, [hotelOther]);

  // Options villes
  const departureOptions = [
    { 
      label: "France", 
      options: destinations.filter(d => d.country === "France") // Suppression de && d.value !== arrival
    },
    { 
      label: "Belgique", 
      options: destinations.filter(d => d.country === "Belgique") 
    },
    { 
      label: "Pays-Bas", 
      options: destinations.filter(d => d.country === "Pays-Bas") 
    }
  ];
  const arrivalOptions = [
    { 
      label: "France", 
      options: destinations.filter(d => d.country === "France") // Suppression de && d.value !== departure
    },
    { 
      label: "Belgique", 
      options: destinations.filter(d => d.country === "Belgique") 
    },
    { 
      label: "Pays-Bas", 
      options: destinations.filter(d => d.country === "Pays-Bas") 
    }
  ];

  // Excursions
  const excursionOptions = excursions.map(e => ({ value: e.value, label: e.label }));

  // Hôtel Disney par défaut
  const defaultDisneyHotel = useMemo(
    () => hotelOptions?.find(h => String(h.value).toLowerCase() === "disney_park"),
    [hotelOptions]
  );
  useEffect(() => {
    if (tripType !== "excursion" && isDisney && !selectedHotel && defaultDisneyHotel) {
      setSelectedHotel(defaultDisneyHotel);
    }
  }, [tripType, isDisney, selectedHotel, defaultDisneyHotel, setSelectedHotel]);

  // Règles
  const maxChildSeats = Math.max(0, passengers - 1);
  const canContinue =
    price != null &&
    (tripType === "excursion"
      ? !!selectedExcursion
      : (!isDisney ||
        (selectedHotel &&
          (selectedHotel.value !== 'others' || (internalHotelOther && internalHotelOther.trim() !== ""))
        )));

  // Styles react-select
  const selectStyles = {
    control: (base) => ({ ...base, minHeight: 38 }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };
  const ariaLiveMessages = {
    guidance: () => "", onFocus: () => "", onSelect: () => "",
    onFilter: () => "", onMenuOpen: () => "", onMenuClose: () => ""
  };
  const selectCommonProps = {
    isSearchable: true,
    menuPortalTarget: typeof window !== "undefined" ? document.body : null,
    menuPosition: "fixed",
    styles: selectStyles,
    classNamePrefix: "rs",
    ariaLiveMessages,
    screenReaderStatus: () => ""
  };

  // Bouton compteur
  const Btn = ({ onClick, disabled, children, aria }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={aria}
      className={`h-8 w-8 rounded-full border bg-white hover:bg-slate-50 grid place-items-center text-[18px] leading-none ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </button>
  );

  // URL image Van Vito (fallback public/)
  const vanVitoUrl = (vehicleImages && vehicleImages.van_vito) || "/images/van_vito.jpg";

  return (
    <div className="origin-top-left scale-[.75] w-[65%]" style={{ transformOrigin: "top left" }}>
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8 min-h-[560px] flex flex-col">
        <h2 className="text-xl font-bold text-center mb-4">{t.step1_title}</h2>

        {/* PILL SWITCH */}
        <div className="flex justify-center gap-2 mb-4" role="group" aria-label="Type de trajet">
          {[
            { id: "one-way", label: t.one_way },
            { id: "round-trip", label: t.round_trip },
            { id: "excursion", label: t.excursion },
          ].map(btn => (
            <button
              key={btn.id}
              type="button"
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                tripType === btn.id ? "bg-blue-600 text-white shadow" : "bg-gray-100 text-gray-700"
              }`}
              aria-pressed={tripType === btn.id}
              onClick={() => setTripType(btn.id)}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* CONTENU */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {tripType === "excursion" ? (
            <>
              {/* Date & heure (pickup) */}
              <div>
                <label className="block text-sm font-semibold mb-1">📅 {t.departure_date || "Pickup Date"}</label>
                <DatePicker
                  selected={departureDate}
                  onChange={(d) => setDepartureDate(d)}
                  showTimeSelect timeIntervals={15}
                  dateFormat="dd/MM/yyyy HH:mm"
                  minDate={new Date()}
                  className="w-full border rounded px-3 py-2"
                  popperModifiers={[
                    {
                      name: "preventOverflow",
                      options: {
                        rootBoundary: "viewport",
                        tether: false,
                        altAxis: true
                      }
                    }
                  ]}
                  popperPlacement="bottom-start"
                  popperProps={{
                    positionFixed: true
                  }}
                />
              </div>

              {/* Sélection Excursion */}
              <div>
                <label className="block text-sm font-semibold mb-1">🗺️ {t.excursion || "Excursion"}</label>
                <Select
                  {...selectCommonProps}
                  options={excursionOptions}
                  value={excursionOptions.find(x => x.value === selectedExcursion) || null}
                  onChange={(opt) => setSelectedExcursion(opt?.value || null)}
                  placeholder={t.selectExcursion || "Choisir une excursion…"}
                />
              </div>

              {/* Ajout du champ d'adresse de prise en charge */}
              <div className="bg-[#F0FFF4] p-4 rounded-xl mt-4">
                <label className="block text-sm font-semibold mb-1">📍 {t.pickup_address || "Pick-up Address"}</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={departureAddress}
                  onChange={(e) => setDepartureAddress(e.target.value)}
                  placeholder={t.address_placeholder || "Enter your pick-up address"}
                  required
                />
              </div>

              {/* Compteurs */}
              <div className="pt-1">
                <div className="flex items-center justify-between px-6 inline-counters">
                  {/* Passagers */}
                  <div className="flex flex-col items-center">
                    <span className="text-2xl" aria-hidden>🧍</span>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <Btn onClick={() => setPassengers(p => Math.max(1, p - 1))} aria="Diminuer passagers">–</Btn>
                      <span className="w-6 text-center select-none">{passengers}</span>
                      <Btn onClick={() => setPassengers(p => Math.min(16, p + 1))} aria="Augmenter passagers">+</Btn>
                    </div>
                  </div>

                  {/* Sièges enfant */}
                  <div className="flex flex-col items-center">
                    <span className="text-2xl" aria-hidden>👶</span>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <Btn onClick={() => setChildSeats(n => Math.max(0, n - 1))} disabled={childSeats <= 0} aria="Diminuer sièges enfant">–</Btn>
                      <span className="w-6 text-center select-none">{childSeats}</span>
                      <Btn onClick={() => setChildSeats(n => Math.min(maxChildSeats, n + 1))} disabled={childSeats >= maxChildSeats} aria="Augmenter sièges enfant">+</Btn>
                    </div>
                  </div>

                  {/* Valises */}
                  <div className="flex flex-col items-center">
                    <span className="text-2xl" aria-hidden>🧳</span>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <Btn onClick={() => setLuggage(n => Math.max(0, n - 1))} disabled={luggage <= 0} aria="Diminuer valises">–</Btn>
                      <span className="w-6 text-center select-none">{luggage}</span>
                      <Btn onClick={() => setLuggage(n => n + 1)} aria="Augmenter valises">+</Btn>
                    </div>
                  </div>
                </div>
              </div>

              
            </>
          ) : (
            <>
              {/* Dates */}
              <div className={`grid grid-cols-1 ${isRoundTrip ? "md:grid-cols-2 md:gap-3" : ""}`}>
                <div>
                  <label className="block text-sm font-semibold mb-1">📅 {t.departure_date || "Date de départ"}</label>
                  <DatePicker
                    selected={departureDate}
                    onChange={(d) => setDepartureDate(d)}
                    showTimeSelect timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    minDate={new Date()}
                    className="w-full border rounded px-3 py-2"
                    popperModifiers={[
                      {
                        name: "preventOverflow",
                        options: {
                          rootBoundary: "viewport",
                          tether: false,
                          altAxis: true
                        }
                      }
                    ]}
                    popperPlacement="bottom-start"
                    popperProps={{
                      positionFixed: true
                    }}
                  />
                </div>
                {isRoundTrip && (
                  <div>
                    <label className="block text-sm font-semibold mb-1">📅 {t.return_date || "Date de retour"}</label>
                    <DatePicker
                      selected={returnDate}
                      onChange={(d) => setReturnDate(d)}
                      showTimeSelect timeIntervals={15}
                      dateFormat="dd/MM/yyyy HH:mm"
                      minDate={departureDate || new Date()}
                      className="w-full border rounded px-3 py-2"
                      popperModifiers={[
                        {
                          name: "preventOverflow",
                          options: {
                            rootBoundary: "viewport",
                            tether: false,
                            altAxis: true
                          }
                        }
                      ]}
                      popperPlacement="bottom-start"
                      popperProps={{
                        positionFixed: true
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Départ */}
              <div>
                <label className="block text-sm font-semibold mb-1">🚩 {t.departure}</label>
                <Select
                  {...selectCommonProps}
                  options={departureOptions}
                  value={destinations.find(opt => opt.value === departure)}
                  onChange={(opt) => setDeparture(opt?.value || "")}
                  placeholder="Sélectionnez la ville de départ"
                />
              </div>
              {departure === "paris" && (
                <div className="mt-2 bg-[#F0FFF4] p-4 rounded-xl">
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={departureAddress}
                    onChange={(e) => setDepartureAddress(e.target.value)}
                    placeholder={t.address_placeholder || "Adresse de départ"}
                    required
                  />
                </div>
              )}

              {/* Arrivée */}
              <div>
                <label className="block text-sm font-semibold mb-1">🏁 {t.arrival}</label>
                <Select
                  {...selectCommonProps}
                  options={arrivalOptions}
                  value={destinations.find(opt => opt.value === arrival)}
                  onChange={(opt) => setArrival(opt?.value || "")}
                  placeholder="Sélectionnez la ville d'arrivée"
                />
              </div>
              {arrival === "paris" && (
                <div className="mt-2 bg-[#F0FFF4] p-4 rounded-xl">
                  <input
                    type="text"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={arrivalAddress}
                    onChange={(e) => setArrivalAddress(e.target.value)}
                    placeholder={t.address_placeholder || "Adresse d'arrivée"}
                    required
                  />
                </div>
              )}

              {/* Hôtel Disney (si Disney) */}
              {isDisney && (
                <div>
                  <label className="block text-sm font-semibold mb-1">🏨 {t.selectHotel || "Choisissez votre hôtel à Disney"}</label>
                  <Select
                    {...selectCommonProps}
                    options={hotelOptions}
                    value={selectedHotel}
                    onChange={(opt) => {
                      setSelectedHotel(opt);
                      // reset free text if another hotel is selected
                      if (opt?.value !== 'others') {
                        // Clear both our local state and the parent state
                        if (typeof setHotelOther === 'function') setHotelOther("");
                        setInternalHotelOther("");
                      }
                    }}
                    isClearable={false}
                    placeholder={t.hotelPlaceholder || "Sélectionner un hôtel…"}
                  />
                  {!selectedHotel && (
                    <p className="text-xs text-red-600 mt-1">Ce champ est obligatoire.</p>
                  )}
                  {/* Input free text when Others selected */}
                  {selectedHotel?.value === 'others' && (
                    <>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2 text-sm mt-2"
                        value={internalHotelOther}
                        onChange={(e) => {
                          const val = e.target.value.slice(0, 50);
                          setInternalHotelOther(val);
                          if (typeof setHotelOther === 'function') {
                            setHotelOther(val);
                          }
                        }}
                        maxLength={50}
                        placeholder={t.otherHotelPlaceholder || "Indiquez l'emplacement (max 50 caractères)"}
                        required
                      />
                      {/* Show an error if free text is empty */}
                      {(!internalHotelOther || !internalHotelOther.trim()) && (
                        <p className="text-xs text-red-600 mt-1">{t.otherHotelRequired || "Veuillez indiquer l'emplacement (50 caractères max)."}</p>
                      )}
                    </>
                  )}
                </div>
              )}


              {/* Compteurs */}
              <div className="pt-1">
                <div className="flex items-center justify-between px-6 inline-counters">
                  {/* Passagers */}
                  <div className="flex flex-col items-center">
                    <span className="text-2xl" aria-hidden>🧍</span>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <Btn onClick={() => setPassengers(p => Math.max(1, p - 1))} aria="Diminuer passagers">–</Btn>
                      <span className="w-6 text-center select-none">{passengers}</span>
                      <Btn onClick={() => setPassengers(p => Math.min(16, p + 1))} aria="Augmenter passagers">+</Btn>
                    </div>
                  </div>

                  {/* Sièges enfant */}
                  <div className="flex flex-col items-center">
                    <span className="text-2xl" aria-hidden>👶</span>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <Btn onClick={() => setChildSeats(n => Math.max(0, n - 1))} disabled={childSeats <= 0} aria="Diminuer sièges enfant">–</Btn>
                      <span className="w-6 text-center select-none">{childSeats}</span>
                      <Btn onClick={() => setChildSeats(n => Math.min(maxChildSeats, n + 1))} disabled={childSeats >= maxChildSeats} aria="Augmenter sièges enfant">+</Btn>
                    </div>
                  </div>

                  {/* Valises */}
                  <div className="flex flex-col items-center">
                    <span className="text-2xl" aria-hidden>🧳</span>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <Btn onClick={() => setLuggage(n => Math.max(0, n - 1))} disabled={luggage <= 0} aria="Diminuer valises">–</Btn>
                      <span className="w-6 text-center select-none">{luggage}</span>
                      <Btn onClick={() => setLuggage(n => n + 1)} aria="Augmenter valises">+</Btn>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ====== Vehicle (Van Vito – selected by default) ====== */}
          <div className="pt-1 mb-6"> {/* Ajout de mb-6 pour créer l'espace */}
            <div role="option" aria-selected="true" className="vehicle-card selected">
              <div className="vehicle-photo">
                <img
                  src={vanVitoUrl}
                  alt="Van Vito Premium"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <div className="min-w-0">
                <div className="font-semibold leading-5">Van Vito Premium</div>
                <div className="vehicle-badge" aria-label="Selected by default">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.1 7.1a1 1 0 0 1-1.4 0L3.3 9.9a1 1 0 1 1 1.4-1.4l3.2 3.2 6.4-6.4a1 1 0 0 1 1.4 0z"/>
                  </svg>
                  Selected
                </div>
              </div>
            </div>
          </div>
          {/* ====== /Vehicle ====== */}
        </div>

        {/* FOOTER */}
        <div className="mt-12"> {/* Garde la marge supérieure */}
          <div className="price-next-container">
            <div className="estimate-price-box">
              <div className="text-sm text-emerald-700/90 font-medium">{t.estimatedPrice || "Prix estimé"}</div>
              <div className="text-2xl font-extrabold text-emerald-700">
                {price != null ? `${price} €` : "--"}
              </div>
            </div>
            <button
              type="button"
              onClick={() => { if (canContinue) nextStep(); }}
              className="btn-next"
              disabled={!canContinue}
            >
              {t.next || "Suivant"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
