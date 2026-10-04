<?php
// ==========================================================================
// PRACTICAL 7: PHP Form Processing with Server-Side Validation & File Storage
// Beginner-friendly code for students
// ==========================================================================

session_start();

// Advanced Extension: CSRF Token Generation
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
}

// Variables to hold input values and status messages
$name = '';
$email = '';
$mobile = '';
$subject = '';
$message = '';
$errors = [];
$successMessage = '';

// Check if form is submitted via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // 1. CSRF Token Validation (Advanced Extension)
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        $errors[] = "Security check failed: Invalid CSRF Token.";
    }

    // 2. Input Sanitization
    $name    = isset($_POST['name'])    ? htmlspecialchars(trim($_POST['name'])) : '';
    $email   = isset($_POST['email'])   ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
    $mobile  = isset($_POST['mobile'])  ? htmlspecialchars(trim($_POST['mobile'])) : '';
    $subject = isset($_POST['subject']) ? htmlspecialchars(trim($_POST['subject'])) : '';
    $message = isset($_POST['message']) ? htmlspecialchars(trim($_POST['message'])) : '';

    // 3. Server-Side Validation
    // Validate Name (3-30 letters and spaces only)
    if (empty($name)) {
        $errors[] = "Full Name is required.";
    } elseif (!preg_match("/^[a-zA-Z\s]{3,30}$/", $name)) {
        $errors[] = "Name must be 3-30 characters (letters and spaces only).";
    }

    // Validate Email
    if (empty($email)) {
        $errors[] = "Email address is required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Please provide a valid email format.";
    }

    // Validate Mobile (10 digits starting with 6, 7, 8, or 9)
    if (empty($mobile)) {
        $errors[] = "Mobile number is required.";
    } elseif (!preg_match("/^[6-9]\d{9}$/", $mobile)) {
        $errors[] = "Mobile number must be exactly 10 digits starting with 6-9.";
    }

    // Validate Subject
    if (empty($subject)) {
        $errors[] = "Please select a subject.";
    }

    // Validate Message (min 5 characters)
    if (empty($message)) {
        $errors[] = "Message cannot be empty.";
    } elseif (strlen($message) < 5) {
        $errors[] = "Message must be at least 5 characters long.";
    }

    // 4. Safe File Writing to CSV and JSON (If no validation errors)
    if (empty($errors)) {
        $timestamp = date("Y-m-d H:i:s");

        // --- Save to CSV ---
        $csvFilePath = "../data/contacts.csv";
        $csvFile = fopen($csvFilePath, "a");
        if ($csvFile) {
            fputcsv($csvFile, [$name, $email, $mobile, $subject, $message, $timestamp]);
            fclose($csvFile);
        }

        // --- Save to JSON ---
        $jsonFilePath = "../data/contacts.json";
        $currentJsonData = [];
        if (file_exists($jsonFilePath)) {
            $jsonContent = file_get_contents($jsonFilePath);
            $currentJsonData = json_decode($jsonContent, true) ?: [];
        }

        $newRecord = [
            "name" => $name,
            "email" => $email,
            "mobile" => $mobile,
            "subject" => $subject,
            "message" => $message,
            "submitted_at" => $timestamp
        ];

        $currentJsonData[] = $newRecord;
        file_put_contents($jsonFilePath, json_encode($currentJsonData, JSON_PRETTY_PRINT));

        // Success message
        $successMessage = "Thank you, " . $name . "! Your message was validated and saved to both CSV and JSON.";

        // Clear input values after successful submission
        $name = $email = $mobile = $subject = $message = '';

        // Refresh CSRF Token
        $_SESSION['csrf_token'] = bin2hex(random_bytes(16));
    }
}

