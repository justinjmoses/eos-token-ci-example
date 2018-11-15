'use strict';

const { red } = require('chalk');
const { api } = require('../config.js');

const { CONTRACT_ACCOUNT } = process.env;

const createAction = ({
  account = CONTRACT_ACCOUNT,
  name,
  actor = CONTRACT_ACCOUNT,
  data = {},
}) => ({
  account,
  name,
  authorization: [
    {
      actor,
      permission: 'active',
    },
  ],
  data,
});

const sendTransaction = async args => {
  const actions = Array.isArray(args) ? args.map(createAction) : [createAction(args)];
  return api.transact(
    {
      actions,
    },
    {
      blocksBehind: 3,
      expireSeconds: 30,
    }
  );
};

function getErrorDetail(error) {
  try {
    const json = typeof error === 'string' ? JSON.parse(error) : JSON.parse(error.message);
    return json.error.details[0].message;
  } catch (e) {
    const { message, error: { code, name, what, details } = {} } = error.json;
    return red(message + (name ? `. ${name} (${code}): ${what}. ${details}` : ''));
  }
}

module.exports = {
  sendTransaction,
  getErrorDetail,
};