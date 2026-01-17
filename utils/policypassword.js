exports.validatePasswordStrength = (password) => {
  const minLength = 8;
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])/;

  if (password.length < minLength) {
    return "Password must be at least 8 characters";
  }

  if (!regex.test(password)) {
    return "Password must include uppercase, lowercase, number, and symbol";
  }

  return null;
};
