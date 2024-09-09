use crate::error::ContractError;
use crate::msg::{
    Cw20ReceiveMsg, ExecuteMsg, GetListedTokenResponse, GetProfitTokenResponse,
    GetUserBorrowTokenResponse, GetUserTokenBalanceResponse, GetUserUnmintedTokenResponse,
    InstantiateMsg, MigrateMsg, QueryMsg,
};
#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;
use cosmwasm_std::{
    to_json_binary, Addr, Binary, Deps, DepsMut, Env, MessageInfo, Reply, Response, StdResult,
    Uint128, WasmMsg,
};
use cw2::set_contract_version;

use crate::state::{
    LEVERAGE_CONTRACT_OWNER, LISTED_TOKEN, USER_BORROW_BALANCE, USER_PROFIT_TOKEN,
    USER_TOKEN_BALANCE, USER_UNMINTED_TOKEN,
};

const CONTRACT_NAME: &str = "crates.io:leverage-contract";
const CONTRACT_VERSION: &str = env!("CARGO_PKG_VERSION");

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    info: MessageInfo,
    _msg: InstantiateMsg,
) -> Result<Response, ContractError> {
    set_contract_version(deps.storage, CONTRACT_NAME, CONTRACT_VERSION)?;
    println!("inst: {}", _msg.token_contract_address);

    let mut token_list: Vec<String> = Vec::new();
    token_list.push(_msg.token_contract_address);
    LISTED_TOKEN.save(deps.storage, &token_list)?;

    LEVERAGE_CONTRACT_OWNER.save(deps.storage, &info.sender)?;

    Ok(Response::new()
        .add_attribute("method", "instantiate")
        .add_attribute("owner", info.sender))
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(_deps: DepsMut, _env: Env, msg: MigrateMsg) -> Result<Response, ContractError> {
    match msg {}
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    _deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::Receive(cw20_receive_msg) => {
            execute::token_deposit(_deps, _env, _info, cw20_receive_msg)
        }
        ExecuteMsg::ListTokenOnLeverage { token_address } => {
            execute::list_token_on_leverage(_deps, _env, _info, token_address)
        }
        ExecuteMsg::WithdrawToken {
            token_address,
            amount,
        } => execute::token_withdraw(_deps, _env, _info, token_address, amount),
        ExecuteMsg::Borrow { borrow_amount } => execute::borrow(_deps, _env, _info, borrow_amount),
        ExecuteMsg::Repay { repay_amount } => execute::repay(_deps, _env, _info, repay_amount),
        ExecuteMsg::Burn {
            token_address,
            v_token_amount,
        } => execute::burn(_deps, _env, _info, token_address, v_token_amount),
    }
}

pub mod execute {
    use super::*;

    pub fn list_token_on_leverage(
        deps: DepsMut,
        _env: Env,
        info: MessageInfo,
        token_address: String,
    ) -> Result<Response, ContractError> {
        match LEVERAGE_CONTRACT_OWNER.load(deps.storage) {
            Ok(owner) => {
                if owner != info.sender {
                    return Err(ContractError::Unauthorized {});
                }
            }
            Err(err) => {
                return Err(ContractError::GenericError {
                    error: err.to_string(),
                })
            }
        };

        match LISTED_TOKEN.update(
            deps.storage,
            |mut listed_token| -> Result<Vec<String>, ContractError> {
                listed_token.push(token_address);
                Ok(listed_token)
            },
        ) {
            Ok(_) => Ok(Response::new().add_attribute("method", "list_token_on_leverage")),
            Err(_) => Err(ContractError::UpdateTokenListFailed {}),
        }
    }

