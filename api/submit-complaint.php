<?php
/**
 * FECASAM 2026 - Libro de Reclamaciones Virtual Handler
 * Conforme a normativa INDECOPI
 */

// Security headers
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Enable CORS if needed (adjust domain in production)
// header('Access-Control-Allow-Origin: https://yourdomain.com');
// header('Access-Control-Allow-Methods: POST');
// header('Access-Control-Allow-Headers: Content-Type');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Load environment variables from .env if available
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strncmp($line, '#', 1) === 0) {
            continue;
        }

        if (strpos($line, '=') === false) {
            continue;
        }

        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);

        if ($key === '' || getenv($key) !== false) {
            continue;
        }

        if (strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) {
            $value = stripslashes(substr($value, 1, -1));
        }

        putenv("{$key}={$value}");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

loadEnv(__DIR__ . '/../.env');

// Configuration - CHANGE THESE IN PRODUCTION
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'fecasam2026');
define('DB_USER', getenv('DB_USER') ?: 'your_db_user');
define('DB_PASS', getenv('DB_PASS') ?: 'your_db_password');
define('DB_PORT', getenv('DB_PORT') ?: 3306);
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'reclamaciones@fecasam2026.com');

// Development mode - Set to false in production
define('DEV_MODE', DB_USER === 'your_db_user' || DB_PASS === 'your_db_password');

