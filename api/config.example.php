<?php
/**
 * FECASAM 2026 - Configuration File
 * 
 * IMPORTANTE: 
 * 1. Renombrar este archivo a config.php
 * 2. Completar con credenciales reales
 * 3. NO subir al repositorio Git (.gitignore)
 * 4. Ubicar fuera del web root si es posible
 */

// Prevent direct access
if (!defined('FECASAM_CONFIG')) {
    die('Direct access not permitted');
}

return [
    // Database Configuration
    'database' => [
        'host'     => getenv('DB_HOST') ?: 'localhost',
        'name'     => getenv('DB_NAME') ?: 'fecasam2026',
        'user'     => getenv('DB_USER') ?: 'your_db_user',
        'password' => getenv('DB_PASS') ?: 'your_secure_password',
        'charset'  => 'utf8mb4',
        'port'     => getenv('DB_PORT') ?: 3306
    ],
    
    // Email Configuration
    'email' => [
        'admin' => getenv('ADMIN_EMAIL') ?: 'admin@fecasam2026.com',
        'registrations' => 'inscripciones@fecasam2026.com',
        'complaints' => 'reclamaciones@fecasam2026.com',
        'noreply' => 'noreply@fecasam2026.com',
        
        // SMTP Settings (opcional - para envío más confiable)
        'smtp' => [
            'enabled' => false,
            'host' => 'smtp.hostinger.com',
            'port' => 587,
            'username' => '',
            'password' => '',
            'encryption' => 'tls'
        ]
    ],
    
    // Application Settings
    'app' => [
        'name' => 'FECASAM 2026',
        'url' => getenv('APP_URL') ?: 'https://fecasam2026.com',
        'environment' => getenv('APP_ENV') ?: 'production', // production, staging, development
        'debug' => getenv('APP_DEBUG') === 'true' ? true : false,
        'timezone' => 'America/Lima',
        'locale' => 'es_PE',
    ],
    
    // Security Settings
    'security' => [
        'csrf_enabled' => true,
        'csrf_token_name' => '_csrf_token',
        'session_name' => 'FECASAM_SESSION',
        'session_lifetime' => 7200, // 2 hours in seconds
        
        // Rate Limiting (requests per minute)
        'rate_limit' => [
            'enabled' => true,
            'max_attempts' => 10,
            'decay_minutes' => 1
        ],
        
        // Password requirements
        'password' => [
            'min_length' => 8,
            'require_uppercase' => true,
            'require_numbers' => true,
            'require_special' => true
        ]
    ],
    
    // File Upload Settings
    'uploads' => [
        'max_file_size' => 5 * 1024 * 1024, // 5MB in bytes
        'allowed_types' => ['jpg', 'jpeg', 'png', 'pdf'],
        'upload_path' => __DIR__ . '/uploads/',
    ],
    
    // Registration Settings
    'registration' => [
        'enabled' => true,
        'require_email_confirmation' => true,
        'auto_confirm' => false,
        'send_admin_notification' => true,
        'code_prefix' => 'FECA',
    ],
    
    // Complaints (Libro de Reclamaciones)
    'complaints' => [
        'enabled' => true,
        'code_prefix' => 'R',
        'response_deadline_days' => 15,
        'send_consumer_confirmation' => true,
        'send_admin_notification' => true,
    ],
    
    // API Settings
    'api' => [
        'enabled' => true,
        'version' => 'v1',
        'rate_limit' => 60, // requests per minute
    ],
    
    // Logging
    'logging' => [
        'enabled' => true,
        'level' => 'error', // debug, info, warning, error
        'path' => __DIR__ . '/logs/',
        'max_files' => 30, // Keep last 30 days
    ],
    
    // Cache
    'cache' => [
        'enabled' => false,
        'driver' => 'file', // file, redis, memcached
        'ttl' => 3600, // Time to live in seconds
    ],
    
    // Social Media Links
    'social' => [
        'facebook' => 'https://facebook.com/fecasam',
        'instagram' => 'https://instagram.com/fecasam',
        'twitter' => 'https://twitter.com/fecasam',
        'youtube' => 'https://youtube.com/fecasam',
        'whatsapp' => '+51987654321',
    ],
    
    // Analytics
    'analytics' => [
        'google_analytics_id' => '', // G-XXXXXXXXXX
        'facebook_pixel_id' => '',
        'google_tag_manager_id' => '',
    ],
    
    // Event Information
    'event' => [
        'name' => 'FECASAM 2026',
        'edition' => 'XXXI',
        'start_date' => '2026-08-22',
        'end_date' => '2026-08-30',
        'location' => 'Campo Ferial Julio E. Barreda - Macusani, Carabaya, Puno',
        'coordinates' => [
            'lat' => -14.0667,
            'lng' => -70.4167
        ]
    ],
];
