// ===============================
//  AUTH.JS — Signup & Login Logic
// ===============================

// Get all relevant input elements
const form = document.getElementById("form");
const firstname_input = document.getElementById("firstname-input");
const email_input = document.getElementById("email-input");
const password_input = document.getElementById("password-input");
const repeat_password_input = document.getElementById("repeat-password-input");
const errorBox = document.getElementById("error-message");
const successBox = document.getElementById("success-message");

// Import users array from module.js (shared data between pages)
import { users } from "./module.js";

// ==========================================
//  FORM SUBMISSION HANDLER (SIGNUP or LOGIN)
// ==========================================
form.addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent form’s default page reload
  clearMessages(); // Clear any previous messages before validation

  let errors = [];

  // If `firstname_input` exists, we’re on the SIGNUP page
  if (firstname_input) {
    // -----------------------------
    //        SIGNUP LOGIC
    // -----------------------------
    errors = getSignupFormErrors(
      firstname_input.value.trim(),
      email_input.value.trim(),
      password_input.value.trim(),
      repeat_password_input.value.trim()
    );

    // If validation failed → show errors and stop
    if (errors.length > 0) return showErrors(errors);

    // Check if user already exists by email
    const existingUser = users.find(
      (u) => u.email === email_input.value.trim()
    );
    if (existingUser) return showErrors(["User already exists"]);

    // Create a new user object
    const newUser = {
      firstname: firstname_input.value.trim(),
      email: email_input.value.trim(),
      password: password_input.value.trim(),
      isGuest: false, // Mark as registered user
    };

    // Save user to localStorage for persistence across sessions
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Save logged-in user in *sessionStorage* (cleared when tab is closed)
    sessionStorage.setItem("currentuser", JSON.stringify(newUser));

    // Display success message, then redirect to login page
    showSuccess("Account created successfully! Redirecting to login...");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
  } else {
    // -----------------------------
    //         LOGIN LOGIC
    // -----------------------------
    errors = getLoginFormErrors(
      email_input.value.trim(),
      password_input.value.trim()
    );

    if (errors.length > 0) return showErrors(errors);

    // Find user that matches email and password
    const user = users.find(
      (u) =>
        u.email === email_input.value.trim() &&
        u.password === password_input.value.trim()
    );

    // If user not found → show error
    if (!user) return showErrors(["Invalid email or password"]);

    // Make sure we flag all logged-in users as non-guests
    const userWithFlag = { ...user, isGuest: false };

    // Save to sessionStorage so game pages can access current user
    sessionStorage.setItem("currentuser", JSON.stringify(userWithFlag));

    // Inform user and redirect
    showSuccess("Login successful! Redirecting...");
    setTimeout(() => {
      window.location.href = "../html_files/";
    }, 2000);
  }
});

// ===============================
//  UTILITY: CLEAR MESSAGE BOXES
// ===============================
function clearMessages() {
  if (errorBox) errorBox.innerHTML = "";
  if (successBox) successBox.innerHTML = "";
  if (errorBox) errorBox.style.display = "none";
  if (successBox) successBox.style.display = "none";
}

// ===============================
//  DISPLAY FUNCTIONS
// ===============================

// Show validation or login/signup errors
function showErrors(errors) {
  if (errorBox) {
    errorBox.innerHTML = errors.join("<br>");
    errorBox.style.display = "block";
  } else {
    alert(errors.join("\n"));
  }
}

// Show success message
function showSuccess(message) {
  if (successBox) {
    successBox.innerHTML = message;
    successBox.style.display = "block";
  } else {
    alert(message);
  }
}

// ===============================
//  VALIDATION FUNCTIONS
// ===============================

// Validate signup inputs
function getSignupFormErrors(firstname, email, password, repeatpassword) {
  let errors = [];

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Password: must contain at least
  // - one lowercase letter
  // - one uppercase letter
  // - one number
  // - minimum 8 characters
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  // Required fields
  if (!firstname) errors.push("Firstname is required");

  if (!email) errors.push("Email is required");
  else if (!emailRegex.test(email)) errors.push("Invalid email format");

  if (!password) errors.push("Password is required");
  else if (!passwordRegex.test(password))
    errors.push("Password must be 8+ chars, with upper/lowercase & a number");

  if (repeatpassword !== password) errors.push("Passwords do not match");

  return errors;
}

// Validate login inputs
function getLoginFormErrors(email, password) {
  let errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) errors.push("Email is required");
  else if (!emailRegex.test(email)) errors.push("Invalid email format");

  if (!password) errors.push("Password is required");

  return errors;
}
