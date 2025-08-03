const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'mock.json'));
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  next();
});

server.get('/referrals/:username', (req, res) => {
  const db = router.db;
  const user = db
    .get('profiles')
    .find({ username: req.params.username })
    .value();

  if (!user || !user.referrals) {
    return res.status(404).jsonp({ error: 'Referral data not found' });
  }

  res.jsonp(user.referrals);
});

server.get('/transactions/:username', (req, res) => {
  const db = router.db;
  const user = db
    .get('profiles')
    .find({ username: req.params.username })
    .value();

  if (!user || !user.transactions) {
    return res.status(404).jsonp({ error: 'Transactions not found' });
  }

  res.jsonp(user.transactions);
});

server.get('/profiles/:username', (req, res) => {
  const db = router.db;
  const user = db
    .get('profiles')
    .find({ username: req.params.username })
    .value();

  if (!user) {
    return res.status(404).jsonp({ error: 'User not found' });
  }

  res.jsonp(user);
});

server.post('/payments', (req, res) => {
  const db = router.db;
  const payments = db.get('payments');
  const id = Date.now();

  const newPayment = {
    id,
    ...req.body,
    status: 'inProgress',
    createdAt: new Date().toISOString(),
  };

  payments.push(newPayment).write();

  setTimeout(() => {
    payments.find({ id }).assign({ status: 'success' }).write();
    console.log(`✅ Payment ${id} marked as success`);
  }, 5000);

  res.status(201).jsonp(newPayment);
});

server.use(router);

server.listen(80, () => {
  console.log('🚀 JSON Server running at port 80');
});
