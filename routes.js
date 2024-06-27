const express = require('express');
const { createPlan, createSubscription, getSubscription, getAllPlans, getMonthlyPayments } = require('./dol');

const router = express.Router();

router.post('/plans', (req, res) => {
    createPlan(req.body, res);
});

router.post('/subscriptions', (req, res) => {
    createSubscription(req.body, res);
});

router.get('/subscriptions/:id', (req, res) => {
    getSubscription({ subscriptionId: req.params.id }, res);
});

router.get('/plans', (req, res) => {
    getAllPlans(res);
});

router.get('/subscriptions/:id/payments', (req, res) => {
    getMonthlyPayments({ subscriptionId: req.params.id }, res);
});

module.exports = router;
