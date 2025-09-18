<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);

    // Check required fields
    if (!isset($data['id']) || !isset($data['email']) || !isset($data['name'])) {
        throw new Exception('Missing required fields');
    }

    // Admin email content
    $messageAdmin = '<html><head><meta charset="UTF-8"></head><body>';
    $messageAdmin .= '<h2>New Booking Request</h2>';
    $messageAdmin .= '<h3>Trip</h3><ul>';
    $messageAdmin .= '<li>Type: ' . htmlspecialchars($data['tripType']) . '</li>';
    $messageAdmin .= '<li>Pick-up: ' . htmlspecialchars($data['departure']) . '</li>';
    if ($data['departure'] === 'paris') {
        $messageAdmin .= '<li>📍 Pick-up Address: ' . htmlspecialchars($data['departureAddress']) . '</li>';
    }
    $messageAdmin .= '<li>Drop-off: ' . htmlspecialchars($data['arrival']) . '</li>';
    if ($data['arrival'] === 'paris') {
        $messageAdmin .= '<li>📍 Drop-off Address: ' . htmlspecialchars($data['arrivalAddress']) . '</li>';
    }
    $messageAdmin .= '<li>Date: ' . htmlspecialchars($data['departureDate']) . '</li>';
    if ($data['tripType'] === 'round-trip') {
        $messageAdmin .= '<li>Return Date: ' . htmlspecialchars($data['returnDate']) . '</li>';
    }
    $messageAdmin .= '</ul>';

    $messageAdmin .= '<h3>Customer</h3><ul>';
    $messageAdmin .= '<li>Name: ' . htmlspecialchars($data['name']) . '</li>';
    $messageAdmin .= '<li>Email: ' . htmlspecialchars($data['email']) . '</li>';
    $messageAdmin .= '<li>Phone: ' . htmlspecialchars($data['phoneCode']) . ' ' . htmlspecialchars($data['phone']) . '</li>';
    if ($data['flightNumber']) {
        $messageAdmin .= '<li>Flight: ' . htmlspecialchars($data['flightNumber']) . '</li>';
    }
    if ($data['comment']) {
        $messageAdmin .= '<li>Comment: ' . nl2br(htmlspecialchars($data['comment'])) . '</li>';
    }
    $messageAdmin .= '</ul>';

    $messageAdmin .= '<h3>Details</h3><ul>';
    $messageAdmin .= '<li>Passengers: ' . htmlspecialchars($data['passengers']) . '</li>';
    $messageAdmin .= '<li>Child seats: ' . htmlspecialchars($data['childSeats']) . '</li>';
    $messageAdmin .= '<li>Luggage: ' . htmlspecialchars($data['luggage']) . '</li>';
    $messageAdmin .= '<li>Vehicle: ' . htmlspecialchars($data['vehicle']) . '</li>';
    $messageAdmin .= '<li>Price: ' . htmlspecialchars($data['price']) . '€</li>';
    $messageAdmin .= '</ul>';

    $messageAdmin .= '<p><a href="' . htmlspecialchars($data['adminConfirmationLink']) . '">Click here to confirm booking</a></p>';
    $messageAdmin .= '</body></html>';

    // Client confirmation email
    $confirmationMessage = '<html><head><meta charset="UTF-8"></head><body>';
    $confirmationMessage .= '<h2>Booking Confirmation</h2>';
    $confirmationMessage .= '<p>Thank you for booking with us.</p>';
    $confirmationMessage .= '<p>Here are the details of your booking:</p>';
    $confirmationMessage .= '<ul>';
    $confirmationMessage .= '<li>Reference: ' . htmlspecialchars($data['id']) . '</li>';
    $confirmationMessage .= '<li>Name: ' . htmlspecialchars($data['name']) . '</li>';
    $confirmationMessage .= '<li>Email: ' . htmlspecialchars($data['email']) . '</li>';
    $confirmationMessage .= '<li>Phone: ' . htmlspecialchars($data['phoneCode']) . ' ' . htmlspecialchars($data['phone']) . '</li>';
    $confirmationMessage .= '<li>Trip type: ' . htmlspecialchars($data['tripType']) . '</li>';
    $confirmationMessage .= '<li>Pick-up: ' . htmlspecialchars($data['departure']) . '</li>';
    if ($data['departure'] === 'paris') {
        $confirmationMessage .= '<li>📍 Pick-up Address: ' . htmlspecialchars($data['departureAddress']) . '</li>';
    }
    $confirmationMessage .= '<li>Drop-off: ' . htmlspecialchars($data['arrival']) . '</li>';
    if ($data['arrival'] === 'paris') {
        $confirmationMessage .= '<li>📍 Drop-off Address: ' . htmlspecialchars($data['arrivalAddress']) . '</li>';
    }
    $confirmationMessage .= '<li>Date: ' . htmlspecialchars($data['departureDate']) . '</li>';
    if ($data['tripType'] === 'round-trip') {
        $confirmationMessage .= '<li>Return Date: ' . htmlspecialchars($data['returnDate']) . '</li>';
    }
    $confirmationMessage .= '<li>Estimated price: ' . htmlspecialchars($data['price']) . '€</li>';
    $confirmationMessage .= '</ul>';
    $confirmationMessage .= '<p>Our team will contact you shortly to confirm your booking.</p>';
    $confirmationMessage .= '<p>Thank you for your trust.</p>';
    $confirmationMessage .= '<p>The booking team</p>';
    $confirmationMessage .= '</body></html>';

    // Send admin email
    $to = "votre-email@domaine.com"; // Replace with your email
    $subject = "New Booking Request - Ref: " . $data['id'];
    $headers = "From: " . $data['email'] . "\r\n";
    $headers .= "Reply-To: " . $data['email'] . "\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

    if (!mail($to, $subject, $messageAdmin, $headers)) {
        throw new Exception('Failed to send admin email');
    }

    // Send client confirmation
    if (!mail($data['email'], "Booking Confirmation - Ref: " . $data['id'], $confirmationMessage, $headers)) {
        throw new Exception('Failed to send confirmation email');
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>