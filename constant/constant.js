import * as paillierBigint from "paillier-bigint";



export const pubkey = new paillierBigint.PublicKey(
    2110635290356708079658926219106600858277n,
    2110635290356708079658926219106600858278n
  );

export const leverage_contract_address = "osmo1fcl97gj3z4yu4cma4zdr4yr2av8n9rywjg3vmt2afmcz3cy2zqhsqajwmy";
export const usdc_contract_address = "osmo1dqyj3mnewh46fqa9h05xekepjy0fsg64etfhwt0tjldw3x2he40qx3n8nl";
export const native_token_name = "osmo";

export const tokens = [
    { name: "usdc", address: usdc_contract_address },
    { name: "native", address: native_token_name }
]
export const queryBalanceMethods = [
    { method: 'user_collateral_token_balance', key: 'collateral_balance' },
    { method: 'user_wrapped_token_balance', key: 'wrapped_leverage_balance' },
    { method: 'user_borrow_token_balance', key: 'borrow_balance' },
    { method: 'user_v_token_balance', key: 'v_token_balance' }
]

