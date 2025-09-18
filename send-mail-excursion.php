<?php
declare(strict_types=1);
ini_set('display_errors', '1');
error_reporting(E_ALL);

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  exit(0);
}

/* =========================
   Réglages
========================= */
const RECAPTCHA_SECRET = '6LfuxpsrAAAAAPA3NxXAEodkgYHZW3OGykThO1J4';
const RECAPTCHA_MIN_SCORE = 0.4;
const ADMIN_EMAIL = 'booking@parisairportdisneyprestigetransfer.fr,tharshan0311@gmail.com,thangeshwaran1968@gmail.com,emmanuelsivade@gmail.com';
const FROM_EMAIL  = 'booking@parisairportdisneyprestigetransfer.fr';
const SAVE_DIR    = __DIR__ . '/bookings';

/* =========================
   Helpers
========================= */
function json_ok(array $extra = []): void {
  echo json_encode(['status' => 'success'] + $extra, JSON_UNESCAPED_UNICODE);
  exit;
}

function json_err(string $msg, int $code = 400, array $extra = []): void {
  http_response_code($code);
  echo json_encode(['status' => 'error', 'message' => $msg] + $extra, JSON_UNESCAPED_UNICODE);
  exit;
}

function clean_header_value(string $v): string {
  return trim(preg_replace('/[\r\n]+/', ' ', $v));
}

function get_input(): array {
  $raw = file_get_contents('php://input') ?: '';
  $data = json_decode($raw, true);
  if (!is_array($data)) $data = [];
  if (!empty($_POST)) {
    foreach ($_POST as $k => $v) {
      if (!array_key_exists($k, $data)) $data[$k] = $v;
    }
    if (isset($data['selectedHotel']) && is_string($data['selectedHotel'])) {
      $tmp = json_decode($data['selectedHotel'], true);
      if (is_array($tmp)) $data['selectedHotel'] = $tmp;
    }
  }
  return $data;
}

/* =========================
   Lecture input
========================= */
$data = get_input();

// Debug logging
error_log('send-mail-excursion.php received data: ' . json_encode($data));

/* =========================
   reCAPTCHA v3/v2
========================= */
$captcha = $data['captchaToken'] ?? '';
if (!$captcha) json_err('Captcha manquant', 400);

$verifyResp = @file_get_contents(
  'https://www.google.com/recaptcha/api/siteverify?secret=' . urlencode(RECAPTCHA_SECRET) .
  '&response=' . urlencode($captcha) .
  '&remoteip=' . urlencode($_SERVER['REMOTE_ADDR'] ?? '')
);
$captchaRes = json_decode($verifyResp, true) ?: [];

if (empty($captchaRes['success'])) {
  error_log('reCAPTCHA FAILED: ' . $verifyResp);
  json_err('Captcha invalide', 400);
}
if (isset($captchaRes['score']) && $captchaRes['score'] < RECAPTCHA_MIN_SCORE) {
  error_log('reCAPTCHA LOW SCORE: ' . $captchaRes['score']);
  json_err('Vérification anti-bot échouée', 400);
}

/* =========================
   Validation des champs EXCURSION
========================= */
// Champs obligatoires pour excursions
$required = [
  'name','email','phone',
  'departure',           // Point de départ (ex: cdg, orly)
  'selectedExcursion',   // Excursion choisie (ex: paris_4h)
  'passengers','childSeats','luggage','vehicle','price'
];

foreach ($required as $f) {
  if (!isset($data[$f]) || ($data[$f] === '' && $data[$f] !== '0')) {
    error_log("EXCURSION - Validation failed for field: $f. Value: " . ($data[$f] ?? 'NOT_SET'));
    json_err("Champ manquant ou vide pour excursion : $f", 400);
  }
}

// Date obligatoire
if (
  (!isset($data['departureDate']) || $data['departureDate'] === '') &&
  (!isset($data['pickupDate'])   || $data['pickupDate'] === '')
) {
  json_err("Champ manquant ou vide : departureDate ou pickupDate", 400);
}

$emailRaw = trim((string)($data['email'] ?? ''));
$email = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);
if (!$email) json_err("E-mail invalide", 400);

$phoneRaw = trim((string)($data['phone'] ?? ''));
if (!preg_match('/^[0-9+()\s.-]{6,20}$/', $phoneRaw)) {
  json_err("Téléphone invalide", 400);
}

