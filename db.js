const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');
const dbPath = path.join(dataDir, 'transactions.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([], null, 2));
}

const readDb = () => {
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    return [];
  }
};

const writeDb = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = {
  getAllTransactions: () => readDb(),
  getTransactionByReference: (ref) => readDb().find(t => t.reference === ref),
  saveTransaction: (tx) => {
    const txs = readDb();
    txs.push(tx);
    writeDb(txs);
    return tx;
  },
  updateTransactionStatus: (ref, status, resp = {}) => {
    const txs = readDb();
    const idx = txs.findIndex(t => t.reference === ref);
    if (idx !== -1) {
      txs[idx].status = status;
      txs[idx].gatewayResponse = resp;
      txs[idx].updatedAt = new Date().toISOString();
      writeDb(txs);
      return txs[idx];
    }
    return null;
  }
};
