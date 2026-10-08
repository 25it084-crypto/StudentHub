<?php
// ==========================================================================
// PRACTICAL 9: Secure User Registration with MySQLi, Duplicate Check & Hashing
// File: register.php
// Project: StudentHub
// Author: 2nd Year Student (IT/CSE)
// ==========================================================================

session_start();

// Advanced Extension: CSRF Token Generation
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
}

// Database Connection using MySQLi
$host = "localhost";
$user = "root";
$pass = "";
$db   = "studenthub_db";

$conn = new mysqli($host, $user, $pass, $db);

// Check connection
if ($conn->connect_error) {
    die("Database Connection Failed: " . $conn->connect_error);
}

// Variables for form handling
$errors = [];
$successMessage = "";
$fullName = "";
$email = "";
$mobile = "";
$course = "";
$year = "";

// Process form when submitted via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 1. Advanced Extension: Verify CSRF Token
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        $errors[] = "Security check failed: Invalid CSRF token. Please refresh the page.";
    }

    // 2. Collect and Sanitize Inputs
    $fullName        = isset($_POST['fullName']) ? trim($_POST['fullName']) : '';
    $email           = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
    $mobile          = isset($_POST['mobile']) ? trim($_POST['mobile']) : '';
    $course          = isset($_POST['course']) ? trim($_POST['course']) : '';
    $year            = isset($_POST['year']) ? (int)$_POST['year'] : 0;
    $password        = isset($_POST['password']) ? $_POST['password'] : '';
    $confirmPassword = isset($_POST['confirmPassword']) ? $_POST['confirmPassword'] : '';

    // 3. Server-Side Validation (Consistent with frontend)
    if (empty($fullName)) {
        $errors[] = "Full Name is required.";
    } elseif (!preg_match("/^[a-zA-Z\s]{3,30}$/", $fullName)) {
        $errors[] = "Name must contain letters only (3-30 characters).";
    }

    if (empty($email)) {
        $errors[] = "Email is required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Please provide a valid email address.";
    }

    if (empty($mobile)) {
        $errors[] = "Mobile number is required.";
    } elseif (!preg_match("/^[6-9]\d{9}$/", $mobile)) {
        $errors[] = "Mobile must be 10 digits starting with 6, 7, 8, or 9.";
    }

    if (empty($course)) {
        $errors[] = "Please select your course.";
    }

    if ($year < 1 || $year > 4) {
        $errors[] = "Please select your year of study.";
    }

    if (empty($password)) {
        $errors[] = "Password is required.";
    } elseif (strlen($password) < 6) {
        $errors[] = "Password must be at least 6 characters long.";
    }

    if ($password !== $confirmPassword) {
        $errors[] = "Passwords do not match.";
    }

    // 4. Check for Duplicate Email using MySQLi Prepared Statement
    if (empty($errors)) {
        $checkStmt = $conn->prepare("SELECT student_id FROM students WHERE email = ?");
        $checkStmt->bind_param("s", $email);
        $checkStmt->execute();
        $checkStmt->store_result();

        if ($checkStmt->num_rows > 0) {
            $errors[] = "Duplicate Email: An account with '$email' already exists! Please use a different email.";
            
            // Log duplicate attempt to audit logs (Advanced Extension)
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $logStmt = $conn->prepare("INSERT INTO audit_logs (user_email, action, ip_address) VALUES (?, 'DUPLICATE_REGISTRATION_ATTEMPT', ?)");
            $logStmt->bind_param("ss", $email, $ip);
            $logStmt->execute();
            $logStmt->close();
        }
        $checkStmt->close();
    }

    // 5. Hash Password & Insert User (If no errors)
    if (empty($errors)) {
        // Secure password hashing with bcrypt
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

        // Intermediate Extension: Prepared Statement for Insert Operation
        $insertStmt = $conn->prepare("INSERT INTO students (full_name, email, mobile, course, year_of_study, password_hash) VALUES (?, ?, ?, ?, ?, ?)");
        $insertStmt->bind_param("ssssis", $fullName, $email, $mobile, $course, $year, $passwordHash);

        if ($insertStmt->execute()) {
            $successMessage = "Account created successfully for $fullName! Password securely hashed in database.";

            // Advanced Extension: Record Audit Log Entry
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $logStmt = $conn->prepare("INSERT INTO audit_logs (user_email, action, ip_address) VALUES (?, 'REGISTRATION_SUCCESS', ?)");
            $logStmt->bind_param("ss", $email, $ip);
            $logStmt->execute();
            $logStmt->close();

            // Clear inputs and regenerate CSRF token
            $fullName = $email = $mobile = $course = "";
            $year = 0;
            $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
        } else {
            $errors[] = "Database insert error: " . $insertStmt->error;
        }
        $insertStmt->close();
    }
}