// Function to sanitize input
function sanitizeInput($data) {
    if (is_null($data)) return '';
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Function to validate email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to generate complaint code
function generateComplaintCode() {
    $year = date('Y');
    $random = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    return "R-{$year}-{$random}";
}

// Function to send email notification
function sendComplaintNotification($complaintData) {
    $to = ADMIN_EMAIL;
    $subject = "Nueva Reclamación - FECASAM 2026 - " . $complaintData['code'];
    
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #8B5E3C; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .section { margin-bottom: 20px; }
            .label { font-weight: bold; color: #8B5E3C; }
            .value { margin-left: 10px; }
            .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h2>Nueva Reclamación Recibida</h2>
        </div>
        <div class='content'>
            <div class='section'>
                <p><span class='label'>Código:</span> <span class='value'>{$complaintData['code']}</span></p>
                <p><span class='label'>Fecha:</span> <span class='value'>" . date('d/m/Y H:i:s') . "</span></p>
            </div>
            
            <div class='section'>
                <h3>Datos del Consumidor</h3>
                <p><span class='label'>Nombre:</span> <span class='value'>{$complaintData['consumer_name']}</span></p>
                <p><span class='label'>Documento:</span> <span class='value'>{$complaintData['consumer_document']}</span></p>
                <p><span class='label'>Email:</span> <span class='value'>{$complaintData['consumer_email']}</span></p>
                <p><span class='label'>Teléfono:</span> <span class='value'>{$complaintData['consumer_phone']}</span></p>
                <p><span class='label'>Dirección:</span> <span class='value'>{$complaintData['consumer_address']}</span></p>
            </div>
            
            <div class='section'>
                <h3>Información del Producto/Servicio</h3>
                <p><span class='label'>Tipo:</span> <span class='value'>" . ucfirst($complaintData['product_type']) . "</span></p>
                <p><span class='label'>Descripción:</span> <span class='value'>{$complaintData['product_description']}</span></p>
                <p><span class='label'>Monto:</span> <span class='value'>S/ {$complaintData['amount']}</span></p>
            </div>
            
            <div class='section'>
                <h3>Detalle de la Reclamación</h3>
                <p><span class='label'>Tipo de Reclamo:</span> <span class='value'>" . ucfirst($complaintData['claim_type']) . "</span></p>
                <p><span class='label'>Detalle:</span><br><span class='value'>{$complaintData['claim_detail']}</span></p>
                <p><span class='label'>Pedido del Consumidor:</span><br><span class='value'>{$complaintData['consumer_request']}</span></p>
            </div>
        </div>
        <div class='footer'>
            <p>Este es un mensaje automático. Por favor, procesar según normativa INDECOPI.</p>
            <p>FECASAM 2026 - Libro de Reclamaciones Virtual</p>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: noreply@fecasam2026.com" . "\r\n";
    
    return mail($to, $subject, $message, $headers);
}

// Function to send confirmation email to consumer
function sendConsumerConfirmation($consumerEmail, $complaintCode, $consumerName) {
    $subject = "Confirmación de Reclamación - FECASAM 2026";
    
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: #8B5E3C; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .code { background: #f0f0f0; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #8B5E3C; margin: 20px 0; }
            .footer { background: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='header'>
            <h2>Reclamación Registrada Exitosamente</h2>
        </div>
        <div class='content'>
            <p>Estimado/a {$consumerName},</p>
            
            <p>Su reclamación ha sido registrada correctamente en nuestro Libro de Reclamaciones Virtual.</p>
            
            <div class='code'>
                CÓDIGO: {$complaintCode}
            </div>
            
            <p><strong>¿Qué sigue ahora?</strong></p>
            <ul>
                <li>Hemos recibido su reclamación y será procesada según la normativa INDECOPI.</li>
                <li>Nos pondremos en contacto con usted en un plazo máximo de 15 días hábiles.</li>
                <li>Guarde este código para hacer seguimiento a su caso.</li>
            </ul>
            
            <p><strong>Importante:</strong> Su reclamación ha sido registrada conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N° 29571) y el Decreto Supremo N° 011-2011-PCM.</p>
            
            <p>Gracias por su confianza.</p>
            
            <p><strong>Atentamente,</strong><br>
            Equipo FECASAM 2026</p>
        </div>
        <div class='footer'>
            <p>Este es un mensaje automático. Por favor, no responda a este correo.</p>
            <p>Para consultas: reclamaciones@fecasam2026.com</p>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= "From: noreply@fecasam2026.com" . "\r\n";
    
    return mail($consumerEmail, $subject, $message, $headers);
}

try {
    // Get POST data
    $consumerName = sanitizeInput($_POST['consumerName'] ?? '');
    $consumerDocument = sanitizeInput($_POST['consumerDocument'] ?? '');
    $consumerEmail = sanitizeInput($_POST['consumerEmail'] ?? '');
    $consumerPhone = sanitizeInput($_POST['consumerPhone'] ?? '');
    $consumerAddress = sanitizeInput($_POST['consumerAddress'] ?? '');
    
    $productType = sanitizeInput($_POST['productType'] ?? '');
    $productDescription = sanitizeInput($_POST['productDescription'] ?? '');
    $amount = sanitizeInput($_POST['amount'] ?? '0');
    
    $claimType = sanitizeInput($_POST['claimType'] ?? '');
    $claimDetail = sanitizeInput($_POST['claimDetail'] ?? '');
    $consumerRequest = sanitizeInput($_POST['consumerRequest'] ?? '');
    
    // Validation
    $errors = [];
    
    // Consumer validation
    if (strlen($consumerName) < 3) {
        $errors[] = 'El nombre debe tener al menos 3 caracteres';
    }
    
    if (strlen($consumerDocument) < 8) {
        $errors[] = 'Documento inválido';
    }
    
    if (!validateEmail($consumerEmail)) {
        $errors[] = 'Correo electrónico inválido';
    }
    
    if (strlen($consumerPhone) < 9) {
        $errors[] = 'Teléfono inválido';
    }
    
    if (strlen($consumerAddress) < 10) {
        $errors[] = 'La dirección debe tener al menos 10 caracteres';
    }
    
    // Product validation
    if (!in_array($productType, ['producto', 'servicio'])) {
        $errors[] = 'Tipo de producto/servicio inválido';
    }
    
    if (strlen($productDescription) < 10) {
        $errors[] = 'La descripción del producto/servicio debe tener al menos 10 caracteres';
    }
    
    if (!is_numeric($amount) || floatval($amount) < 0) {
        $errors[] = 'Monto inválido';
    }
    
    // Claim validation
    if (!in_array($claimType, ['reclamo', 'queja'])) {
        $errors[] = 'Tipo de reclamo inválido';
    }
    
    if (strlen($claimDetail) < 20) {
        $errors[] = 'El detalle del reclamo debe tener al menos 20 caracteres';
    }
    
    if (strlen($consumerRequest) < 10) {
        $errors[] = 'El pedido debe tener al menos 10 caracteres';
    }
    
    // Return errors if any
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errors' => $errors
        ]);
        exit;
    }
    
    // Generate complaint code
    $complaintCode = generateComplaintCode();
    
    // In development mode, skip database and return success immediately
    if (DEV_MODE) {
        // Log to file instead of database in development mode
        $logFile = __DIR__ . '/../dev_complaints.log';
        $logEntry = date('Y-m-d H:i:s') . " | CODE: {$complaintCode} | NAME: {$consumerName} | EMAIL: {$consumerEmail}\n";
        file_put_contents($logFile, $logEntry, FILE_APPEND);
        
        // Success response for development
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Reclamación registrada exitosamente (MODO DESARROLLO)',
            'data' => [
                'code' => $complaintCode,
                'email' => $consumerEmail,
                'consumerName' => $consumerName
            ]
        ]);
        exit;
    }
    
    // Production mode - Connect to database
    $mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($mysqli->connect_error) {
        throw new Exception("Error de conexión: " . $mysqli->connect_error);
    }
    
    // Set charset to utf8mb4
    $mysqli->set_charset("utf8mb4");
    
    // Prepare statement
    $stmt = $mysqli->prepare("
        INSERT INTO complaints (
            complaint_code,
            consumer_name,
            consumer_document,
            consumer_email,
            consumer_phone,
            consumer_address,
            product_type,
            product_description,
            amount,
            claim_type,
            claim_detail,
            consumer_request,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    ");
    
    if (!$stmt) {
        throw new Exception("Error al preparar consulta: " . $mysqli->error);
    }
    
    // Bind parameters
    $stmt->bind_param(
        "ssssssssdsss",
        $complaintCode,
        $consumerName,
        $consumerDocument,
        $consumerEmail,
        $consumerPhone,
        $consumerAddress,
        $productType,
        $productDescription,
        $amount,
        $claimType,
        $claimDetail,
        $consumerRequest
    );
    
    // Execute
    if (!$stmt->execute()) {
        throw new Exception("Error al guardar reclamación: " . $stmt->error);
    }
    
    $stmt->close();
    $mysqli->close();
    
    // Prepare notification data
    $complaintData = [
        'code' => $complaintCode,
        'consumer_name' => $consumerName,
        'consumer_document' => $consumerDocument,
        'consumer_email' => $consumerEmail,
        'consumer_phone' => $consumerPhone,
        'consumer_address' => $consumerAddress,
        'product_type' => $productType,
        'product_description' => $productDescription,
        'amount' => number_format($amount, 2),
        'claim_type' => $claimType,
        'claim_detail' => $claimDetail,
        'consumer_request' => $consumerRequest
    ];
    
    // Send email notifications (non-blocking)
    try {
        sendComplaintNotification($complaintData);
        sendConsumerConfirmation($consumerEmail, $complaintCode, $consumerName);
    } catch (Exception $e) {
        // Log error but don't fail the request
        error_log("Error sending emails: " . $e->getMessage());
    }
    
    // Success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Reclamación registrada exitosamente',
        'data' => [
            'code' => $complaintCode,
            'email' => $consumerEmail,
            'consumerName' => $consumerName
        ]
    ]);
    
} catch (Exception $e) {
    // Log error
    error_log("Complaint submission error: " . $e->getMessage());
    
    // Error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error al procesar la reclamación. Por favor, inténtelo nuevamente.'
    ]);
}
?>
