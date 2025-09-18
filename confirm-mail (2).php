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

// Extraction
$fullName     = htmlspecialchars($data['name'] ?? $name, ENT_QUOTES, 'UTF-8');
$bookingNumber= $data['id'] ?? $id;
$phone        = htmlspecialchars($data['phone'] ?? "", ENT_QUOTES, 'UTF-8');
$phoneCode    = htmlspecialchars($data['phoneCode'] ?? '+33', ENT_QUOTES, 'UTF-8');
$fullPhone    = $phoneCode . ' ' . $phone;
$comment      = nl2br(htmlspecialchars($data['comment'] ?? "", ENT_QUOTES, 'UTF-8'));
$departure    = ucfirst($data['departure'] ?? '');
$arrival      = ucfirst($data['arrival'] ?? '');
$departureAddress = htmlspecialchars($data['departureAddress'] ?? '', ENT_QUOTES, 'UTF-8');
$arrivalAddress   = htmlspecialchars($data['arrivalAddress'] ?? '', ENT_QUOTES, 'UTF-8');
$pickupDate   = htmlspecialchars($data['pickupDate'] ?? '', ENT_QUOTES, 'UTF-8');
$flightNumber = htmlspecialchars($data['flightNumber'] ?? "-", ENT_QUOTES, 'UTF-8');
$tripType     = !empty($data['tripType']) && $data['tripType'] === "round-trip" ? "Round Trip" : "One Way";
$price        = number_format((float)($data['price'] ?? 0), 2, '.', '');

// Hotel Disney info
$selectedHotel = $data['selectedHotel'] ?? null;
$hotelOther = htmlspecialchars($data['hotelOther'] ?? '', ENT_QUOTES, 'UTF-8');
$hotelInfo = '';
if ($selectedHotel && is_array($selectedHotel) && !empty($selectedHotel['label'])) {
  $hotelInfo = htmlspecialchars($selectedHotel['label'], ENT_QUOTES, 'UTF-8');
} elseif ($hotelOther) {
  $hotelInfo = $hotelOther;
}

// ► Parsing de date : fallback si format différent
$dateObj = DateTime::createFromFormat('d/m/Y H:i', $pickupDate);
if (!$dateObj && !empty($data['departureDateISO'])) {
    $dateObj = new DateTime($data['departureDateISO']);
}
$googleDate = $dateObj ? $dateObj->format("Ymd\THis") : '';

$googleCalendarLink = "https://calendar.google.com/calendar/render?action=TEMPLATE"
    . "&text=" . rawurlencode("Booking PADPT - $fullName")
    . "&dates={$googleDate}/{$googleDate}"
    . "&details=" . rawurlencode("From: $departure → To: $arrival\nClient: $fullName ($fullPhone)" . 
        ($departureAddress ? "\nPick-up: $departureAddress" : '') . 
        ($arrivalAddress ? "\nDrop-off: $arrivalAddress" : ''))
    . "&location=" . rawurlencode($departureAddress ?: $departure);



// Message HTML stylé
$message = "
<html lang='en'>
<head>
  <meta charset='UTF-8'>
  <title>Booking Confirmation</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f4f4; padding: 40px; }
    .container { background: white; max-width: 650px; margin: auto; padding: 30px; border-radius: 12px; box-shadow: 0 0 15px rgba(0,0,0,0.1); }
    .logo { text-align: center; margin-bottom: 20px; }
    .logo img { max-width: 100px; }
    h2 { text-align: center; color: #2ecc71; }
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

    <h2>Thank you $fullName, your booking is confirmed ✅</h2>

    <h3>🧍 Customer Information</h3>
    <p><strong>Name:</strong> $fullName</p>
    <p><strong>Email:</strong> $email</p>
    <p><strong>Phone:</strong> $fullPhone</p>
    <p><strong>Comments:</strong> $comment</p>

    <h3>🚖 Trip Details</h3>
    <p><strong>Booking Number:</strong> $bookingNumber</p>
    <p><strong>Type:</strong> $tripType</p>
    <p><strong>From:</strong> $departure</p>" . 
    ($departureAddress ? "<p><strong>Pick-up Address:</strong> $departureAddress</p>" : '') . "
    <p><strong>To:</strong> $arrival</p>" . 
    ($arrivalAddress ? "<p><strong>Drop-off Address:</strong> $arrivalAddress</p>" : '') . 
    ($hotelInfo ? "<p><strong>Hotel:</strong> $hotelInfo</p>" : '') . "
    <p><strong>Date & Time:</strong> $pickupDate</p>
    <p><strong>Flight / Train:</strong> $flightNumber</p>
    <p><strong>Price:</strong> $price €</p>

    <div class='btns'>
      <a href='$googleCalendarLink' class='google-btn' target='_blank'>📅 Add to Google Calendar</a>
      <a href='tel:+33751376184' class='call-btn'>📞 Call the driver</a>
    </div>

    <h3>ℹ️ Useful Information</h3>
    <p><strong>Airport:</strong> the driver will wait for you at the customs exit with a sign.</p>
    <p><strong>Other locations:</strong> the driver will wait for you at the address at the scheduled time.</p>
    <p><strong>Payment:</strong> cash or card (please notify if paying by card).</p>
    <p><strong>Note:</strong> +15€ night surcharge between 9:00 PM - 6:00 AM.</p>

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

if (mail($email, "✅ Booking Confirmation #$bookingNumber", $message, $headers)) {
    echo "<h2 style='text-align:center; color:green; margin-top:100px;'>✅ Confirmation sent to <br>" . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</h2>";
} else {
    echo "<h2 style='text-align:center; color:red; margin-top:100px;'>❌ Failed to send to " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</h2>";
}

?>
