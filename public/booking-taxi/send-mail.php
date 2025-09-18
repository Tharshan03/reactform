<?php
declare(strict_types=1);
ini_set('display_errors', '0');
error_reporting(E_ALL);
header('Content-Type: application/json; charset=UTF-8');

/* =========================
   Réglages
========================= */
const RECAPTCHA_SECRET = '6LfuxpsrAAAAAPA3NxXAEodkgYHZW3OGykThO1J4';
const RECAPTCHA_MIN_SCORE = 0.4;
const ADMIN_EMAIL = 'booking@parisairportdisneyprestigetransfer.fr,tharshan0311@gmail.com,thangeshwaran1968@gmail.com,emmanuelsivade@gmail.com,new.email@example.com';
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
   Validation des champs
========================= */
$required = [
  'name','email','phone',
  'departure','arrival',
  'passengers','childSeats','luggage','vehicle','price'
];
foreach ($required as $f) {
  if (!isset($data[$f]) || ($data[$f] === '' && $data[$f] !== '0')) {
    json_err("Champ manquant ou vide : $f", 400);
  }
}
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
$flight      = htmlspecialchars(trim((string)($data['flightNumber'] ?? '')), ENT_QUOTES, 'UTF-8');
$comment     = htmlspecialchars(trim((string)($data['comment'] ?? '')), ENT_QUOTES, 'UTF-8');
$departure   = htmlspecialchars(trim((string)($data['departure'] ?? '')), ENT_QUOTES, 'UTF-8');
$arrival     = htmlspecialchars(trim((string)($data['arrival'] ?? '')), ENT_QUOTES, 'UTF-8');
$tripType    = htmlspecialchars(trim((string)($data['tripType'] ?? 'one-way')), ENT_QUOTES, 'UTF-8');
$pickupDate  = htmlspecialchars(trim((string)($data['pickupDate'] ?? ($data['departureDate'] ?? ''))), ENT_QUOTES, 'UTF-8');
$returnDate  = htmlspecialchars(trim((string)($data['returnDate'] ?? '')), ENT_QUOTES, 'UTF-8');
$passengers  = (int)($data['passengers'] ?? 1);
$childSeats  = (int)($data['childSeats'] ?? 0);
$luggage     = (int)($data['luggage'] ?? 0);
$vehicle     = htmlspecialchars(trim((string)($data['vehicle'] ?? '')), ENT_QUOTES, 'UTF-8');
$priceNum    = (float)($data['price'] ?? 0);
$price       = number_format($priceNum, 2, '.', '');

// Addresses (si Paris ou excursion)
$departureAddress = htmlspecialchars(trim((string)($data['departureAddress'] ?? '')), ENT_QUOTES, 'UTF-8');
$arrivalAddress = htmlspecialchars(trim((string)($data['arrivalAddress'] ?? '')), ENT_QUOTES, 'UTF-8');

$fromName     = clean_header_value($name);
$replyToEmail = clean_header_value($email);

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
];

