const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const uploadImage = require('../middlewares/upload');

const categoriesController = require('../controllers/categoriesController');
const managerController = require('../controllers/managerController');
const itemsController = require('../controllers/itemsController');
const ordersController = require('../controllers/ordersController');
const paymentController = require('../controllers/paymentController');

router.post('/api/admin/login', managerController.login);

router.get('/api/categories', categoriesController.getCategories);
router.get('/api/categories/:id', categoriesController.getCategory);
router.post('/api/admin/categories', auth, categoriesController.createCategory);
router.put('/api/admin/categories/:id', auth, categoriesController.updateCategory);
router.delete('/api/admin/categories/:id', auth, categoriesController.deleteCategory);

router.get('/api/items', itemsController.getPublicItems);
router.post('/api/items/cart', itemsController.getPublicItemsByIds);
router.get('/api/items/:id', itemsController.getPublicItem);

router.get('/api/admin/items', auth, itemsController.getAllItems);
router.post('/api/admin/items', auth, uploadImage, itemsController.createItem);
router.put('/api/admin/items/:id', auth, uploadImage, itemsController.updateItem);
router.delete('/api/admin/items/:id', auth, itemsController.deleteItem);

router.post('/api/orders', ordersController.createOrder);
router.get('/api/payment-methods', paymentController.getPaymentMethods);
router.get('/api/orders/:id/status', paymentController.getPaymentStatus);
router.post('/api/orders/:id/cancel-payment', paymentController.cancelPayment);

router.get('/api/admin/orders', auth, ordersController.getOrders);
router.get('/api/admin/orders/:id', auth, ordersController.getOrder);
router.patch('/api/admin/orders/:id/status', auth, ordersController.setOrderStatus);
router.post('/api/admin/orders/:id/notes', auth, ordersController.addOrderNote);

module.exports = router;
