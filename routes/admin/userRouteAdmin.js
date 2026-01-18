// const express = require("express")
// const router = express.Router()
// const { createUser, 
//     getUsers, getOneUser, updateOne, deleteOne
// } = require("../../controllers/admin/usermanagement")
// const { authenticate, isAdmin } = require("../../middlewares/authorizedUser")

// // 5 common api route
// router.post(
//     "/",
//     createUser
// )
// router.get(
//     "/",
//     authenticate, // next() goes to next getUser
//     isAdmin,
//     getUsers
// )

// router.get(
//     "/:id", // req.params.id
//     getOneUser
// )
// router.put(
//     "/:id", // req.params.id
//     updateOne
// )
// router.delete(
//     "/:id", // req.params.id
//     deleteOne
// )
// module.exports = router

const express = require("express");
const router = express.Router();
const { 
    createUser, 
    getUsers, 
    getOneUser, 
    updateOne, 
    deleteOne
} = require("../../controllers/admin/usermanagement");
const { authenticate, isAdmin } = require("../../middlewares/authorizedUser");

// Apply authentication and admin check to ALL routes
router.use(authenticate);
router.use(isAdmin);

// Create new user (Admin only)
router.post("/", createUser);

// Get all users (Admin only)
router.get("/", getUsers);

// Get single user by ID (Admin only)
router.get("/:id", getOneUser);

// Update user (Admin only)
router.put("/:id", updateOne);

// Delete user (Admin only)
router.delete("/:id", deleteOne);

module.exports = router;