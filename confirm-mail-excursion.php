<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

$id    = $_GET['id']    ?? null;
$email = $_GET['email'] ?? null; // restera fallback
$name  = $_GET['name']  ?? null;

if (!$id || !$email || !$name) {
    http_response_code(400);
    exit("❌ Missing parameters.");
}

// JSON
$file = __DIR__ . "/bookings/$id.json";
if (!file_exists($file)) {
    http_response_code(404);
    exit("❌ Booking not found.");
}

$data = json_decode(file_get_contents($file), true);

// ► Utiliser l'email du JSON si valide
if (!empty($data['email']) && filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    $email = $data['email'];
}

// Mapping des excursions
$excursionsMap = [
    "paris_4h" => "Paris 4h",
    "paris_night_4h" => "Paris by night 4h",
    "paris_6h" => "Paris 6h",
    "paris_8h" => "Paris 8h",
    "paris_10h" => "Paris 10h",
    "paris_versailles_rt" => "Paris + Versailles (aller/retour)",
    "paris_versailles_one" => "Paris + Versailles (aller simple)",
    "chateau_versailles_rt" => "Château de Versailles (aller/retour)",
    "chateau_versailles_one" => "Château de Versailles (aller simple)",
    "normandy_beach" => "Normandy Beach",
    "omaha_beach" => "Omaha Beach",
    "mont_saint_michel" => "Mont Saint Michel",
    "vallee_loire" => "Vallée de la Loire",
    "normandie" => "Normandie",
    "giverny" => "Giverny"
];

// Extraction des données
$fullName     = htmlspecialchars($data['name'] ?? $name, ENT_QUOTES, 'UTF-8');
$bookingNumber= $data['id'] ?? $id;
$phone        = htmlspecialchars($data['phone'] ?? "", ENT_QUOTES, 'UTF-8');
$phoneCode    = htmlspecialchars($data['phoneCode'] ?? '+33', ENT_QUOTES, 'UTF-8');
$fullPhone    = $phoneCode . ' ' . $phone;
$comment      = nl2br(htmlspecialchars($data['comment'] ?? "", ENT_QUOTES, 'UTF-8'));
$departure    = ucfirst($data['departure'] ?? '');
$departureAddress = htmlspecialchars($data['departureAddress'] ?? '', ENT_QUOTES, 'UTF-8');
$pickupDate   = htmlspecialchars($data['pickupDate'] ?? '', ENT_QUOTES, 'UTF-8');
$flightNumber = htmlspecialchars($data['flightNumber'] ?? "-", ENT_QUOTES, 'UTF-8');
$price        = number_format((float)($data['price'] ?? 0), 2, '.', '');

// Excursion spécifique
$selectedExcursion = $data['selectedExcursion'] ?? '';
$excursionName = $excursionsMap[$selectedExcursion] ?? $selectedExcursion;

// ► Parsing de date : fallback si format différent
$dateObj = DateTime::createFromFormat('d/m/Y H:i', $pickupDate);
if (!$dateObj && !empty($data['departureDateISO'])) {
    $dateObj = new DateTime($data['departureDateISO']);
}
$googleDate = $dateObj ? $dateObj->format("Ymd\THis") : '';

$googleCalendarLink = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    . "&text=" . rawurlencode("Excursion PADPT - $fullName")
    . "&dates={$googleDate}/{$googleDate}"
    . "&details=" . rawurlencode("Excursion: $excursionName\nClient: $fullName ($fullPhone)" . 
        ($departureAddress ? "\nPick-up: $departureAddress" : ''))
    . "&location=" . rawurlencode($departureAddress ?: $departure);