// Fetch all registered students to show live table
$studentsResult = $conn->query("SELECT student_id, full_name, email, mobile, course, year_of_study, password_hash, created_at FROM students ORDER BY student_id DESC");

// Fetch recent audit logs (Advanced Extension)
$auditLogsResult = $conn->query("SELECT log_id, user_email, action, ip_address, log_time FROM audit_logs ORDER BY log_id DESC LIMIT 5");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StudentHub - Practical 9 Secure Registration</title>
    <link rel="stylesheet" href="../css/style.css">
    <style>
        .page-container {
            max-width: 950px;
            margin: 20px auto;
            padding: 20px;
        }
        .hash-preview {
            font-family: Consolas, monospace;
            background: #eee;
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 0.78rem;
            color: #d63384;
            word-break: break-all;
        }
    </style>
</head>
<body>

    <!-- Header -->
    <header>
        <h1>StudentHub Portal</h1>
        <p>Practical 9: Secure Registration (MySQLi, Duplicate Check & Hashing)</p>
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
        <a href="connection_test.php">DB Test</a>
        <a href="register.php">Register</a>
        <a href="../pages/login.html">Login</a>
    </nav>

    <main class="page-container">

        <!-- Registration Form Card -->
        <section class="form-container" style="max-width: 650px; margin: 0 auto;">
            <h2>Secure Student Registration</h2>
            <p class="form-subtitle">Processed via PHP MySQLi with Prepared Statements and <code>password_hash()</code>.</p>

            <!-- Success Alert -->
            <?php if (!empty($successMessage)): ?>
                <div class="alert-success">
                    ✅ <?php echo htmlspecialchars($successMessage); ?>
                </div>
            <?php endif; ?>

            <!-- Error Alerts (Shows validation or duplicate email errors) -->
            <?php if (!empty($errors)): ?>
                <div class="alert-error">
                    <strong>⚠️ Registration Errors:</strong>
                    <ul>
                        <?php foreach ($errors as $err): ?>
                            <li><?php echo htmlspecialchars($err); ?></li>
                        <?php endforeach; ?>
                    </ul>
                </div>
            <?php endif; ?>

            <!-- Registration Form -->
            <form method="POST" action="register.php">

                <!-- Advanced Extension: Hidden CSRF Token -->
                <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">

                <!-- 1. Full Name -->
                <div class="form-group">
                    <label for="fullName">Full Name <span class="required">*</span></label>
                    <input type="text" id="fullName" name="fullName" placeholder="e.g. Rahul Sharma" 
                           value="<?php echo htmlspecialchars($fullName); ?>" required>
                </div>

                <!-- 2. Email Address -->
                <div class="form-group">
                    <label for="email">Email Address <span class="required">*</span></label>
                    <input type="email" id="email" name="email" placeholder="e.g. student@charusat.edu.in" 
                           value="<?php echo htmlspecialchars($email); ?>" required>
                    <small style="color: #666;">Unique check is performed in database before insert.</small>
                </div>

                <!-- 3. Mobile Number -->
                <div class="form-group">
                    <label for="mobile">Mobile Number (10 Digits) <span class="required">*</span></label>
                    <input type="tel" id="mobile" name="mobile" placeholder="e.g. 9876543210" maxlength="10" 
                           value="<?php echo htmlspecialchars($mobile); ?>" required>
                </div>

                <!-- 4. Course -->
                <div class="form-group">
                    <label for="course">Course / Department <span class="required">*</span></label>
                    <select id="course" name="course" required>
                        <option value="">-- Select Course --</option>
                        <option value="B.Tech IT" <?php echo ($course === 'B.Tech IT') ? 'selected' : ''; ?>>B.Tech Information Technology (IT)</option>
                        <option value="B.Tech CE" <?php echo ($course === 'B.Tech CE') ? 'selected' : ''; ?>>B.Tech Computer Engineering (CE)</option>
                        <option value="B.Tech CSE" <?php echo ($course === 'B.Tech CSE') ? 'selected' : ''; ?>>B.Tech Computer Science & Eng. (CSE)</option>
                        <option value="MCA" <?php echo ($course === 'MCA') ? 'selected' : ''; ?>>Master of Computer Applications (MCA)</option>
                    </select>
                </div>

                <!-- 5. Year -->
                <div class="form-group">
                    <label for="year">Year of Study <span class="required">*</span></label>
                    <select id="year" name="year" required>
                        <option value="">-- Select Year --</option>
                        <option value="1" <?php echo ($year === 1) ? 'selected' : ''; ?>>1st Year</option>
                        <option value="2" <?php echo ($year === 2) ? 'selected' : ''; ?>>2nd Year</option>
                        <option value="3" <?php echo ($year === 3) ? 'selected' : ''; ?>>3rd Year</option>
                        <option value="4" <?php echo ($year === 4) ? 'selected' : ''; ?>>4th Year</option>
                    </select>
                </div>

                <!-- 6. Password -->
                <div class="form-group">
                    <label for="password">Password (Min 6 chars) <span class="required">*</span></label>
                    <input type="password" id="password" name="password" placeholder="Enter secure password" required>
                </div>

                <!-- 7. Confirm Password -->
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password <span class="required">*</span></label>
                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" required>
                </div>

                <!-- Buttons -->
                <div class="form-buttons">
                    <button type="submit" class="submit-btn">Register Account (MySQLi POST)</button>
                    <button type="reset" class="reset-btn">Clear</button>
                </div>
            </form>
        </section>

        <!-- Live Registered Students Table (Verifies DB Insert & Password Hash) -->
        <section class="records-section">
            <h3>👥 Registered Students in Database (`students` table)</h3>
            <p>Notice the <code>password_hash</code> column: passwords are encrypted using bcrypt via <code>password_hash()</code>.</p>

            <div class="table-responsive">
                <table class="records-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Mobile</th>
                            <th>Course</th>
                            <th>Year</th>
                            <th>Bcrypt Password Hash (password_hash)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($studentsResult && $studentsResult->num_rows > 0): ?>
                            <?php while ($row = $studentsResult->fetch_assoc()): ?>
                                <tr>
                                    <td><?php echo $row['student_id']; ?></td>
                                    <td><strong><?php echo htmlspecialchars($row['full_name']); ?></strong></td>
                                    <td><?php echo htmlspecialchars($row['email']); ?></td>
                                    <td><?php echo htmlspecialchars($row['mobile']); ?></td>
                                    <td><span class="table-tag"><?php echo htmlspecialchars($row['course']); ?></span></td>
                                    <td>Year <?php echo $row['year_of_study']; ?></td>
                                    <td>
                                        <span class="hash-preview">
                                            <?php echo htmlspecialchars(substr($row['password_hash'], 0, 25)) . '...'; ?>
                                        </span>
                                    </td>
                                </tr>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="7" style="text-align: center;">No registered students yet.</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Advanced Extension: Audit Log Table -->
        <section class="records-section" style="margin-top: 25px;">
            <h3>🛡️ Security Audit Log (`audit_logs` table - Advanced Extension)</h3>
            <p>Every successful registration and duplicate email attempt is recorded here:</p>

            <div class="table-responsive">
                <table class="records-table">
                    <thead>
                        <tr>
                            <th>Log ID</th>
                            <th>Target Email</th>
                            <th>Security Action</th>
                            <th>IP Address</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($auditLogsResult && $auditLogsResult->num_rows > 0): ?>
                            <?php while ($log = $auditLogsResult->fetch_assoc()): ?>
                                <tr>
                                    <td><?php echo $log['log_id']; ?></td>
                                    <td><?php echo htmlspecialchars($log['user_email']); ?></td>
                                    <td>
                                        <span class="<?php echo ($log['action'] === 'REGISTRATION_SUCCESS') ? 'table-tag' : 'alert-error'; ?>" style="padding: 3px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">
                                            <?php echo htmlspecialchars($log['action']); ?>
                                        </span>
                                    </td>
                                    <td><?php echo htmlspecialchars($log['ip_address']); ?></td>
                                    <td><small><?php echo htmlspecialchars($log['log_time']); ?></small></td>
                                </tr>
                            <?php endwhile; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="5" style="text-align: center;">No audit logs recorded yet.</td>
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
<?php
$conn->close();
?>
