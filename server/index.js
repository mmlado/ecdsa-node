const secp = require("ethereum-cryptography/secp256k1");
const keccak = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils")
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;


app.use(cors());
app.use(express.json());

const balances = {
  "03a912b9f7719beebe2d29963ab31fd14f19d39ac0c67845059f14eacb3de80eaa": 100, // 16f0cb059b5c9eacf049fb3ce75affa28db179d5cae091ccf7ffa3a392b3bd04
  "026115e8d4b266d7d28c34fae2c51116daa30ab6bae5662768cccc31d550320495": 50, // 3c0f26c77f38cb0c561066fd7cb0ae29d422883752065b626e53cadddafbea1e
  "036a5f3b62a9f048865411bc509b5623c7d8cd472b0e3f5b152c5dea4ed4f8c330": 75, // e27bea2e937a7bcaef0588dfae6e6431762062f1e62298b0d76eca9875fcb54f
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { data, signature } = req.body;
  const { sender, recipient, amount, timestamp } = JSON.parse(data);
  const now = new Date().getTime();

  if ((timestamp < now - 60) || (now + 60 < timestamp)) {
    res.status(404).send({ message: "Old message"});
  }

  if (!secp.secp256k1.verify(signature, keccak.keccak256(utf8ToBytes(data)), sender)) {
    res.status(404).send({ message: "Invalid signature"});
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
