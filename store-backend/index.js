require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static(__dirname + '/public'));
// Stripe signs the exact bytes it sends, so this route must read the raw body BEFORE express.json().
const paymentController = require('./controllers/paymentController');
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), paymentController.stripeWebhook);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const webRouter = require('./route/web');
app.use(webRouter);

// Release stock of online orders that were never paid.
const { cleanUpStaleOrders } = require('./services/orderPayments');
setInterval(() => cleanUpStaleOrders().catch((error) => console.log(error.message)), 10 * 60 * 1000).unref();

const port = process.env.PORT;
app.listen(port, () => {
    console.log('server start at port ' + port);
});
