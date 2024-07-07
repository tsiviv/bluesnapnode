const axios = require('axios');
const { headers, headersXML } = require('./config');
const { parseString } = require('xml2js');
const https = require('https')
const fs =require('fs')
const axiosInstance = axios.create({
    baseURL: 'https://sandbox.bluesnap.com', // Replace with your server's base URL
    timeout: 5000, // Timeout in milliseconds
    withCredentials: true, // Include cookies in CORS requests
    httpsAgent: new https.Agent({
        ca: [
            fs.readFileSync('./netfree-ca.crt'),
        ]
    })
  });
async function createPlan(plan, res) {
    console.log(plan)

    try {
        const response = await axiosInstance.post('/services/2/recurring/plans', plan, {
            headers
        });
        console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error creating plan:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while creating the plan.' });
    }
}
async function getToken(req, res) {
    console.log("D")
    try {
        const response = await axiosInstance.post('/services/2/payment-fields-tokens', {}, {
            headers
        });
        const locationHeader = response.headers['location'];
        console.log(locationHeader)
        // Send the location header back in the response
        res.status(200).json({ tokenLocation: locationHeader });
    } catch (error) {
        console.log(error)
        console.error('Error creating plan:', error.response ? "data" + error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while creating the plan.' });
    }
}
async function createSubscription(subscription, res) {
console.log(subscription)
    try {
        const response = await axiosInstance.post('/services/2/recurring/subscriptions', subscription, { headers });
        console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error creating subscription:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while creating the subscription.' });
    }
}

async function getSubscription(subscription, res) {
    console.log(subscription)

    try {
        const response = await axiosInstance.get(`/services/2/recurring/subscriptions/${subscription.subscriptionId}`, { headers });
        console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching subscription:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while fetching the subscription.' });
    }
}

async function getAllPlans(res) {
    console.log("Dfdg");

    try {
        const response = await axiosInstance.get('/services/2/recurring/plans?pagesize=5&after=2185254&gettotal=true&fulldescription=true', { headers });
        if (!response.data.plans) {
            response.data.plans = []; // Initialize plans as an empty array
        }
        console.log(response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching plans:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred while fetching the plans.' });
    }
}
const getMonthlyPayments = async (subscriptionId, res) => {
    const headers = headersXML;
    try {
        const response = await axiosInstance.get(`/services/2/orders/resolve?subscriptionid=${subscriptionId.subscriptionId}`, { headers });
        const xmlData = response.data;

        // Parse XML to JSON
        let jsonData;
        parseString(xmlData, (err, result) => {
            if (err) {
                throw err;
            }
            jsonData = result;
        });
        const data = jsonData
        let totalAmountExcepted = 0;
        let totalAmountPaid = 0;
        let totalApprovedAmount = 0;

        // Access the properties of the jsonData object correctly
        const order = jsonData.order;
        const invoices = order['cart'][0]['cart-item'];

        invoices.forEach((item) => {
            totalAmountExcepted += parseFloat(item['item-sub-total'][0]);
        });

        const postSaleInfo = order['post-sale-info'][0];
        if (postSaleInfo && postSaleInfo['invoices']) {
            const invoices = postSaleInfo['invoices'][0]['invoice'];
            invoices.forEach((invoice) => {
                const financialTransactions = invoice['financial-transactions'][0]['financial-transaction'];
                financialTransactions.forEach((transaction) => {
                    const orderDate = new Date(transaction['date-created'][0]);
                    const lastMonthDate = new Date();
                    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

                    if (orderDate >= lastMonthDate) {
                        if (transaction['status'][0] === 'Approved') {
                            totalApprovedAmount += parseFloat(transaction['amount'][0]);
                        }
                        totalAmountPaid += parseFloat(transaction['amount'][0]);
                    }
                });
            });
        }

        const notPaidOrApprovedAmount = totalAmountExcepted - totalApprovedAmount;
        const monthlyPaymentDetails = {
            totalAmountExcepted,
            totalApprovedAmount,
            totalAmountPaid,
            notPaidOrApprovedAmount,
            data  // Include raw data for debugging or further processing if needed
        };

        // Return the monthly payment details as JSON response
        res.json(monthlyPaymentDetails);

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Error fetching transactions' });
    }
};

module.exports = {
    createPlan,
    createSubscription,
    getSubscription,
    getAllPlans,
    getMonthlyPayments,
    getToken
};