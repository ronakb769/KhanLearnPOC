const express = require('express')
const router = express.Router()

const userController = require('../controllers/userController')
const { verifyAccessToken } = require('../middleware/authMiddleware')
const { authorize } = require('../middleware/roleMiddleware')
const { ROLES } = require('../constants/roles')

// All user management routes require admin access
router.use(verifyAccessToken, authorize(ROLES.ADMIN))

router.get('/', userController.getUsers)
router.get('/:id', userController.getUserById)
router.patch('/:id/status', userController.updateUserStatus)
router.delete('/:id', userController.deleteUser)
router.get('/:id/stats', userController.getUserStats)

module.exports = router
