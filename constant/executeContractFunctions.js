
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { toUtf8 } from "@cosmjs/encoding";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import toast from 'react-hot-toast';

const default_fee = { amount: [{ amount: "50000", denom: "uosmo" }], gas: "2000000" };
const contract_execute_msg = (signer, contract_address, message, amount) => {
    return {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
            sender: signer,
            contract: contract_address,
            msg: (0, toUtf8)(JSON.stringify(message)),
            funds: amount,
        })
    }
}

const showSuccessToast = (message) => {
    toast.success(message, {
        style: {
            background: '#2550C0',
            color: 'white',
            fontSize: '16px', 
            padding: '10px',  
        },
        position: 'bottom-right',
    });
};

const showErrorToast = (message) => {
    toast.error(message, {
        style: {
            background: 'red',
            color: 'white',
            fontSize: '16px', 
            padding: '10px', 
        },
        position: 'bottom-right',
    });
};

export const handle_deposit = async (signer, client, message, token_contract_address, amount) => {
    try {
        const execute_msg = contract_execute_msg(signer, token_contract_address, message, amount);
        const deposit_transaction = await client.signAndBroadcast(signer, [execute_msg], default_fee, "");
        if(deposit_transaction.rawLog != null){
            showErrorToast('Deposit transaction failed');
            return false;
        }
        showSuccessToast('Deposit transaction successful');
        return true;
    } catch(error) {
        console.log(error);
        showErrorToast('Deposit transaction failed');
        return false;
    }
}

export const handle_borrow = async (signer, client, leverage_contract_address, token_address, amount) => {
    try {
        const message = { borrow: { token_address, token_amount: amount } };
        const execute_msg = contract_execute_msg(signer, leverage_contract_address, message);
        const borrow_transaction = await client.signAndBroadcast(signer, [execute_msg], default_fee, "");
        if(borrow_transaction.rawLog != null){
            showErrorToast('Borrow transaction failed');
            return false;
        }
        showSuccessToast('Borrow transaction successful');
        return true;
    } catch (error) {
        console.log(error);
        showErrorToast('Borrow transaction failed');
        return false;
    }
}

export const handle_repay = async (signer, client, leverage_contract_address, token_address, amount) => {
    try {
        const message = { repay: { token_address, token_amount: amount } };
        const execute_msg = contract_execute_msg(signer, leverage_contract_address, message);
        const repay_transaction = await client.signAndBroadcast(signer, [execute_msg], default_fee, "");
        if(repay_transaction.rawLog != null){
            showErrorToast('Repay transaction failed');
            return false;
        }
        showSuccessToast('Repay transaction successful');
        return true;
    } catch (error) {
        console.log(error);
        showErrorToast('Repay transaction failed');
        return false;
    }
}

export const handle_withdraw = async (signer, client, leverage_contract_address, message) => {
    try {
        const execute_msg = contract_execute_msg(signer, leverage_contract_address, message);
        const withdraw_transaction = await client.signAndBroadcast(signer, [execute_msg], default_fee, "");
        if(withdraw_transaction.rawLog != null){
            showErrorToast('Withdraw transaction failed');
            return false;
        }
        showSuccessToast('Withdraw transaction successful');
        return true;
    } catch (error) {   
        console.log(error);
        showErrorToast('Withdraw transaction failed');
        return false;
    }
}

export const handle_burn = async (signer, client, leverage_contract_address, token_address, amount) => {
    try {
        const message = { burn: { token_address, v_token_amount: amount } };
        const execute_msg = contract_execute_msg(signer, leverage_contract_address, message);
        const burn_transaction = await client.signAndBroadcast(signer, [execute_msg], default_fee, "");
        if(burn_transaction.rawLog != null){
            showErrorToast('Burn transaction failed');
            return false;
        }
        showSuccessToast('Burn transaction successful');
        return true;
    } catch (error) {
        console.log(error);
        showErrorToast('Burn transaction failed');
        return false;
    }
}