$filePath = SAVE_DIR . "/{$bookingNumber}.json";
if (@file_put_contents($filePath, json_encode($toSave, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX) === false) {
  json_err("Impossible d'écrire le fichier de réservation", 500);
}

/* =========================
   Traductions e-mails
========================= */
$t = [
  'en' => [
    'subject' => "Thank you for your reservation request",
    'title' => "Thank you for your reservation request!",
    'intro' => "Your request has been successfully submitted. We will contact you shortly to confirm the booking.",
    'summary' => "Here are the details you provided:",
    'fields' => [
      'name'=>"Full Name",'email'=>"Email",'phone'=>"Phone",'flight'=>"Flight / Train Number",
      'from'=>"From",'to'=>"To",'type'=>"Trip Type",'date'=>"Pickup Date and Time",
      'passengers'=>"Passengers",'childSeats'=>"Child Seats",'luggage'=>"Luggage",
      'vehicle'=>"Vehicle",'price'=>"Estimated Price",
      'pickup_address' => "Pick-up Address",
      'dropoff_address' => "Drop-off Address"
    ],
    'note' => "Night surcharge: €10 applies between 10:00 PM and 5:00 AM.",
    'payment' => "Payment methods: Cash or credit card.",
    'contact' => "Contact"
  ],
  'fr' => [
    'subject' => "Merci pour votre demande de réservation",
    'title' => "Merci pour votre demande de réservation !",
    'intro' => "Votre demande a bien été enregistrée. Nous vous contacterons sous peu pour confirmer la réservation.",
    'summary' => "Voici les informations que vous avez fournies :",
    'fields' => [
      'name'=>"Nom complet",'email'=>"E-mail",'phone'=>"Téléphone",'flight'=>"Numéro de vol/train",
      'from'=>"Départ",'to'=>"Arrivée",'type'=>"Type de trajet",'date'=>"Date et heure de prise en charge",
      'passengers'=>"Passagers",'childSeats'=>"Sièges enfants",'luggage'=>"Valises",
      'vehicle'=>"Véhicule",'price'=>"Prix estimé",
      'pickup_address' => "Adresse de prise en charge",
      'dropoff_address' => "Adresse de dépôt"
    ],
    'note' => "Supplément de nuit : 10 € entre 22h00 et 05h00.",
    'payment' => "Moyens de paiement : Carte bancaire ou espèces.",
    'contact' => "Contact"
  ],
];
$tx = $t[$lang] ?? $t['fr'];

/* =========================
   Emails : construction
========================= */
$subjectAdmin = 'New Booking Request - ' . $fromName;

$headersAdmin  = "From: " . FROM_EMAIL . "\r\n";
$headersAdmin .= "Reply-To: {$fromName} <{$replyToEmail}>\r\n";
$headersAdmin .= "MIME-Version: 1.0\r\n";
$headersAdmin .= "Content-Type: text/html; charset=UTF-8\r\n";

$messageAdmin = '<html><head><meta charset="UTF-8"></head><body>'
  . '<h2>New Booking Request</h2>'
  . '<h3>Trip Details</h3><ul>'
  . '<li>Type: ' . htmlspecialchars($tripType) . '</li>'
  . '<li>Departure: ' . htmlspecialchars($departure) . '</li>'
  . ($departureAddress ? '<li>Pick-up Address: ' . htmlspecialchars($departureAddress) . '</li>' : '')
  . '<li>Arrival: ' . htmlspecialchars($arrival) . '</li>'
  . ($arrivalAddress ? '<li>Drop-off Address: ' . htmlspecialchars($arrivalAddress) . '</li>' : '')
  . '<li>Departure Date: ' . htmlspecialchars($pickupDate) . '</li>'
  . ($returnDate ? '<li>Return Date: ' . htmlspecialchars($returnDate) . '</li>' : '')
  . '<li>Passengers: ' . htmlspecialchars((string)$passengers) . '</li>'
  . '<li>Child Seats: ' . htmlspecialchars((string)$childSeats) . '</li>'
  . '<li>Luggage: ' . htmlspecialchars((string)$luggage) . '</li>'
  . '<li>Vehicle: ' . htmlspecialchars($vehicle) . '</li>'
  . '<li>Price: ' . htmlspecialchars($price) . ' €</li>'
  . '</ul>'
  . '<h3>Customer Details</h3><ul>'
  . '<li>Name: ' . htmlspecialchars($fromName) . '</li>'
  . '<li>Email: ' . htmlspecialchars($email) . '</li>'
  . '<li>Phone: ' . htmlspecialchars($phone) . '</li>'
  . ($flight ? '<li>Flight Number: ' . htmlspecialchars($flight) . '</li>' : '')
  . ($comment ? '<li>Comments: ' . nl2br(htmlspecialchars($comment)) . '</li>' : '')
  . '</ul>'
  . '<p>'
  . '<a href="'.htmlspecialchars($confirmLink).'" target="_blank">Administration / Confirmation Link</a><br>'
  . '<small style="color:#666">URL: '.htmlspecialchars($confirmLink).'</small>'
  . '</p>'
  . '</body></html>';

$confirmationSubject = $tx['subject'];
$confirmationHeaders  = "From: " . FROM_EMAIL . "\r\n";
$confirmationHeaders .= "Reply-To: " . ADMIN_EMAIL . "\r\n";
$confirmationHeaders .= "MIME-Version: 1.0\r\n";
$confirmationHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
$confirmationHeaders .= "Bcc: " . ADMIN_EMAIL . "\r\n";

$confirmationMessage = '
<html lang="'.$lang.'">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial, sans-serif; background:#f4f4f4; padding:30px; margin:0;">
  <div style="background:#ffffff; padding:30px 40px; border-radius:10px; max-width:600px; margin:auto; box-shadow:0 0 20px rgba(0,0,0,0.08);">
    <div style="display:flex; align-items:center; margin-bottom:20px;">
      <img src="https://parisairportdisneyprestigetransfer.fr/booking-taxi/images/logo.png" alt="Logo" style="max-height:60px; margin-right:20px;">
      <h1 style="color:#2ecc71; font-size:20px; margin:0;">'.htmlspecialchars($tx['title']).'</h1>
    </div>
    <p>'.htmlspecialchars($tx['intro']).'</p>
    <div style="margin-top:20px;">
      <h3>'.htmlspecialchars($tx['summary']).'</h3>
      <p><strong>'.$tx['fields']['name'].'</strong>: '.htmlspecialchars($fromName).'</p>
      <p><strong>'.$tx['fields']['email'].'</strong>: '.htmlspecialchars($email).'</p>
      <p><strong>'.$tx['fields']['phone'].'</strong>: '.htmlspecialchars($phone).'</p>'
      .($flight ? '<p><strong>'.$tx['fields']['flight'].'</strong>: '.htmlspecialchars($flight).'</p>' : '').'
      <p><strong>'.$tx['fields']['from'].'</strong>: '.ucfirst(htmlspecialchars($departure)).'</p>'
      .($departureAddress ? '<p><strong>'.$tx['fields']['pickup_address'].'</strong>: '.htmlspecialchars($departureAddress).'</p>' : '').'
      <p><strong>'.$tx['fields']['to'].'</strong>: '.ucfirst(htmlspecialchars($arrival)).'</p>'
      .($arrivalAddress ? '<p><strong>'.$tx['fields']['dropoff_address'].'</strong>: '.htmlspecialchars($arrivalAddress).'</p>' : '').'
      <p><strong>'.$tx['fields']['type'].'</strong>: '.ucfirst(htmlspecialchars($tripType)).'</p>
      <p><strong>'.$tx['fields']['date'].'</strong>: '.htmlspecialchars($pickupDate).'</p>
      <p><strong>'.$tx['fields']['passengers'].'</strong>: '.htmlspecialchars((string)$passengers).'</p>
      <p><strong>'.$tx['fields']['childSeats'].'</strong>: '.htmlspecialchars((string)$childSeats).'</p>
      <p><strong>'.$tx['fields']['luggage'].'</strong>: '.htmlspecialchars((string)$luggage).'</p>
      <p><strong>'.$tx['fields']['vehicle'].'</strong>: '.ucfirst(htmlspecialchars($vehicle)).'</p>
      <p><strong>'.$tx['fields']['price'].'</strong>: €'.htmlspecialchars($price).'</p>
    </div>
    <div style="margin-top:15px; color:#666;">
      <p>💬 '.htmlspecialchars($tx['note']).'</p>
      <p>💳 '.htmlspecialchars($tx['payment']).'</p>
      <p>📞 '.htmlspecialchars($tx['contact']).' : +33 7 51 37 61 84 — info@parisairportdisneyprestigetransfer.com</p>
    </div>
  </div>
</body>
</html>';

/* =========================
   Envoi
========================= */
$okAdmin  = @mail(ADMIN_EMAIL, clean_header_value($subjectAdmin), $messageAdmin, $headersAdmin);
$okClient = $email ? @mail($email, clean_header_value($confirmationSubject), $confirmationMessage, $confirmationHeaders) : true;

if ($okAdmin && $okClient) {
  json_ok(['id' => $bookingNumber]);
} else {
  error_log('MAIL ERROR: admin=' . ($okAdmin?'1':'0') . ' client=' . ($okClient?'1':'0'));
  json_err("Erreur lors de l'envoi des e-mails.", 500);
}
