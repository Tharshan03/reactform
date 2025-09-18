<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Récupérer les données POST
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Debug logging
    error_log('save-booking.php input: ' . $input);
    
    if (!$data) {
        throw new Exception('Invalid JSON data received');
    }
    
    if (!isset($data['filename']) || !isset($data['content'])) {
        throw new Exception('Missing filename or content. Received: ' . print_r(array_keys($data), true));
    }

    // Créer le dossier Bookings s'il n'existe pas
    $bookingsDir = __DIR__ . '/Bookings';
    if (!is_dir($bookingsDir)) {
        mkdir($bookingsDir, 0777, true);
    }

    // Construire le chemin complet du fichier
    $filePath = $bookingsDir . '/' . basename($data['filename']);

    // Sauvegarder le contenu en JSON
    if (file_put_contents($filePath, json_encode($data['content'], JSON_PRETTY_PRINT))) {
        echo json_encode(['status' => 'success']);
    } else {
        throw new Exception('Failed to save file');
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
