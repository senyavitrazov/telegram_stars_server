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

server.post('/transactions', (req, res) => {
  const db = router.db;
  const transactions = db.get('transactions');
  const id = Date.now();

  const newTransaction = {
    id,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  transactions.push(newTransaction).write();

  setTimeout(() => {
    const newStatus = Math.random() < 0.8 ? 'success' : 'error';
    transactions.find({ id }).assign({ status: newStatus }).write();
    console.log(`💰 tx ${id} marked as ${newStatus}`);
  }, 3000);

  res.status(201).jsonp({ txId: id, status: 'pending' });
});



server.get('/transactions/:txId/status', (req, res) => {
  const db = router.db;
  const txId = parseInt(req.params.txId, 10);

  const transaction = db.get('transactions').find({ id: txId }).value();

  if (!transaction) {
    return res.status(404).jsonp({ error: 'Transaction not found' });
  }

  res.jsonp({
    txId: transaction.id,
    status: transaction.status,
  });
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

server.get('/profiles/:username/transactions', (req, res) => {
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

server.get('/profiles/:username/referrals', (req, res) => {
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

server.get('/recipients/:username', (req, res) => {
  const db = router.db;
  const username = req.params.username;

  if (username === 'empty') {
    return res.status(404).jsonp({ error: 'Recipient not found' });
  }

  const recipient = db
    .get('recipients')
    .find({ username: 'testRecipientPreview' })
    .value();

  if (!recipient) {
    return res.status(500).jsonp({ error: 'Default recipient not found in DB' });
  }

  res.jsonp(recipient);
});

server.use(router);

server.listen(80, () => {
  console.log('🚀 JSON Server running at port 80');
});
