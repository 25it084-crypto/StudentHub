<?php
// ==========================================================================
// PRACTICAL 8: MySQL Database Connection using PHP PDO
// File: db.php
// Project: StudentHub
// ==========================================================================

// Database configuration settings (Default for XAMPP / WAMP)
$host     = "localhost";
$dbname   = "studenthub_db";
$username = "root";
$password = ""; // Default XAMPP password is empty
$charset  = "utf8mb4";

// Data Source Name (DSN) string
$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";

// PDO driver options for security & error handling
$options = [
    // Throw exceptions when SQL errors occur so we can catch them cleanly
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    
    // Fetch query results as associative arrays by default (column_name => value)
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    
    // Disable emulated prepares to use native MySQL prepared statements (prevents SQL injection)
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // Create new PDO connection object
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // Connection successful
    // Note: In production / included files, we don't echo anything so it doesn't break headers.
} catch (PDOException $e) {
    // Catch database errors safely without exposing sensitive server paths
    die("Database Connection Failed: " . $e->getMessage());
}
?>