    /**
     * @dev Function to handle token deposit.
     *
     * This function allows users to deposit tokens into the contract.
     * It performs the following steps:
     * 2. Loads the listed tokens from storage.
     * 3. Checks if the sender's token is listed in the contract.
     * 4. If the token is listed, updates the user's token balance.
     * 5. Calculates the amount of unminted tokens based on the received amount.
     * 6. Updates the user's unminted token balance.
     *
     * @param deps Storage access for contract state.
     * @param _env Contract environment information.
     * @param _info Information about the message sender.
     * @param _cw20_receive_msg CW20 receive message containing sender and amount.
     * @return A response object indicating success or failure.
     */
    pub fn token_deposit(
        _deps: DepsMut,
        _env: Env,
        _info: MessageInfo,
        _cw20_receive_msg: Cw20ReceiveMsg,
    ) -> Result<Response, ContractError> {
        // Load the listed tokens from storage
        let token = match LISTED_TOKEN.load(_deps.storage) {
            Ok(tokens) => tokens,
            Err(_) => vec![],
        };

        // Check if the sender's token is listed
        if token.contains(&_info.sender.to_string()) {
            // Update the user's token balance
            USER_TOKEN_BALANCE.update(
                _deps.storage,
                (&_info.sender, &Addr::unchecked(&_cw20_receive_msg.sender)),
                |opt_balance| -> Result<Uint128, ContractError> {
                    match opt_balance {
                        Some(balance) => match balance.checked_add(_cw20_receive_msg.amount) {
                            Ok(data) => Ok(data),
                            Err(_) => Err(ContractError::OverflowBalance {}),
                        },
                        None => Ok(_cw20_receive_msg.amount),
                    }
                },
            )?;

            // Calculate the unminted token amount and update the user's unminted token balance
            let unminted_token = match _cw20_receive_msg.amount.checked_mul(Uint128::from(10u128)) {
                Ok(data) => data,
                Err(_) => Uint128::zero(),
            };

            USER_UNMINTED_TOKEN.update(
                _deps.storage,
                &Addr::unchecked(&_cw20_receive_msg.sender),
                |opt_balance| -> Result<Uint128, ContractError> {
                    match opt_balance {
                        Some(balance) => match balance.checked_add(unminted_token) {
                            Ok(data) => Ok(data),
                            Err(_) => Err(ContractError::OverflowBalance {}),
                        },
                        None => Ok(unminted_token),
                    }
                },
            )?;
        } else {
            return Err(ContractError::UnauthorizedToken {});
        }

        Ok(Response::new()
            .add_attribute("method", "token_deposit")
            .add_attribute("token_owner", _cw20_receive_msg.sender)
            .add_attribute("token_address", _info.sender))
    }

    /**
     * @dev Function to handle token withdrawal.
     * This function allows users to withdraw tokens from the contract.
     *
     * Steps:
     * 1. Load the user's borrow balance and ensure it's zero.
     * 2. If not zero, return an error.
     * 3. Load the user's token balance and ensure it's sufficient for withdrawal.
     * 4. If insufficient, return an error.
     * 5. Update the user's token balance by subtracting the withdrawal amount.
     * 6. Calculate the amount of unminted tokens to remove.
     * 7. Update the user's unminted token balance.
     * 8. Create a CW20 transfer message to transfer tokens back to the user.
     * 9. Return a response with attributes indicating the method and token details.
     *
     * @param _deps Storage access for contract state.
     * @param _env Contract environment information.
     * @param _info Information about the message sender.
     * @param _token_address Address of the token to be withdrawn.
     * @param _amount Amount of tokens to be withdrawn.
     * @return A response object indicating success or failure.
     */
    pub fn token_withdraw(
        _deps: DepsMut,
        _env: Env,
        _info: MessageInfo,
        _token_address: Addr,
        _amount: Uint128,
    ) -> Result<Response, ContractError> {
        // Load user's borrow balance
        let user_borrow_balance = match USER_BORROW_BALANCE.load(_deps.storage, &_info.sender) {
            Ok(data) => data,
            Err(_) => Uint128::zero(),
        };

        // Check if the user has any borrow balance
        if user_borrow_balance.gt(&Uint128::zero()) {
            return Err(ContractError::BorrowAmountIsNotZero {});
        }

        // Load user's token balance
        let user_balance =
            match USER_TOKEN_BALANCE.may_load(_deps.storage, (&_token_address, &_info.sender)) {
                Ok(opt_balance) => match opt_balance {
                    Some(balance) => balance,
                    None => Uint128::zero(),
                },
                Err(_) => Uint128::zero(),
            };

        // Check if user has sufficient balance for withdrawal
        if user_balance.lt(&_amount) {
            return Err(ContractError::InsufficientBalance {});
        }

        
        // Update user's token balance
        USER_TOKEN_BALANCE.update(
            _deps.storage,
            (&_token_address, &_info.sender),
            |opt_balance| -> Result<Uint128, ContractError> {
                match opt_balance {
                    Some(balance) => match balance.checked_sub(_amount) {
                        Ok(data) => Ok(data),
                        Err(_) => Err(ContractError::Overflow {})
                    },
                    None => Err(ContractError::InsufficientBalance {}),
                }
            },
        )?;

        // Calculate the amount of unminted tokens to remove
        let remove_unminted_token = match _amount.checked_mul(Uint128::from(10u128)) {
            Ok(data) => data,
            Err(_) => Uint128::zero(),
        };

        // Update user's unminted token balance
        USER_UNMINTED_TOKEN.update(
            _deps.storage,
            &_info.sender,
            |opt_balance| -> Result<Uint128, ContractError> {
                match opt_balance {
                    Some(balance) => match balance.checked_sub(remove_unminted_token) {
                        Ok(data) => Ok(data),
                        Err(_) => Err(ContractError::Overflow {}),
                    },
                    None => Err(ContractError::InsufficientBalance {}),
                }
            },
        )?;

        // Create CW20 transfer message to transfer tokens back to the user
        let execute_cw20_token_transfer = WasmMsg::Execute {
            contract_addr: _token_address.to_string(),
            msg: to_json_binary(&cw20::Cw20ExecuteMsg::Transfer {
                recipient: _info.sender.to_string(),
                amount: _amount,
            })?,
            funds: vec![],
        };

        Ok(Response::new()
            .add_attribute("method", "token_withdraw")
            .add_attribute("token_address", _token_address)
            .add_attribute("user", _info.sender)
            .add_message(execute_cw20_token_transfer))
    }