// Intermediate Extension: Read stored CSV records for display
$storedRecords = [];
$csvFilePath = "../data/contacts.csv";
if (file_exists($csvFilePath)) {
    $fp = fopen($csvFilePath, "r");
    if ($fp) {
        $header = fgetcsv($fp); // Read and skip header row
        while (($row = fgetcsv($fp)) !== false) {
            $storedRecords[] = $row;
        }
        fclose($fp);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StudentHub - Contact Form (Practical 7)</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>

    <!-- Header -->
    <header>
        <h1>StudentHub Portal</h1>
        <p>Practical 7: PHP Form Processing & File Storage (CSV & JSON)</p>
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

    <main class="form-main">
        <div class="contact-page-wrapper">

            <!-- Contact Form Card -->
            <section class="form-container">
                <h2>Contact & Inquiry Form</h2>
                <p class="form-subtitle">Processed on the server side using PHP (POST method).</p>

                <!-- Display Server-Side Success Message -->
                <?php if (!empty($successMessage)): ?>
                    <div class="alert-success">
                        ✅ <?php echo $successMessage; ?>
                    </div>
                <?php endif; ?>

                <!-- Display Server-Side Error Messages -->
                <?php if (!empty($errors)): ?>
                    <div class="alert-error">
                        <strong>⚠️ Please fix the following errors:</strong>
                        <ul>
                            <?php foreach ($errors as $error): ?>
                                <li><?php echo $error; ?></li>
                            <?php endforeach; ?>
                        </ul>
                    </div>
                <?php endif; ?>

                <!-- PHP Contact Form (POST) -->
                <form method="POST" action="contact.php" novalidate>

                    <!-- Advanced Extension: Hidden CSRF Token -->
                    <input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">

                    <!-- 1. Full Name -->
                    <div class="form-group">
                        <label for="name">Full Name <span class="required">*</span></label>
                        <input type="text" id="name" name="name" placeholder="Enter your full name" 
                               value="<?php echo htmlspecialchars($name); ?>" required>
                    </div>

                    <!-- 2. Email Address -->
                    <div class="form-group">
                        <label for="email">Email Address <span class="required">*</span></label>
                        <input type="email" id="email" name="email" placeholder="name@charusat.edu.in" 
                               value="<?php echo htmlspecialchars($email); ?>" required>
                    </div>

                    <!-- 3. Mobile Number -->
                    <div class="form-group">
                        <label for="mobile">Mobile Number (10 Digits) <span class="required">*</span></label>
                        <input type="tel" id="mobile" name="mobile" placeholder="e.g. 9876543210" maxlength="10" 
                               value="<?php echo htmlspecialchars($mobile); ?>" required>
                    </div>

                    <!-- 4. Subject Dropdown -->
                    <div class="form-group">
                        <label for="subject">Subject / Inquiry Type <span class="required">*</span></label>
                        <select id="subject" name="subject" required>
                            <option value="">-- Choose Subject --</option>
                            <option value="Event Inquiry" <?php echo ($subject === 'Event Inquiry') ? 'selected' : ''; ?>>Event Inquiry</option>
                            <option value="Workshop Registration" <?php echo ($subject === 'Workshop Registration') ? 'selected' : ''; ?>>Workshop Registration</option>
                            <option value="Technical Support" <?php echo ($subject === 'Technical Support') ? 'selected' : ''; ?>>Technical Support</option>
                            <option value="General Feedback" <?php echo ($subject === 'General Feedback') ? 'selected' : ''; ?>>General Feedback</option>
                        </select>
                    </div>

                    <!-- 5. Message -->
                    <div class="form-group">
                        <label for="message">Your Message / Query <span class="required">*</span></label>
                        <textarea id="message" name="message" rows="4" placeholder="Write your message here (min 5 characters)..." required><?php echo htmlspecialchars($message); ?></textarea>
                    </div>

                    <!-- Buttons -->
                    <div class="form-buttons">
                        <button type="submit" class="submit-btn">Send Message (POST)</button>
                        <button type="reset" class="reset-btn">Clear</button>
                    </div>
                </form>
            </section>

            <!-- Intermediate Extension: Display Stored CSV Records Table -->
            <section class="records-section">
                <h3>📁 Stored Inquiry Records (Read from CSV file)</h3>
                <p>These entries are safely stored in <code>StudentHUb/data/contacts.csv</code>:</p>

                <div class="table-responsive">
                    <table class="records-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Mobile</th>
                                <th>Subject</th>
                                <th>Message</th>
                                <th>Submitted At</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if (!empty($storedRecords)): ?>
                                <?php foreach ($storedRecords as $index => $record): ?>
                                    <tr>
                                        <td><?php echo $index + 1; ?></td>
                                        <td><strong><?php echo htmlspecialchars($record[0] ?? ''); ?></strong></td>
                                        <td><?php echo htmlspecialchars($record[1] ?? ''); ?></td>
                                        <td><?php echo htmlspecialchars($record[2] ?? ''); ?></td>
                                        <td><span class="table-tag"><?php echo htmlspecialchars($record[3] ?? ''); ?></span></td>
                                        <td><?php echo htmlspecialchars($record[4] ?? ''); ?></td>
                                        <td><small><?php echo htmlspecialchars($record[5] ?? ''); ?></small></td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php else: ?>
                                <tr>
                                    <td colspan="7" style="text-align: center;">No stored contact inquiries yet.</td>
                                </tr>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </section>

        </div>
    </main>

    <!-- Footer -->
    <footer>
        <p>&copy; 2026 StudentHub. All Rights are Reserved.</p>
    </footer>

    <!-- Scripts -->
    <script src="../js/script.js"></script>
</body>
</html>
