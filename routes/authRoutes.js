const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/register', authController.getRegister);
router.post('/register', authController.postRegister);

router.post('/logout', authController.postLogout);

router.get('/forgot-password', authController.getForgotPassword);
router.post('/forgot-password', authController.postForgotPassword);
router.get('/reset-password/:token', authController.getResetPassword);
router.post('/reset-password/:token', authController.postResetPassword);

router.get('/onboarding', authController.getOnboarding);
router.post('/api/onboarding/complete', authController.postOnboardingComplete);

module.exports = router;

router.post('/api/auth/mobile/login', authController.postMobileLogin);