    /**
     * Function to borrow tokens.
     *
     * This function allows users to borrow tokens by locking their unminted tokens and
     * increasing their borrow balance.
     *
     * @param _deps Storage access for contract state.
     * @param _env Contract environment information.
     * @param _info Information about the message sender.
     * @param _borrow_amount Amount of tokens to borrow.
     * @return A response object indicating success or failure.
     */
    pub fn borrow(
        _deps: DepsMut,
        _env: Env,
        _info: MessageInfo,
        _borrow_amount: Uint128,
    ) -> Result<Response, ContractError> {
        // Load user's unminted token balance
        let user_unminted_token = match USER_UNMINTED_TOKEN.may_load(_deps.storage, &_info.sender) {
            Ok(opt_data) => match opt_data {
                Some(data) => data,
                None => Uint128::zero(),
            },
            Err(_) => {
                return Err(ContractError::UnmintedBalanceLoadError {});
            }
        };

        // Check if user's unminted token balance is sufficient
        if user_unminted_token.lt(&_borrow_amount) {
            return Err(ContractError::InsufficientUnmintedToken {});
        }

        // Update user's unminted token balance by subtracting borrowed amount
        USER_UNMINTED_TOKEN.update(
            _deps.storage,
            &_info.sender,
            |opt_unminted_balance| -> Result<Uint128, ContractError> {
                match opt_unminted_balance {
                    Some(data) => match data.checked_sub(_borrow_amount) {
                        Ok(unminted_balance) => Ok(unminted_balance),
                        Err(_) => return Err(ContractError::Overflow {}),
                    },
                    None => Ok(Uint128::zero()),
                }
            },
        )?;

        // Update user's borrow balance by adding borrowed amount
        USER_BORROW_BALANCE.update(
            _deps.storage,
            &_info.sender,
            |opt_borrow_balance| -> Result<Uint128, ContractError> {
                match opt_borrow_balance {
                    Some(data) => match data.checked_add(_borrow_amount) {
                        Ok(borror_balance) => Ok(borror_balance),
                        Err(_) => return Err(ContractError::Overflow {}),
                    },
                    None => Ok(_borrow_amount),
                }
            },
        )?;

        Ok(Response::new().add_attribute("method", "borrow_leverage"))
    }

