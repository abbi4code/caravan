# Caravan Setup with Local Bitcoin Node (Regtest)

**Branch:** `competency_test_2`  
This branch contains my submission for **Competency Test 2** as part of my Summer of Bitcoin application.

The goal was to set up [Caravan](https://github.com/caravan-bitcoin/caravan) with a local Bitcoin node in regtest mode, import a multisig wallet, and demonstrate a transaction flow.

---

##  Video Demo

I’ve recorded a video tutorial demonstrating the entire setup process, which you can watch here:  
👉 [Watch on YouTube](https://youtu.be/Y99pBjhnO_c)

---


## Step 1: Set Up a Bitcoin Regtest Node

1. **Create a fresh data directory:**
   ```bash
   mkdir ~/bitcoin-regtest
   
2. **Added a bitcoin.conf file to configure the node:**
   ```bash
    ## global settings
    server=1
    rpcuser=abhishek
    rpcpassword=abhishek
    rpcallowip=127.0.0.1
    txindex=1
    fallbackfee=0.00001

    # regtest settings
    [regtest]
    regtest=1
    rpcbind=127.0.0.1
    rpcport=18443

   
3. **Start the Bitcoin Node:**
   ```bash
   bitcoind -regtest -daemon -datadir=/home/exyyyyy/bitcoin-regtest


##  Step 2: Create Signer and Watcher Wallets

1. **Create signer wallets:**
   ```bash
   bitcoin-cli -regtest -datadir=/home/exyyyyy/bitcoin-regtest createwallet "reg_signer_1"
   bitcoin-cli -regtest -datadir=/home/exyyyyy/bitcoin-regtest createwallet "reg_signer_2"


2. **Create a watch-only wallet:**
   ```bash
   bitcoin-cli -regtest -datadir=/home/exyyyyy/bitcoin-regtest createwallet "watcher2" true true
   
   

##  Step 3: Configure Caravan with a Multisig Wallet

1. **Extract descriptors to get xpubs and xfps:**
   ```bash
   bitcoin-cli -regtest -datadir=/home/exyyyyy/bitcoin-regtest -rpcwallet="reg_signer_1" listdescriptors
   bitcoin-cli -regtest -datadir=/home/exyyyyy/bitcoin-regtest -rpcwallet="reg_signer_2" listdescriptors

2. **Create my-multisig-wallet.json with extracted values (included in this branch).**
3. **Run Caravan locally:**
   ```bash
   cd ~/github/caravan
   turbo run dev
4. **Import the my-multisig-wallet.json file into Caravan.**

   

## Step 4: Set Up NGINX Reverse Proxy for CORS

Caravan encountered CORS issues when connecting to the Bitcoin node. To fix this:

1. **Install NGINX::**
   ```bash
   sudo apt install nginx

2. **Create a proxy config file at `/etc/nginx/sites-available/bitcoin-regtest-proxy` to route `http://regtest.localhost:8080` to `http://127.0.0.1:18443` with CORS headers.**

3. **Enable and reload the config:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/bitcoin-regtest-proxy /etc/nginx/sites-enabled/
   sudo systemctl reload nginx
  
4. **Update your /etc/hosts file:**
   ```bash
   127.0.0.1 regtest.localhost


## Step 5: Send and Confirm a Transaction

1. **Get a multisig address from Caravan ("Receive" tab):**
   Example: `2NB6jFLeEmxCjacuHf1eiuS9XkyFNgiV2uv`
   ```bash
   127.0.0.1 regtest.localhost
   
2. **Mine blocks and fund the signer wallet:**
   ```bash
   bitcoin-cli -regtest -datadir=/home/exyyyyy/bitcoin-regtest -rpcwallet=reg_signer_1 getnewaddress
   bitcoin-cli -regtest -datadir=/home/exyyyyy/bitcoin-regtest generatetoaddress 101 "your_new_address"

3. **Send 0.003 BTC to the multisig address:**
   ```bash
   bitcoin-cli -regtest -datadir=/home/exyyyyy/bitcoin-regtest -rpcwallet=reg_signer_1 sendtoaddress "2NB6jFLeEmxCjacuHf1eiuS9XkyFNgiV2uv" 0.003

4. **Check the transaction in Caravan ("Pending Transactions" tab).**
   
5. **Mine one more block to confirm:**
   ```bash
   bitcoin-cli -regtest -datadir=/home/exyyyyy/bitcoin-regtest generatetoaddress 1 "your_new_address"

6. **Verify the confirmation in Caravan's transaction history.**


## Conclusion

This setup demonstrates how to use Caravan with a local Bitcoin regtest node for multisig wallet management, including:

- Wallet creation (signer + watcher)

- Transaction broadcasting and confirmation

- Fixing CORS issues via NGINX

This README and the accompanying video provide a full walkthrough for anyone looking to replicate this setup and contribute to Caravan.


  
