const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistration({ password, email, nickname }) {
    if (!password || !email || !nickname)
        return "All fields are required";

    if (!emailRegex.test(email))
        return "Invalid email format";

    if (password.length < 8)
        return "Password 8 long";

    if (!/\d/.test(password))
        return "Password 1 number";

    if (!/[a-z]/.test(password))
        return "Password lower case";

    if (!/[A-Z]/.test(password))
        return "Password uper case";

    if (!/[^A-Za-z0-9]/.test(password))
        return "Password special character";

    return null;
}

module.exports = {
    validateRegistration,
};