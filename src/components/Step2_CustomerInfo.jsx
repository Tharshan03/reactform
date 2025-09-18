// src/components/Step2_CustomerInfo.jsx
import React, { useRef, useState } from "react";
import { phoneCodes } from "../data/phoneCodes";
import ReCAPTCHA from "react-google-recaptcha";


const Step2_CustomerInfo = ({
  t,
  fullName, setFullName,
  email, setEmail,
  phoneCode, setPhoneCode,
  phone, setPhone,
  flightNumber, setFlightNumber,
  comment, setComment,
  prevStep, nextStep,
  captchaToken, setCaptchaToken,
}) => {
  const recaptchaRef = useRef(null);
  const [captchaError, setCaptchaError] = useState(false);
  const SITE_KEY = "6LfuxpsrAAAAAOBCiuCu1rkWSmxrTpY4P9jAWwKf"

  // Liste des indicatifs importée depuis data/phoneCodes.js
  const countryCodes = phoneCodes;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!captchaToken) { setCaptchaError(true); return; }
    setCaptchaError(false);
    nextStep();
  };

  return (
    <div className="w-full max-w-[500px] mx-auto" style={{ transform: "scale(0.9)" }}>
      <div className="bg-white rounded-xl shadow-md p-6 overflow-y-auto max-h-[80vh]">
        <h2 className="text-xl font-bold mb-6">{t.step2_title}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="field-fullname bg-[#F0F7FF] p-4 rounded-xl">
            <label className="text-sm font-semibold">👤 {t.fullName}</label>
            <input
              type="text"
              className="w-full mt-1 p-2 rounded-lg border border-gray-200"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="field-email bg-[#FFF7ED] p-4 rounded-xl">
            <label className="text-sm font-semibold">✉️ {t.email}</label>
            <input
              type="email"
              className="w-full mt-1 p-2 rounded-lg border border-gray-200"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="field-phone bg-[#F0FFF4] p-4 rounded-xl">
            <label className="block text-sm font-semibold mb-1">📞 {t.phone}</label>
            <div className="phone-input-group">
              <select
                value={phoneCode}
                onChange={e => setPhoneCode(e.target.value)}
                className="w-24 h-10 px-2 rounded-lg border border-gray-200 bg-white"
              >
                {countryCodes.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                className="flex-1 h-10 px-3 rounded-lg border border-gray-200 bg-white"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={t.phone_placeholder || "Votre numéro"}
                required
              />
            </div>
          </div>

          <div className="field-flight bg-[#FDF4FF] p-4 rounded-xl">
            <label className="text-sm font-semibold">✈️ {t.flightNumber}</label>
            <input
              type="text"
              className="w-full mt-1 p-2 rounded-lg border border-gray-200"
              value={flightNumber}
              onChange={e => setFlightNumber(e.target.value)}
            />
          </div>

          <div className="field-comment bg-[#F5F3FF] p-4 rounded-xl">
            <label className="text-sm font-semibold">💬 {t.comment}</label>
            <textarea
              className="w-full mt-1 p-2 rounded-lg border border-gray-200 resize-none"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-center py-2">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={SITE_KEY}
              onChange={token => {
                setCaptchaToken(token);
                setCaptchaError(false);
              }}
            />
          </div>

          <div className="flex justify-between mt-6 gap-4">
            <button
              type="button"
              onClick={prevStep}
              className="btn-back flex-1"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!captchaToken}
              className="btn-next flex-1"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Step2_CustomerInfo;
