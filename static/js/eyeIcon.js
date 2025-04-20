// Password Input
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

// Eye Icon
const passwordEyeIcon = document.getElementById("passwordEyeIcon");
const confirmPasswordEyeIcon = document.getElementById("confirmPasswordEyeIcon");

// Toggle Password Visibility function
function togglePasswordVisibility(inputField, eyeIcon) {
    if (inputField.type === "password") {
        inputField.type = "text";
        eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
    } else {
        inputField.type = "password";
        eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
    }
}

// Event listener for password input
passwordEyeIcon.addEventListener("click", function () {
    togglePasswordVisibility(passwordInput, passwordEyeIcon);
});

// Event listener for confirm password input
confirmPasswordEyeIcon.addEventListener("click", function () {
    togglePasswordVisibility(confirmPasswordInput, confirmPasswordEyeIcon);
});