/* =========================
   Normalisation & nettoyage
========================= */
$lang        = 'en'; // Force English for all emails
$name        = htmlspecialchars(trim((string)($data['name'] ?? '')), ENT_QUOTES, 'UTF-8');
$phone       = htmlspecialchars($phoneRaw, ENT_QUOTES, 'UTF-8');
$phoneCode   = htmlspecialchars(trim((string)($data['phoneCode'] ?? '+33')), ENT_QUOTES, 'UTF-8');
$fullPhone   = $phoneCode . ' ' . $phone;
$flight      = htmlspecialchars(trim((string)($data['flightNumber'] ?? '')), ENT_QUOTES, 'UTF-8');
$comment     = htmlspecialchars(trim((string)($data['comment'] ?? '')), ENT_QUOTES, 'UTF-8');
$departure   = htmlspecialchars(trim((string)($data['departure'] ?? '')), ENT_QUOTES, 'UTF-8');
$selectedExcursion = htmlspecialchars(trim((string)($data['selectedExcursion'] ?? '')), ENT_QUOTES, 'UTF-8');
$tripType    = 'excursion'; // Force excursion
$pickupDate  = htmlspecialchars(trim((string)($data['pickupDate'] ?? ($data['departureDate'] ?? ''))), ENT_QUOTES, 'UTF-8');
$returnDate  = htmlspecialchars(trim((string)($data['returnDate'] ?? '')), ENT_QUOTES, 'UTF-8');
$passengers  = (int)($data['passengers'] ?? 1);
$childSeats  = (int)($data['childSeats'] ?? 0);
$luggage     = (int)($data['luggage'] ?? 0);
$vehicle     = htmlspecialchars(trim((string)($data['vehicle'] ?? '')), ENT_QUOTES, 'UTF-8');
$priceNum    = (float)($data['price'] ?? 0);
$price       = number_format($priceNum, 2, '.', '');

// Adresse de pickup pour excursions
$departureAddress = htmlspecialchars(trim((string)($data['departureAddress'] ?? '')), ENT_QUOTES, 'UTF-8');

$fromName     = clean_header_value($name);
$replyToEmail = clean_header_value($email);

// Google Calendar Link for Admin (Excursions)
$dateObj = DateTime::createFromFormat('d/m/Y H:i', $pickupDate);
if (!$dateObj && !empty($data['departureDateISO'])) {
    $dateObj = new DateTime($data['departureDateISO']);
} elseif (!$dateObj) {
    $dateObj = new DateTime(); // fallback to now
}
$googleDate = $dateObj->format("Ymd\THis");
$endDate = clone $dateObj;
$endDate->add(new DateInterval('PT4H')); // Add 4 hours for excursion duration
$googleEndDate = $endDate->format("Ymd\THis");

$excursionName = $excursionLabels[$selectedExcursion] ?? $selectedExcursion;
$calendarTitle = "Excursion: {$fromName} - {$excursionName}";
$calendarDetails = "Client: {$fromName} ({$fullPhone})\n" .
    "Excursion: {$excursionName}\n" .
    "Departure: " . ucfirst($departure) . "\n" .
    ($departureAddress ? "Pickup: {$departureAddress}\n" : '') .
    "Passengers: {$passengers}\n" .
    "Vehicle: {$vehicle}\n" .
    "Price: €{$price}\n" .
    ($flight ? "Flight: {$flight}\n" : '') .
    ($comment ? "Comment: {$comment}\n" : '');

$googleCalendarLink = "https://calendar.google.com/calendar/render?action=TEMPLATE" .
    "&text=" . rawurlencode($calendarTitle) .
    "&dates={$googleDate}/{$googleEndDate}" .
    "&details=" . rawurlencode($calendarDetails) .
    "&location=" . rawurlencode($departureAddress ?: ucfirst($departure));

/* =========================
   Mapping des excursions
========================= */
$excursionLabels = [
  'paris_4h' => 'Paris 4h',
  'paris_night_4h' => 'Paris by night 4h',
  'paris_6h' => 'Paris 6h',
  'paris_8h' => 'Paris 8h',
  'paris_10h' => 'Paris 10h',
  'paris_versailles_rt' => 'Paris + Versailles (aller/retour)',
  'paris_versailles_one' => 'Paris + Versailles (aller simple)',
  'chateau_versailles_rt' => 'Château de Versailles (aller/retour)',
  'chateau_versailles_one' => 'Château de Versailles (aller simple)',
  'normandy_beach' => 'Normandy Beach',
  'omaha_beach' => 'Omaha Beach',
  'mont_saint_michel' => 'Mont Saint Michel',
  'vallee_loire' => 'Vallée de la Loire',
  'normandie' => 'Normandie',
  'giverny' => 'Giverny'
];

