// src/components/Step2_CustomerInfo.jsx
import React, { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";


const Step2_CustomerInfo = ({
  t,
  fullName, setFullName,
  email, setEmail,
  phone, setPhone,
  flightNumber, setFlightNumber,
  comment, setComment,
  prevStep, nextStep,
  captchaToken, setCaptchaToken,
}) => {
  const recaptchaRef = useRef(null);
  const [captchaError, setCaptchaError] = useState(false);
  const SITE_KEY = "6LfuxpsrAAAAAOBCiuCu1rkWSmxrTpY4P9jAWwKf"
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!captchaToken) { setCaptchaError(true); return; }
    setCaptchaError(false);
    nextStep();
  };

  return (
    <div
      className="origin-top-left scale-[0.75] w-[65%]"
      style={{ transformOrigin: "top left" }}
    >
      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-center">{t.step2_title}</h2>

          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {/* Champs */}
            <div>
              <label className="block text-sm font-semibold mb-1">👤 {t.fullName}</label>
              <input type="text" className="w-full border rounded px-3 py-2"
                     value={fullName} onChange={e => setFullName(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">✉️ {t.email}</label>
              <input type="email" className="w-full border rounded px-3 py-2"
                     value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">📞 {t.phone}</label>
              <input type="tel" className="w-full border rounded px-3 py-2"
                     value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                ✈️ {t.flightNumber} <span className="text-xs text-slate-500">({t.optional || "optionnel"})</span>
              </label>
              <input type="text" className="w-full border rounded px-3 py-2"
                     value={flightNumber} onChange={e => setFlightNumber(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">
                💬 {t.comment} <span className="text-xs text-slate-500">({t.optional || "optionnel"})</span>
              </label>
              <textarea className="w-full border rounded px-3 py-2"
                        value={comment} onChange={e => setComment(e.target.value)} rows={3} />
            </div>

            {/* reCAPTCHA */}
            <div className="mt-2 flex justify-center">
              <div className="inline-block transform scale-90 origin-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={SITE_KEY}
                  size="compact"
                  onChange={(token) => { setCaptchaToken(token); setCaptchaError(false); }}
                />
              </div>
            </div>

            {captchaError && (
              <div className="text-red-600 text-xs mt-1 text-center">
                {t.captchaError || "Veuillez valider le captcha"}
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4 pt-3">
            <button
              type="button"
              className="btn-secondary"   // ✅ style Back
              onClick={prevStep}
            >
              {t.previous}
            </button>

            <button
              type="submit"
              className={`h-12 px-6 rounded-xl bg-blue-600 text-white font-semibold shadow-lg hover:bg-blue-700 active:translate-y-[1px] transition ${!captchaToken ? "opacity-60 cursor-not-allowed" : ""}`}
              disabled={!captchaToken}
            >
              {t.next}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Step2_CustomerInfo;
