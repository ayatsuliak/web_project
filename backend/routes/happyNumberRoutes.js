const express = require('express');
const router = express.Router();
const happyNumberController = require('../controllers/happyNumberController');

router.route('/:number')
    .get(happyNumberController.calculateHappyNumber);

module.exports = router