// Message HTML stylé pour excursion
$message = "
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <title>Excursion Booking Confirmation</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; padding: 40px; }
    .container { background: white; max-width: 650px; margin: auto; padding: 30px; border-radius: 12px; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
    .logo { text-align: center; margin-bottom: 20px; }
    .logo img { max-width: 100px; }
    h2 { text-align: center; color: #e67e22; }
    h3 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px; margin-top: 30px; }
    p { margin: 6px 0; }
    .btns { text-align: center; margin-top: 30px; }
    .btns a {
      display: inline-block;
      margin: 8px;
      padding: 10px 20px;
      border-radius: 6px;
      text-decoration: none;
      color: white;
      font-weight: bold;
    }
    .google-btn { background-color: #4285F4; }
    .call-btn { background-color: #27ae60; }
    .excursion-highlight {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
      text-align: center;
    }
    .excursion-highlight h4 {
      color: #e67e22;
      margin: 0 0 10px 0;
      font-size: 18px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 13px;
      color: #777;
    }
  </style>
</head>
<body>
  <div class='container'>
    <div class='logo'>
      <img src='parisairportdisneyprestigetransfer.fr/booking-taxi/images/logo.png' alt='PADPT Logo'>
    </div>

    <h2>Thank you $fullName, your excursion is confirmed ✅</h2>

    <div class='excursion-highlight'>
      <h4>🎯 Selected Excursion</h4>
      <p style='font-size: 16px; font-weight: bold; color: #e67e22;'>$excursionName</p>
    </div>

    <h3>🧍 Customer Information</h3>
    <p><strong>Name:</strong> $fullName</p>
    <p><strong>Email:</strong> $email</p>
    <p><strong>Phone:</strong> $fullPhone</p>
    <p><strong>Comments:</strong> $comment</p>

    <h3>🚐 Excursion Details</h3>
    <p><strong>Booking Number:</strong> $bookingNumber</p>
    <p><strong>Type:</strong> Excursion</p>" . 
    ($departureAddress ? "<p><strong>Pick-up Address:</strong> $departureAddress</p>" : '') . "
    <p><strong>Date & Time:</strong> $pickupDate</p>
    <p><strong>Flight / Train:</strong> $flightNumber</p>
    <p><strong>Price:</strong> $price €</p>

    <div class='btns'>
      <a href='$googleCalendarLink' class='google-btn' target='_blank'>📅 Add to Google Calendar</a>
      <a href='tel:+33751376184' class='call-btn'>📞 Call the driver</a>
    </div>

    <h3>ℹ️ Excursion Information</h3>
    <p><strong>Meeting Point:</strong> The driver will wait for you at the scheduled pickup location with a sign.</p>
    <p><strong>Duration:</strong> Please refer to your selected excursion package for duration details.</p>
    <p><strong>Payment:</strong> Cash or card (please notify if paying by card).</p>
    <p><strong>Note:</strong> +15€ night surcharge between 9:00 PM - 6:00 AM.</p>
    <p><strong>Excursion Guide:</strong> Professional guide included for sightseeing tours.</p>

    <div class='footer'>
      Paris Airport Disney Prestige Transfer<br>
      119 Avenue Carnot, 93140 Bondy<br>
      Tel : +33 7 51 37 61 84<br>
      www.parisairportdisneyprestigetransfer.fr
    </div>
  </div>
</body>
</html>
";

// En-têtes email
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-type: text/html; charset=UTF-8\r\n";
$headers .= "From: booking@parisairportdisneyprestigetransfer.fr\r\n";
$headers .= "Bcc: booking@parisairportdisneyprestigetransfer.fr,tharshan0311@gmail.com,thangeshwaran1968@gmail.com,emmanuelsivade@gmail.com\r\n";

if (mail($email, "✅ Excursion Confirmation #$bookingNumber - $excursionName", $message, $headers)) {
    echo "<h2 style='text-align:center; color:green; margin-top:100px;'>✅ Excursion confirmation sent to <br>" . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</h2>";
} else {
    echo "<h2 style='text-align:center; color:red; margin-top:100px;'>❌ Failed to send to " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</h2>";
}

?>