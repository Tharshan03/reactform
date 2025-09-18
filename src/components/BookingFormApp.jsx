import React, { useState, useEffect } from "react";
import { tarifsVtc } from "../data/tarifsVtc";
import translations from "../translations";
import Step1_TripSelection from "./Step1_TripSelection";
import Step2_CustomerInfo from "./Step2_CustomerInfo";
import Step3_Recap from "./Step3_Recap";
import { excursions } from "../data/excursions";
import "react-datepicker/dist/react-datepicker.css";
import "../index.css"; // ✅ charge nos styles après les CSS tiers

const BookingFormApp = () => {
  const lang = document.documentElement.lang?.substring(0, 2).toLowerCase() || "en";
  const t = translations.en;

  const [step, setStep] = useState(1);

  // === états principaux ===
  const [tripType, setTripType] = useState("one-way");
  const [departure, setDeparture] = useState("cdg");
  const [arrival, setArrival] = useState("disney");

  // *** Excursion ***
  const [selectedExcursion, setSelectedExcursion] = useState("paris_4h");

  // BookingFormApp.jsx
  const [hotelOther, setHotelOther] = useState("");


  const [selectedHotel, setSelectedHotel] = useState(null);
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);

  const [passengers, setPassengers] = useState(1);
  const [childSeats, setChildSeats] = useState(0);
  const [luggage, setLuggage] = useState(0);

  const [price, setPrice] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState("van_vito");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [mailStatus, setMailStatus] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  // Add states for addresses and phone
  const [departureAddress, setDepartureAddress] = useState("");
  const [arrivalAddress, setArrivalAddress] = useState("");
  const [phoneCode, setPhoneCode] = useState("+33"); // Default to France

  // === données auxiliaires ===
  const hotelOptions = [
    { value: "bb_bussy", label: "B&B Bussy St Georges" },
    { value: "bb_val_france", label: "Hotel B&B Val de France Disney" },
    { value: "best_western_bussy", label: "Best western Bussy St Georges" },
    { value: "campanile_bussy", label: "Campanile Bussy St Georges" },
    { value: "campanile_torcy", label: "Campanile Torcy" },
    { value: "chessy_gare", label: "Chessy Gare" },
    { value: "citéa_bussy", label: "Citéa Bussy St Georges" },
    { value: "dali", label: "Hotel Dali" },
    { value: "disney_park", label: "Disneyland paris (Park)" },
    { value: "explorers", label: "Hotel Explorers" },
    { value: "gare_mlv", label: "Gare Marne la Vallée" },
    { value: "grand_magic", label: "Grand Magic Hotel" },
    { value: "hotel_cheyenne", label: "Disney's hotel Cheyenne" },
    { value: "hotel_marvel", label: "Disney's hotel Marvel Newyork" },
    { value: "hotel_newport", label: "Disney's hotel Newport Bay Club" },
    { value: "hotel_santa_fe", label: "Disney's hotel Santa Fe" },
    { value: "hotel_sequoia", label: "Disney's hotel Sequoia Lodge" },
    { value: "ibis_val_europe", label: "Ibis Val d'Europe" },
    { value: "moxy", label: "Hotel Moxy Val d'Europe" },
    { value: "others", label: "Others" },
    { value: "paxton", label: "Paxton Ferrière" },
    { value: "radisson_blu", label: "Radisson Blu" },
    { value: "relais_spa", label: "Relais SPA" },
    { value: "residhome", label: "Resid'home" },
    { value: "séjours_affaires", label: "Séjours Affaires Apparthotel" },
    { value: "serris_gare", label: "Serris Gare" },
    { value: "stay_city", label: "Stay city Marne la Vallée" },
    { value: "val_d_europe", label: "Val d'Europe shopping center" },
    { value: "vallée_village", label: "Vallée Village" },
    { value: "vienna", label: "Vienna House Dream Castle Paris" },
    { value: "village_nature", label: "Village Nature" }
  ];

  const vehicleOptions = [
    { id: "mercedes", name: "Mercedes Classe E", extra: 0 },
    { id: "van_standard", name: "Van Standard", extra: 5 },
    { id: "van_vito", name: "Van Vito Premium", extra: 0 },
  ];

  const filteredVehicles =
    passengers <= 4
      ? vehicleOptions.filter(v => v.id !== "van_vito")
      : vehicleOptions.filter(v => v.id !== "mercedes");

  const vehicleImages = {
    mercedes: "/images/mercedes.jpg",
    van_standard: "/images/van_standard.jpg",
    van_vito: "/images/van_vito.jpg",
  };

  // === dates autos selon type de trajet (inchangé) ===
  useEffect(() => {
    if (tripType === "one-way") {
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDepartureDate(prev => !prev ? d : prev);
      setReturnDate(null);
    }
    if (tripType === "round-trip" && departureDate) {
      const r = new Date(departureDate);
      r.setDate(r.getDate() + 7);
      setReturnDate(r);
    }
  }, [tripType, departureDate]);

  // === calcul prix VTC classique ===
  useEffect(() => {
    if (tripType === "excursion") return;
    
    if (departure && arrival) {
      try {
        let key;
        // Cas spécial pour Paris-Paris
        if (departure === "paris" && arrival === "paris") {
          key = tripType === "round-trip" ? "paris-paris-paris" : "paris-paris";
        } else {
          // Autres destinations
          const baseKey = `${departure.toLowerCase()}-${arrival.toLowerCase()}`;
          key = tripType === "round-trip" ? `${baseKey}-${departure.toLowerCase()}` : baseKey;
        }

        const tarifsData = tarifsVtc[tripType];
        if (tarifsData?.[key]) {
          const basePrice = tarifsData[key][passengers - 1];
          const extra = selectedVehicle === "van_standard" && passengers <= 4 ? 5 : 0;
          setPrice(basePrice + extra);
          
          // Debug
          console.log({
            key,
            basePrice,
            passengers,
            finalPrice: basePrice + extra
          });
        } else {
          setPrice(null);
          console.log('Tarif non trouvé pour la clé:', key);
        }
      } catch (error) {
        console.error("Erreur calcul prix:", error);
        setPrice(null);
      }
    } else {
      setPrice(null);
    }
  }, [tripType, departure, arrival, passengers, selectedVehicle]);

  // === calcul prix EXCURSION ===
  useEffect(() => {
    if (tripType === "excursion" && selectedExcursion) {
      const excursionObj = excursions.find(e => e.value === selectedExcursion);
      setPrice(getExcursionPrice(excursionObj, passengers));
    }
  }, [tripType, selectedExcursion, passengers]);

  function getExcursionPrice(excursion, p) {
    if (!excursion) return null;
    if (p <= 4) return excursion.prices["1-4"];
    if (p <= 8) return excursion.prices["5-8"];
    if (p <= 12) return excursion.prices["9-12"];
    return excursion.prices["13-16"];
  }

  // === étapes ===
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleConfirm = async () => {
    setSending(true);
    setMailStatus("");

    try {
      // ID unique pour la réservation
      const bookingNumber = Date.now().toString();

      // Lien d’admin/confirmation
      const base = "https://parisairportdisneyprestigetransfer.fr/booking-taxi";
      const adminConfirmationLink =
        `${base}/confirm-mail.php?id=${bookingNumber}` +
        `&email=${encodeURIComponent(email)}` +
        `&name=${encodeURIComponent(fullName || "")}`;

      // formatage FR lisible
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

      const payload = {
        id: bookingNumber,
        adminConfirmationLink,             // ← UNE SEULE FOIS

        // client
        name: fullName,
        email,
        phone,
        flightNumber,
        comment,

        // trajet
        tripType,
        departure,
        arrival,
        departureDate: fmt(departureDate),
        pickupDate: fmt(departureDate),
        returnDate: tripType === "round-trip" ? fmt(returnDate) : "",
        passengers,
        childSeats,
        luggage,
        vehicle: selectedVehicle,
        price,
        selectedHotel,
        selectedExcursion: tripType === "excursion" ? selectedExcursion : "",

        // hotelOther: include free text if user chose "Others" for Disney hotel
        hotelOther,

        // utile côté serveur
        lang: document.documentElement.lang?.slice(0, 2).toLowerCase() || "en",
        captchaToken,
        phoneCode,
        departureAddress: tripType === "excursion" ? departureAddress : (departure === "paris" ? departureAddress : ""),
        arrivalAddress: arrival === "paris" ? arrivalAddress : "",
      };

      // PROD : utiliser le bon endpoint selon le type de trajet
      const endpoint = tripType === "excursion" 
        ? "/booking-taxi/send-mail-excursion.php" 
        : "/booking-taxi/send-mail.php";
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.status !== "success") {
        throw new Error(data?.message || "send_failed");
      }

      setMailStatus("success");
    } catch (err) {
      console.error(err);
      setMailStatus("error");
    } finally {
      setSending(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto p-4">
      {step === 1 && (
        <Step1_TripSelection
          t={t}
          tripType={tripType}
          setTripType={setTripType}
          departure={departure}
          setDeparture={setDeparture}
          arrival={arrival}
          setArrival={setArrival}
          selectedHotel={selectedHotel}
          setSelectedHotel={setSelectedHotel}
          departureDate={departureDate}
          setDepartureDate={setDepartureDate}
          returnDate={returnDate}
          setReturnDate={setReturnDate}
          passengers={passengers}
          setPassengers={setPassengers}
          childSeats={childSeats}
          setChildSeats={setChildSeats}
          luggage={luggage}
          setLuggage={setLuggage}
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
          price={price}
          nextStep={nextStep}
          hotelOptions={hotelOptions}
          filteredVehicles={filteredVehicles}
          vehicleImages={vehicleImages}
          // >>> props Excursion <<<
          selectedExcursion={selectedExcursion}
          setSelectedExcursion={setSelectedExcursion}
          departureAddress={departureAddress}
          setDepartureAddress={setDepartureAddress}
          arrivalAddress={arrivalAddress}
          setArrivalAddress={setArrivalAddress}
          // pass hotelOther and its setter so the child can manage the free text for Disney "Others"
          hotelOther={hotelOther}
          setHotelOther={setHotelOther}
        />
      )}

      {step === 2 && (
        <Step2_CustomerInfo
          t={t}
          fullName={fullName} setFullName={setFullName}
          email={email} setEmail={setEmail}
          phone={phone} setPhone={setPhone}
          flightNumber={flightNumber} setFlightNumber={setFlightNumber}
          comment={comment} setComment={setComment}
          prevStep={prevStep}
          nextStep={nextStep}
          captchaToken={captchaToken} setCaptchaToken={setCaptchaToken}
          phoneCode={phoneCode}
          setPhoneCode={setPhoneCode}
        />
      )}

      {step === 3 && (
        <Step3_Recap
          t={t}
          tripType={tripType}
          departure={departure}
          arrival={arrival}
          selectedHotel={selectedHotel}
          departureDate={departureDate}
          returnDate={returnDate}
          passengers={passengers}
          childSeats={childSeats}
          luggage={luggage}
          selectedVehicle={selectedVehicle}
          price={price}
          fullName={fullName}
          email={email}
          phone={phone}
          flightNumber={flightNumber}
          comment={comment}
          prevStep={prevStep}
          sending={sending}
          setSending={setSending}
          mailStatus={mailStatus}
          setMailStatus={setMailStatus}
          handleConfirm={handleConfirm}
          embedded   // 👈 ajoute ce prop
          // pass the free text for Disney "Others" to the recap
          hotelOther={hotelOther}
          phoneCode={phoneCode}
          departureAddress={departureAddress}
          arrivalAddress={arrivalAddress}
        />
      )}

    </div>
  );
};

export default BookingFormApp;