    /**
     * Function to repay borrowed tokens.
     *
     * This function allows users to repay tokens they have borrowed, thereby reducing their borrow balance
     * and unlocking their unminted tokens.
     *
     * @param _deps Storage access for contract state.
     * @param _env Contract environment information.
     * @param _info Information about the message sender.
     * @param _repay_amount Amount of tokens to repay.
     * @return A response object indicating success or failure.
     */
    pub fn repay(
        _deps: DepsMut,
        _env: Env,
        _info: MessageInfo,
        _repay_amount: Uint128,
    ) -> Result<Response, ContractError> {
        // Load user's borrow balance
        let user_borrow_balance = match USER_BORROW_BALANCE.may_load(_deps.storage, &_info.sender) {
            Ok(opt_data) => match opt_data {
                Some(data) => data,
                None => Uint128::zero(),
            },
            Err(_) => return Err(ContractError::BorrowBalanceLoadError {}),
        };

        // check if the user's borrow balance is less than the repayment amount
        if user_borrow_balance.lt(&_repay_amount) {
            return Err(ContractError::RepayOverflow {});
        }

        // Update user's borrow balance by subtracting the repayment amount
        USER_BORROW_BALANCE.update(
            _deps.storage,
            &_info.sender,
            |opt_borrow_balance| -> Result<Uint128, ContractError> {
                match opt_borrow_balance {
                    Some(data) => match data.checked_sub(_repay_amount) {
                        Ok(borror_balance) => Ok(borror_balance),
                        Err(_) => return Err(ContractError::OverflowBalance {}),
                    },
                    None => return Err(ContractError::OverflowBalance {}),
                }
            },
        )?;

        // Update user's unminted token balance by adding the repayment amount
        USER_UNMINTED_TOKEN.update(
            _deps.storage,
            &_info.sender,
            |opt_unminted_balance| -> Result<Uint128, ContractError> {
                match opt_unminted_balance {
                    Some(data) => match data.checked_add(_repay_amount) {
                        Ok(unminted_balance) => Ok(unminted_balance),
                        Err(_) => return Err(ContractError::InsufficientBalance {}),
                    },
                    None => Ok(Uint128::zero()),
                }
            },
        )?;

        Ok(Response::new())
    }

    /**
     * Function to burn vToken and receive underlying assets.
     *
     * This function allows users to burn vTokens and receive the underlying assets in return.
     * It performs the following steps:
     * 1. Loads the user's borrow balance and checks if it is greater than zero.
     * 2. If the borrow balance is greater than zero, returns an overflow error indicating that the borrow balance must be zero for burning.
     * 3. Loads the user's profit balance and checks if it is sufficient for the burning.
     * 4. If the profit balance is less than the vToken amount, returns an error indicating insufficient balance.
     * 5. Calculates the amount of underlying USDC tokens to be received based on the vToken amount.
     * 6. Updates the user's token balance by adding the received USDC amount.
     * 7. Updates the user's unminted token balance by adding the vToken amount.
     * 8. Returns a response indicating success.
     *
     * @param _deps Storage access for contract state.
     * @param _env Contract environment information.
     * @param _info Information about the message sender.
     * @param _token_address Address of the vToken to be burned.
     * @param _v_token_amount Amount of vTokens to be burned.
     * @return A response object indicating success or failure.
     */

