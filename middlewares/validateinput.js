const { body, validationResult } = require("express-validator");

exports.validateProfileUpdate = [
  body("name").optional().isLength({ min: 2, max: 50 }),
  body("phone").optional().matches(/^[0-9]{10}$/),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
