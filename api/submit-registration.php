<?php
/**
 * FECASAM 2026 - Registration Form Handler
 * This file handles form submissions and stores data
 */

// Security headers
header('Content-Type: application/json');
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
    echo json_encode(['error' => 'Method not allowed']);
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

// Configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'fecasam2026');
define('DB_USER', getenv('DB_USER') ?: 'your_db_user');
define('DB_PASS', getenv('DB_PASS') ?: 'your_db_password');
define('DB_PORT', getenv('DB_PORT') ?: 3306);
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'inscripciones@fecasam2026.com');

// Function to sanitize input
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
    return $data;
}

// Function to validate email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

// Function to validate DNI (8 digits)
function validateDNI($dni) {
    return preg_match('/^\d{8}$/', $dni);
}

// Function to validate RUC (11 digits)
function validateRUC($ruc) {
    return preg_match('/^\d{11}$/', $ruc);
}

// Function to generate registration code
function generateRegistrationCode() {
    $year = date('Y');
    $random = str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
    return "FECA-{$year}-{$random}";
}

try {
    // Get POST data
    $fullName = sanitizeInput($_POST['fullName'] ?? '');
    $documentType = sanitizeInput($_POST['documentType'] ?? '');
    $documentNumber = sanitizeInput($_POST['documentNumber'] ?? '');
    $email = sanitizeInput($_POST['email'] ?? '');
    $phone = sanitizeInput($_POST['phone'] ?? '');
    $origin = sanitizeInput($_POST['origin'] ?? '');
    $category = sanitizeInput($_POST['category'] ?? '');
    $comments = sanitizeInput($_POST['comments'] ?? '');
    
    // Validation
    $errors = [];
    
    if (strlen($fullName) < 3) {
        $errors[] = 'El nombre completo debe tener al menos 3 caracteres';
    }
    
    if (!in_array($documentType, ['dni', 'ruc', 'ce', 'passport'])) {
        $errors[] = 'Tipo de documento inválido';
    }
    
    if ($documentType === 'dni' && !validateDNI($documentNumber)) {
        $errors[] = 'DNI inválido (debe tener 8 dígitos)';
    }
    
    if ($documentType === 'ruc' && !validateRUC($documentNumber)) {
        $errors[] = 'RUC inválido (debe tener 11 dígitos)';
    }
    
    if (!validateEmail($email)) {
        $errors[] = 'Correo electrónico inválido';
    }
    
    if (strlen($phone) < 9) {
        $errors[] = 'Teléfono inválido';
    }
    
    if (empty($origin)) {
        $errors[] = 'Debe indicar su procedencia';
    }
    
    if (empty($category)) {
        $errors[] = 'Debe seleccionar una categoría';
    }
    
    // If there are errors, return them
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errors' => $errors
        ]);
        exit;
    }
    
    // Generate registration code
    $registrationCode = generateRegistrationCode();
    
    // Connect to database
    $conn = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    // Insert registration
    $stmt = $conn->prepare("
        INSERT INTO registrations (
            registration_code,
            full_name,
            document_type,
            document_number,
            email,
            phone,
            origin,
            category,
            comments,
            created_at
        ) VALUES (
            :code,
            :name,
            :doc_type,
            :doc_number,
            :email,
            :phone,
            :origin,
            :category,
            :comments,
            NOW()
        )
    ");
    
    $stmt->execute([
        ':code' => $registrationCode,
        ':name' => $fullName,
        ':doc_type' => $documentType,
        ':doc_number' => $documentNumber,
        ':email' => $email,
        ':phone' => $phone,
        ':origin' => $origin,
        ':category' => $category,
        ':comments' => $comments
    ]);
    
    // Send confirmation email
    $to = $email;
    $subject = "Confirmación de Inscripción - FECASAM 2026";
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #8B5E3C 0%, #D4A574 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f5f5f5; }
            .code { background: white; padding: 15px; border-left: 4px solid #8B5E3C; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>FECASAM 2026</h1>
                <p>Capital Alpaquera del Mundo</p>
            </div>
            <div class='content'>
                <h2>¡Inscripción Confirmada!</h2>
                <p>Estimado/a <strong>{$fullName}</strong>,</p>
                <p>Su inscripción a FECASAM 2026 ha sido registrada exitosamente.</p>
                
                <div class='code'>
                    <strong>Código de Registro:</strong> {$registrationCode}
                </div>
                
                <p><strong>Detalles de su inscripción:</strong></p>
                <ul>
                    <li>Categoría: {$category}</li>
                    <li>Procedencia: {$origin}</li>
                    <li>Correo: {$email}</li>
                </ul>
                
                <p>Guarde este código para futuras consultas.</p>
                <p>Nos vemos del 22 al 30 de agosto de 2026 en Macusani, Puno.</p>
            </div>
            <div class='footer'>
                <p>FECASAM 2026 - Campo Ferial Julio E. Barreda - Macusani, Carabaya, Puno</p>
                <p>info@fecasam2026.com | +51 987 654 321</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: FECASAM 2026 <" . ADMIN_EMAIL . ">\r\n";
    
    mail($to, $subject, $message, $headers);
    
    // Send notification to admin
    $adminMessage = "Nueva inscripción recibida:\n\n";
    $adminMessage .= "Código: {$registrationCode}\n";
    $adminMessage .= "Nombre: {$fullName}\n";
    $adminMessage .= "Email: {$email}\n";
    $adminMessage .= "Categoría: {$category}\n";
    $adminMessage .= "Procedencia: {$origin}\n";
    
    mail(ADMIN_EMAIL, "Nueva Inscripción - FECASAM 2026", $adminMessage);
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Inscripción registrada exitosamente',
        'data' => [
            'code' => $registrationCode,
            'email' => $email
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error en la base de datos'
    ]);
    error_log('Database error: ' . $e->getMessage());
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error interno del servidor'
    ]);
    error_log('Error: ' . $e->getMessage());
}
?>