    pub fn burn(
        _deps: DepsMut,
        _env: Env,
        _info: MessageInfo,
        _token_address: Addr,
        _v_token_amount: Uint128,
    ) -> Result<Response, ContractError> {
        // Load the user's borrow balance from storage
        let user_borrow_balance = match USER_BORROW_BALANCE.may_load(_deps.storage, &_info.sender) {
            Ok(opt_data) => match opt_data {
                Some(data) => data,
                None => Uint128::zero()
            },
            Err(_) => return Err(ContractError::BorrowBalanceLoadError {}),
        };

        // If user's borrow balance is greater than zero, return an error
        if user_borrow_balance.gt(&Uint128::zero()) {
            return Err(ContractError::PayBorrowAmount {});
        }

        // Load the user's profit balance from storage
        let user_profit_balance = match USER_PROFIT_TOKEN.may_load(_deps.storage, &_info.sender) {
            Ok(opt_data) => match opt_data {
                Some(data) => data,
                None => Uint128::zero()
            },
            Err(_) => return Err(ContractError::ProfitBalanceLoadError {}),
        };

        // If user's profit balance is less than the amount to burn, return an error
        if user_profit_balance.lt(&_v_token_amount) {
            return Err(ContractError::InsufficientBalance {});
        }

        // Calculate the equivalent USDC amount based on the VToken amount burned (assuming 10:1 ratio)
        let user_usdc_amount = match _v_token_amount.checked_div(Uint128::from(10u128)) {
            Ok(data) => data,
            Err(_) => return Err(ContractError::Overflow {}),
        };

        // Update user's token balance by adding the calculated USDC amount
        USER_TOKEN_BALANCE.update(
            _deps.storage,
            (&_token_address, &_info.sender),
            |opt_balance| -> Result<Uint128, ContractError> {
                match opt_balance {
                    Some(balance) => match balance.checked_add(user_usdc_amount) {
                        Ok(data) => Ok(data),
                        Err(_) => Err(ContractError::Overflow {}),
                    },
                    None => Ok(Uint128::zero()),
                }
            },
        )?;

        // Update user's unminted token balance by adding the VToken amount burned
        USER_UNMINTED_TOKEN.update(
            _deps.storage,
            &_info.sender,
            |opt_balance| -> Result<Uint128, ContractError> {
                match opt_balance {
                    Some(balance) => match balance.checked_add(_v_token_amount) {
                        Ok(data) => Ok(data),
                        Err(_) => Err(ContractError::Overflow {}),
                    },
                    None => Ok(Uint128::zero()),
                }
            },
        )?;

        Ok(Response::new())
    }
}

/// Handling contract query
#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(_deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::UserTokenBalance {
            token_address,
            user_address,
        } => to_json_binary(&query::fetch_user_token_balance(
            _deps,
            _env,
            token_address,
            user_address,
        )?),
        QueryMsg::UserUnmintedTokenBalance { user_address } => to_json_binary(
            &query::fetch_user_unminted_token_balance(_deps, _env, user_address)?,
        ),
        QueryMsg::UserBorrowTokenBalance { user_address } => to_json_binary(
            &query::fetch_user_borrow_token_balance(_deps, _env, user_address)?,
        ),
        QueryMsg::UserProfitTokenBalance { user_address } => to_json_binary(
            &query::fetch_user_profit_token_balance(_deps, _env, user_address)?,
        ),
        QueryMsg::ListedTokens {} => to_json_binary(&query::fetch_listed_tokens(_deps, _env)?),
    }
}

pub mod query {
    use super::*;

    pub fn fetch_user_unminted_token_balance(
        _deps: Deps,
        _env: Env,
        _user_address: Addr,
    ) -> StdResult<GetUserUnmintedTokenResponse> {
        match USER_UNMINTED_TOKEN.may_load(_deps.storage, &_user_address) {
            Ok(opt_data) => match opt_data {
                Some(data) => Ok(GetUserUnmintedTokenResponse {
                    vtoken_amount: data,
                }),
                None => Ok(GetUserUnmintedTokenResponse {
                    vtoken_amount: Uint128::zero(),
                }),
            },
            Err(_) => Err(ContractError::UnmintedTokenQueryFailed {}.into()),
        }
    }

    pub fn fetch_user_token_balance(
        _deps: Deps,
        _env: Env,
        _token_address: Addr,
        _user_address: Addr,
    ) -> StdResult<GetUserTokenBalanceResponse> {
        match USER_TOKEN_BALANCE.may_load(_deps.storage, (&_token_address, &_user_address)) {
            Ok(opt_data) => match opt_data {
                Some(data) => Ok(GetUserTokenBalanceResponse { usdc_amount: data }),
                None => Ok(GetUserTokenBalanceResponse {
                    usdc_amount: Uint128::zero(),
                }),
            },
            Err(_) => Err(ContractError::UserTokenBalanceQueryFailed {}.into()),
        }
    }

    pub fn fetch_user_borrow_token_balance(
        _deps: Deps,
        _env: Env,
        _user_address: Addr,
    ) -> StdResult<GetUserBorrowTokenResponse> {
        match USER_BORROW_BALANCE.may_load(_deps.storage, &_user_address) {
            Ok(opt_data) => match opt_data {
                Some(data) => Ok(GetUserBorrowTokenResponse {
                    borrrow_vtoken_amount: data,
                }),
                None => Ok(GetUserBorrowTokenResponse {
                    borrrow_vtoken_amount: Uint128::zero(),
                }),
            },
            Err(_) => Err(ContractError::UserBorrowTokenBalanceQueryFailed {}.into()),
        }
    }