$excursionName = $excursionLabels[$selectedExcursion] ?? $selectedExcursion;

/* =========================
   ID & Lien d'admin
========================= */
$bookingNumber = isset($data['id']) && $data['id'] !== '' ? (string)$data['id'] : (string)time();
$confirmLink = $data['adminConfirmationLink'] ?? (
  "https://parisairportdisneyprestigetransfer.fr/booking-taxi/confirm-mail.php" .
  "?id={$bookingNumber}&email=" . urlencode($email) .
  "&name=" . urlencode($name)
);

/* =========================
   Sauvegarde JSON
========================= */
if (!is_dir(SAVE_DIR)) { @mkdir(SAVE_DIR, 0755, true); }

$toSave = $data + [
  'id' => $bookingNumber,
  'adminConfirmationLink' => $confirmLink,
  'departureDateFormatted' => $pickupDate,
  'returnDateFormatted'    => $returnDate,
  'server_time'            => date('c'),
  'ip'                     => $_SERVER['REMOTE_ADDR'] ?? '',
  'ua'                     => $_SERVER['HTTP_USER_AGENT'] ?? '',
  'processed_by'           => 'send-mail-excursion.php'
];

$filePath = SAVE_DIR . "/{$bookingNumber}.json";
if (@file_put_contents($filePath, json_encode($toSave, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) === false) {
  json_err("Impossible d'écrire le fichier de réservation", 500);
}

/* =========================
   Traductions e-mails
========================= */
$t = [
  'subject' => "Thank you for your excursion reservation request",
  'title' => "Thank you for your excursion reservation request!",
  'intro' => "Your excursion request has been successfully submitted. We will contact you shortly to confirm the booking.",
  'summary' => "Here are the details you provided:",
  'fields' => [
    'name'=>"Full Name",'email'=>"Email",'phone'=>"Phone",'flight'=>"Flight / Train Number",
    'from'=>"From",'excursion'=>"Excursion",'date'=>"Pickup Date and Time",
    'passengers'=>"Passengers",'childSeats'=>"Child Seats",'luggage'=>"Luggage",
    'vehicle'=>"Vehicle",'price'=>"Estimated Price",
    'pickup_address' => "Pick-up Address"
  ],
  'note' => "Night surcharge: €10 applies between 10:00 PM and 5:00 AM.",
  'payment' => "Payment methods: Cash or credit card.",
  'contact' => "Contact"
];

/* =========================
   EMAIL ADMIN - EXCURSION
========================= */
$subjectAdmin = '🎯 New EXCURSION Request - ' . $excursionName . ' - ' . $fromName;

$headersAdmin  = "From: " . FROM_EMAIL . "\r\n";
$headersAdmin .= "Reply-To: {$fromName} <{$replyToEmail}>\r\n";
$headersAdmin .= "MIME-Version: 1.0\r\n";
$headersAdmin .= "Content-Type: text/html; charset=UTF-8\r\n";

$messageAdmin = '
<html>
<head>
  <meta charset="UTF-8">
  <title>New Excursion Booking Request</title>
  <style>
    body { font-family: "Segoe UI", sans-serif; background: #f4f4f4; padding: 40px; }
    .container { background: white; max-width: 650px; margin: auto; padding: 30px; border-radius: 12px; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
    .logo { text-align: center; margin-bottom: 20px; }
    .logo img { max-width: 100px; }
    h2 { text-align: center; color: #e67e22; margin-bottom: 30px; }
    h3 { color: #333; border-bottom: 2px solid #e67e22; padding-bottom: 8px; margin-top: 30px; }
    .excursion-highlight {
      background: #fff3cd;
      border: 2px solid #e67e22;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .excursion-highlight h4 {
      color: #e67e22;
      margin: 0 0 10px 0;
      font-size: 20px;
    }
    .excursion-name {
      font-size: 18px;
      font-weight: bold;
      color: #e67e22;
    }
    ul { list-style: none; padding: 0; }
    li { 
      background: #f8f9fa;
      padding: 8px 15px;
      margin: 5px 0;
      border-left: 4px solid #e67e22;
      border-radius: 4px;
    }
    .admin-actions {
      background: #e8f4f8;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
      text-align: center;
    }
    .admin-btn {
      display: inline-block;
      background: #e67e22;
      color: white;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 10px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 13px;
      color: #777;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://parisairportdisneyprestigetransfer.fr/booking-taxi/images/logo.png" alt="PADPT Logo">
    </div>

    <h2>🎯 New EXCURSION Booking Request</h2>

    <div class="excursion-highlight">
      <h4>Selected Excursion</h4>
      <p class="excursion-name">' . htmlspecialchars($excursionName) . '</p>
    </div>

    <h3>🚐 Excursion Details</h3>
    <ul>
      <li><strong>Type:</strong> EXCURSION</li>
      <li><strong>Excursion:</strong> ' . htmlspecialchars($excursionName) . '</li>'
      . ($departureAddress ? '<li><strong>Pickup Address:</strong> ' . htmlspecialchars($departureAddress) . '</li>' : '') . '
      <li><strong>Pickup Date:</strong> ' . htmlspecialchars($pickupDate) . '</li>'
      . ($returnDate ? '<li><strong>Return Date:</strong> ' . htmlspecialchars($returnDate) . '</li>' : '') . '
      <li><strong>Passengers:</strong> ' . htmlspecialchars((string)$passengers) . '</li>
      <li><strong>Child Seats:</strong> ' . htmlspecialchars((string)$childSeats) . '</li>
      <li><strong>Luggage:</strong> ' . htmlspecialchars((string)$luggage) . '</li>
      <li><strong>Vehicle:</strong> ' . htmlspecialchars($vehicle) . '</li>
      <li><strong>Price:</strong> €' . htmlspecialchars($price) . '</li>
    </ul>

    <h3>🧍 Customer Details</h3>
    <ul>
      <li><strong>Name:</strong> ' . htmlspecialchars($fromName) . '</li>
      <li><strong>Email:</strong> ' . htmlspecialchars($email) . '</li>
      <li><strong>Phone:</strong> ' . htmlspecialchars($fullPhone) . '</li>'
      . ($flight ? '<li><strong>Flight:</strong> ' . htmlspecialchars($flight) . '</li>' : '')
      . ($comment ? '<li><strong>Comment:</strong> ' . nl2br(htmlspecialchars($comment)) . '</li>' : '') . '
    </ul>

    <div class="admin-actions">
      <h4>🔧 Administration</h4>
      <a href="' . htmlspecialchars($confirmLink) . '" target="_blank" class="admin-btn">📧 Send Confirmation</a>
      <a href="' . htmlspecialchars($googleCalendarLink) . '" target="_blank" class="admin-btn" style="background-color: #4285F4;">📅 Add to Calendar</a>
      <p style="font-size: 12px; color: #666; margin-top: 15px;">
        Confirmation Link: ' . htmlspecialchars($confirmLink) . '
      </p>
    </div>

    <div class="footer">
      Excursion booking managed by PADPT system<br>
      Booking ID: ' . htmlspecialchars($bookingNumber) . ' | Processed: ' . date('d/m/Y H:i') . '
    </div>
  </div>
</body>
</html>';

/* =========================
   EMAIL CLIENT - EXCURSION
========================= */
$confirmationSubject = '✅ Excursion Request Received - ' . $excursionName;
$confirmationHeaders  = "From: " . FROM_EMAIL . "\r\n";
$confirmationHeaders .= "Reply-To: " . ADMIN_EMAIL . "\r\n";
$confirmationHeaders .= "MIME-Version: 1.0\r\n";
$confirmationHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";

$confirmationMessage = '
<html lang="'.$lang.'">
<head>
  <meta charset="UTF-8">
  <title>Excursion Request Received</title>
  <style>
    body { font-family: "Segoe UI", sans-serif; background: #f4f4f4; padding: 40px; margin: 0; }
    .container { background: white; max-width: 650px; margin: auto; padding: 30px; border-radius: 12px; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
    .logo { text-align: center; margin-bottom: 20px; }
    .logo img { max-width: 100px; }
    h1 { text-align: center; color: #e67e22; font-size: 22px; margin-bottom: 10px; }
    h3 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 30px; }
    p { margin: 8px 0; line-height: 1.6; }
    .excursion-highlight {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .excursion-highlight h4 {
      color: #e67e22;
      margin: 0 0 10px 0;
      font-size: 18px;
    }
    .excursion-name {
      font-size: 18px;
      font-weight: bold;
      color: #e67e22;
    }
    .info-box {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin: 15px 0;
      border-left: 4px solid #e67e22;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 13px;
      color: #777;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="https://parisairportdisneyprestigetransfer.fr/booking-taxi/images/logo.png" alt="PADPT Logo">
    </div>

    <h1>Thank you for your excursion request! 🎯</h1>
    
    <div class="excursion-highlight">
      <h4>Selected Excursion</h4>
      <p class="excursion-name">'.htmlspecialchars($excursionName).'</p>
    </div>

    <p>Your excursion request has been successfully submitted. We will contact you shortly to confirm the booking and provide additional details about your tour.</p>

    <h3>🧍 Your Information</h3>
    <div class="info-box">
      <p><strong>'.$t['fields']['name'].':</strong> '.htmlspecialchars($fromName).'</p>
      <p><strong>'.$t['fields']['email'].':</strong> '.htmlspecialchars($email).'</p>
      <p><strong>'.$t['fields']['phone'].':</strong> '.htmlspecialchars($phone).'</p>'
      .($flight ? '<p><strong>'.$t['fields']['flight'].':</strong> '.htmlspecialchars($flight).'</p>' : '').'
    </div>

    <h3>🚐 Excursion Details</h3>
    <div class="info-box">
      <p><strong>Excursion:</strong> <span style="color:#e67e22; font-weight:bold;">'.htmlspecialchars($excursionName).'</span></p>'
      .($departureAddress ? '<p><strong>'.$t['fields']['pickup_address'].':</strong> '.htmlspecialchars($departureAddress).'</p>' : '').'
      <p><strong>'.$t['fields']['date'].':</strong> '.htmlspecialchars($pickupDate).'</p>'
      .($returnDate ? '<p><strong>Return Date:</strong> '.htmlspecialchars($returnDate).'</p>' : '').'
      <p><strong>'.$t['fields']['passengers'].':</strong> '.htmlspecialchars((string)$passengers).'</p>
      <p><strong>'.$t['fields']['childSeats'].':</strong> '.htmlspecialchars((string)$childSeats).'</p>
      <p><strong>'.$t['fields']['luggage'].':</strong> '.htmlspecialchars((string)$luggage).'</p>
      <p><strong>'.$t['fields']['vehicle'].':</strong> '.ucfirst(htmlspecialchars($vehicle)).'</p>
      <p><strong>'.$t['fields']['price'].':</strong> €'.htmlspecialchars($price).'</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="'.htmlspecialchars($googleCalendarLink).'" target="_blank" style="
        display: inline-block;
        background-color: #4285F4;
        color: white;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin: 10px;
      ">📅 Add to Google Calendar</a>
      <a href="tel:+33751376184" style="
        display: inline-block;
        background-color: #e67e22;
        color: white;
        padding: 12px 25px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin: 10px;
      ">📞 Call the driver</a>
    </div>

    <h3>ℹ️ Important Information</h3>
    <div class="info-box">
      <p>🎯 <strong>Excursion Guide:</strong> Professional guide included for sightseeing tours.</p>
      <p>⏰ <strong>Duration:</strong> Please refer to your selected excursion package for duration details.</p>
      <p>💬 <strong>Night Surcharge:</strong> €15 applies between 9:00 PM and 6:00 AM.</p>
      <p>💳 <strong>Payment:</strong> Cash or credit card (please notify if paying by card).</p>
      <p>📞 <strong>Contact:</strong> +33 7 51 37 61 84 — info@parisairportdisneyprestigetransfer.com</p>
    </div>

    <div class="footer">
      Paris Airport Disney Prestige Transfer<br>
      119 Avenue Carnot, 93140 Bondy<br>
      www.parisairportdisneyprestigetransfer.fr
    </div>
  </div>
</body>
</html>';

/* =========================
   Envoi des emails
========================= */
$okAdmin  = @mail(ADMIN_EMAIL, clean_header_value($subjectAdmin), $messageAdmin, $headersAdmin);
$okClient = $email ? @mail($email, clean_header_value($confirmationSubject), $confirmationMessage, $confirmationHeaders) : true;

if ($okAdmin && $okClient) {
  json_ok(['id' => $bookingNumber]);
} else {
  error_log('EXCURSION MAIL ERROR: admin=' . ($okAdmin?'1':'0') . ' client=' . ($okClient?'1':'0'));
  json_err("Erreur lors de l'envoi des e-mails d'excursion.", 500);
}