exports.isAccountLocked = (user) => {
  if (!user.lockUntil) return false;

  if (user.lockUntil > Date.now()) {
    return true;
  } else {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.save(); 
    return false;
  }
};

exports.registerFailedAttempt = async (user) => {
  if (user.lockUntil && user.lockUntil < Date.now()) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  }

  user.loginAttempts += 1;

  if (user.loginAttempts >= 5) {
    user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
  }

  await user.save();
};

exports.resetLoginAttempts = async (user) => {
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();
};