    pub fn fetch_user_profit_token_balance(
        _deps: Deps,
        _env: Env,
        _user_address: Addr,
    ) -> StdResult<GetProfitTokenResponse> {
        match USER_PROFIT_TOKEN.may_load(_deps.storage, &_user_address) {
            Ok(opt_data) => match opt_data {
                Some(data) => Ok(GetProfitTokenResponse {
                    profit_vtoken_amount: data,
                }),
                None => Ok(GetProfitTokenResponse {
                    profit_vtoken_amount: Uint128::zero(),
                }),
            },
            Err(_) => Err(ContractError::UserProfitTokenBalanceQueryFailed {}.into()),
        }
    }

    pub fn fetch_listed_tokens(deps: Deps, _env: Env) -> StdResult<GetListedTokenResponse> {
        match LISTED_TOKEN.may_load(deps.storage) {
            Ok(opt_listed_token) => match opt_listed_token {
                Some(data) => Ok(GetListedTokenResponse { listed_token: data }),
                None => Ok(GetListedTokenResponse {
                    listed_token: vec![],
                }),
            },
            Err(_) => Err(ContractError::UnableToFetchListedToken {}.into()),
        }
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn reply(_deps: DepsMut, _env: Env, _msg: Reply) -> Result<Response, ContractError> {
    Ok(Response::new())
}

#[cfg(test)]
mod test {
    use std::ops::Add;

    use super::*;
    use cosmwasm_std::{coins, Addr};
    use cw_multi_test::{AppBuilder, ContractWrapper, Executor};

    #[test]
    fn cw_multi_instantiate() {
        let init_funds = coins(100, "DEMON");
        let mut app = AppBuilder::new().build(|router, _, storage| {
            router
                .bank
                .init_balance(storage, &Addr::unchecked("creator"), init_funds)
                .unwrap();
        });

        let group_code_id =
            app.store_code(Box::new(ContractWrapper::new(execute, instantiate, query)));

        let msg = InstantiateMsg {
            token_contract_address: String::from("usdc_contract"),
        };

        let contract_addr = app.instantiate_contract(
            group_code_id,
            Addr::unchecked("creator"),
            &msg,
            &[],
            "leverage_contract",
            None,
        );

        let cont = contract_addr.unwrap();

        let execute_deposit_msg = ExecuteMsg::Receive(Cw20ReceiveMsg {
            sender: String::from("user_one"),
            amount: Uint128::from(1000u128),
            msg: to_json_binary(&{}).unwrap(),
        });

        let exe = app
            .execute_contract(
                Addr::unchecked("usdc_contract"),
                cont.clone(),
                &execute_deposit_msg,
                &[],
            )
            .unwrap();

        println!("{:?}", exe);

        let res_query_user_token_balance: GetUserTokenBalanceResponse = app
            .wrap()
            .query_wasm_smart(
                cont.clone(),
                &QueryMsg::UserTokenBalance {
                    token_address: Addr::unchecked("usdc_contract"),
                    user_address: Addr::unchecked("user_one"),
                },
            )
            .unwrap();

        println!("Response: {:?}", res_query_user_token_balance);


        // let borrow_exe_msg = ExecuteMsg::Borrow { borrow_amount: Uint128::from(100u128) };
        // let borrow_exe = app.execute_contract(Addr::unchecked("user_one"), cont.clone(), &borrow_exe_msg, &[]);
        // println!("{:?}", borrow_exe);

        // let res_query_user_borrow_balance: GetUserBorrowTokenResponse = app
        //     .wrap()
        //     .query_wasm_smart(cont.clone(), &QueryMsg::UserBorrowTokenBalance { user_address: Addr::unchecked("user_one") })
        //     .unwrap();

        // println!("Response: {:?}", res_query_user_borrow_balance);

        let withdraw_exe_msg = ExecuteMsg::WithdrawToken { token_address: Addr::unchecked("usdc_contract"), amount: Uint128::from(10u128) };
        let withdraw_exe = app.execute_contract(Addr::unchecked("user_one"), cont.clone(), &withdraw_exe_msg, &[]);
        println!("{:?}", withdraw_exe);
    }
}
