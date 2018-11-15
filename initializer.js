'use strict';

const path = require('path');
const ecc = require('eosjs-ecc');
const { api } = require('./config');
const { sendTransaction, getErrorDetail, deployContract } = require('./utils');

module.exports = {
  async createTokenAccount({ account }) {
    const { EOSIO_PRIVATE_KEY } = process.env;
    if (!EOSIO_PRIVATE_KEY)
      throw new Error(
        'process.env.EOSIO_PRIVATE_KEY is not set. Make sure to add it in ".development.env"'
      );
    const EOSIO_PUBLIC_KEY = ecc.privateToPublic(EOSIO_PRIVATE_KEY);
    try {
      await api.rpc.get_account(account);
      console.log(`"${account}" already exists`);
      // no error => account already exists
      return;
    } catch (e) {
      // error => account does not exist yet
    }

    try {
      await sendTransaction([
        {
          account: 'eosio',
          name: 'newaccount',
          actor: 'eosio',
          data: {
            creator: 'eosio',
            name: account,
            owner: {
              threshold: 1,
              keys: [
                {
                  key: EOSIO_PUBLIC_KEY,
                  weight: 1,
                },
              ],
              accounts: [],
              waits: [],
            },
            active: {
              threshold: 1,
              keys: [
                {
                  key: EOSIO_PUBLIC_KEY,
                  weight: 1,
                },
              ],
              accounts: [],
              waits: [],
            },
          },
        },
      ]);
    } catch (error) {
      console.error('Could not creae account: ', getErrorDetail(error));
    }
  },

  async deployTokenContract({ account }) {
    const contractDir = path.join(__dirname, 'build');
    await deployContract({ account, contractDir });
  },

  async issueEosToken({ account }) {
    try {
      await sendTransaction({
        account,
        name: 'create',
        actor: account,
        data: {
          issuer: 'eosio',
          maximum_supply: '1000000000.0000 SYS',
        },
      });
    } catch (error) {
      console.error('Could not issue token: SYS ', getErrorDetail(error));
    }
    try {
      await sendTransaction({
        account: account,
        name: 'create',
        actor: account,
        data: {
          issuer: 'eosio',
          maximum_supply: '1000000000.0000 EOS',
        },
      });
    } catch (error) {
      console.error('Could not issue token: EOS ', getErrorDetail(error));
    }
  },
};