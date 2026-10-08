<?php
// ==========================================================================
// PRACTICAL 8: Database Connection Test & Prepared Statement Demo
// File: connection_test.php
// Purpose: Screen for viva demonstration and connection screenshot
// ==========================================================================

// Include the PDO database configuration
require_once 'db.php';

$connectionStatus = false;
$connectionError = "";
$workshopEvents = [];
$procedureResults = [];

try {
    // 1. Connection check
    if (isset($pdo)) {
        $connectionStatus = true;
    }

    // 2. Intermediate Extension: Demonstrate Prepared Statement with parameter binding
    // Fetch events where category is Workshop
    $stmt1 = $pdo->prepare("SELECT event_id, title, category, event_date, venue, total_seats FROM events WHERE category = :cat ORDER BY event_date ASC");
    $stmt1->execute([':cat' => 'Workshop']);
    $workshopEvents = $stmt1->fetchAll();

    // 3. Advanced Extension: Demonstrate Calling the Stored Procedure
    // Fetch registered events for student with ID = 1 (Rahul Sharma)
    $stmt2 = $pdo->prepare("CALL GetStudentRegistrations(:student_id)");
    $stmt2->execute([':student_id' => 1]);
    $procedureResults = $stmt2->fetchAll();

} catch (PDOException $e) {
    $connectionError = $e->getMessage();
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StudentHub - Practical 8 DB Test</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        .test-wrapper {
            max-width: 950px;
            margin: 20px auto;
            padding: 20px;
        }
        .status-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
            margin-bottom: 25px;
        }
        .badge-success {
            background: #d1e7dd;
            color: #0f5132;
            padding: 6px 14px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
        }
        .badge-fail {
            background: #f8d7da;
            color: #842029;
            padding: 6px 14px;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
        }
        .code-box {
            background: #212529;
            color: #f8f9fa;
            padding: 12px 16px;
            border-radius: 6px;
            font-family: Consolas, monospace;
            font-size: 0.9rem;
            margin: 10px 0 15px 0;
            overflow-x: auto;
        }
        .demo-section {
            background: white;
            padding: 22px;
            border-radius: 8px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
            margin-bottom: 25px;
        }
        .demo-section h3 {
            color: #0d6efd;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <header>
        <h1>StudentHub Portal</h1>
        <p>Practical 8: MySQL Schema, PDO Connection & Prepared Statements</p>
    </header>

    <!-- Top Bar Controls -->
    <div class="top-controls">
        <button id="theameBtn">🌙 Dark Mode</button>
    </div>

    <!-- Mobile Hamburger Menu Button -->
    <button id="hamburgerBtn" class="hamburger-btn">☰ Menu</button>

    <!-- Navigation Menu -->
    <nav id="navMenu">
        <a href="../pages/index.html">Home</a>
        <a href="../pages/evants.html">Events</a>
        <a href="../pages/about.html">About</a>
        <a href="contact.php">Contact</a>
        <a href="../pages/faq.html">FAQ</a>
        <a href="../pages/login.html">Login</a>
        <a href="../pages/register.html">Register</a>
    </nav>

    <main class="test-wrapper">

        <!-- 1. Connection Status Card -->
        <section class="status-card">
            <h2>🔌 Database Connection Status</h2>
            <br>
            <?php if ($connectionStatus): ?>
                <span class="badge-success">✅ Connected to MySQL (Database: studenthub_db via PDO)</span>
                <p style="margin-top: 10px; color: #555;">
                    Driver: <strong>MySQL</strong> | Host: <strong>localhost</strong> | Charset: <strong>utf8mb4</strong> | Error Mode: <strong>ERRMODE_EXCEPTION</strong>
                </p>
            <?php else: ?>
                <span class="badge-fail">❌ Connection Failed</span>
                <p style="margin-top: 10px; color: #dc3545;"><strong>Error:</strong> <?php echo htmlspecialchars($connectionError); ?></p>
                <div class="info-banner" style="margin-top: 15px;">
                    Make sure MySQL is running in XAMPP and you have imported <code>StudentHUb/data/studenthub_db.sql</code> into phpMyAdmin.
                </div>
            <?php endif; ?>
        </section>

        <!-- 2. Intermediate Extension: Prepared Statement Demonstration -->
        <section class="demo-section">
            <h3>⚡ 1. Prepared Statement Query (Intermediate Extension)</h3>
            <p>Querying the <code>events</code> table using safe parameterized prepared statement:</p>
            
            <div class="code-box">
$stmt = $pdo->prepare("SELECT * FROM events WHERE category = :cat");<br>
$stmt->execute([':cat' => 'Workshop']);
            </div>

            <div class="table-responsive">
                <table class="records-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Event Title</th>
                            <th>Category</th>
                            <th>Event Date</th>
                            <th>Venue</th>
                            <th>Total Seats</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!empty($workshopEvents)): ?>
                            <?php foreach ($workshopEvents as $event): ?>
                                <tr>
                                    <td><?php echo htmlspecialchars($event['event_id']); ?></td>
                                    <td><strong><?php echo htmlspecialchars($event['title']); ?></strong></td>
                                    <td><span class="table-tag"><?php echo htmlspecialchars($event['category']); ?></span></td>
                                    <td><?php echo htmlspecialchars($event['event_date']); ?></td>
                                    <td><?php echo htmlspecialchars($event['venue']); ?></td>
                                    <td><?php echo htmlspecialchars($event['total_seats']); ?></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="6" style="text-align:center;">No workshop events found. (Import studenthub_db.sql in phpMyAdmin)</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- 3. Advanced Extension: Stored Procedure Call -->
        <section class="demo-section">
            <h3>⚙️ 2. Stored Procedure Result (Advanced Extension)</h3>
            <p>Calling the stored procedure <code>GetStudentRegistrations(student_id = 1)</code>:</p>

            <div class="code-box">
$stmt = $pdo->prepare("CALL GetStudentRegistrations(:student_id)");<br>
$stmt->execute([':student_id' => 1]);
            </div>

            <div class="table-responsive">
                <table class="records-table">
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Email</th>
                            <th>Registered Event</th>
                            <th>Category</th>
                            <th>Event Date</th>
                            <th>Venue</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if (!empty($procedureResults)): ?>
                            <?php foreach ($procedureResults as $row): ?>
                                <tr>
                                    <td><strong><?php echo htmlspecialchars($row['student_name']); ?></strong></td>
                                    <td><?php echo htmlspecialchars($row['email']); ?></td>
                                    <td><?php echo htmlspecialchars($row['event_title']); ?></td>
                                    <td><span class="table-tag"><?php echo htmlspecialchars($row['category']); ?></span></td>
                                    <td><?php echo htmlspecialchars($row['event_date']); ?></td>
                                    <td><?php echo htmlspecialchars($row['venue']); ?></td>
                                    <td><span class="badge-success"><?php echo htmlspecialchars($row['status']); ?></span></td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="7" style="text-align:center;">No registrations found or procedure not yet created.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>

    </main>

    <!-- Footer -->
    <footer>
        <p>&copy; 2026 StudentHub. All Rights are Reserved.</p>
    </footer>

    <!-- Scripts -->
    <script src="../js/script.js"></script>
</body>
</html>
