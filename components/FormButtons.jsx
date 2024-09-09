"use client"
import React, { useEffect, useState } from 'react';
import TokenSelectorMenu from './TokenSelectorMenu';
import { handle_deposit, handle_borrow, handle_repay, handle_withdraw } from "@/constant/executeContractFunctions";
import { useSelector, useDispatch } from 'react-redux';
import { leverage_contract_address } from "@/constant/constant";
import { fetchUserData } from "@/lib/features/userDataInteractSlice";

const FormButtons = () => {
  const [activeForm, setActiveForm] = useState("deposit");
  const [tokenAddress, setTokenAddress] = useState(null);
  const [amount, setAmount] = useState(null);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();

  const signerData = useSelector(state => state.connectWallet);


  const handleButtonClick = (formName) => {
    setActiveForm(formName);
  };

  useEffect(() => {
    if (success) {
      dispatch(fetchUserData({ signer: signerData.signer, clientSigner: signerData.clientSigner }));
      setSuccess(false);
    }
  }, [success, signerData, dispatch]);

  const call_handle_deposit = async () => {
    let res;
    if (tokenAddress === "osmo") {
      const message = { deposit_native: { token_address: "osmo" } };
      res = await handle_deposit(signerData?.signer, signerData?.client, message, leverage_contract_address, [{ denom: "uosmo", amount: String(Number(amount) * (10 ** 6)) }]);
    } else {
      const message = { send: { contract: leverage_contract_address, amount, msg: btoa("") } };
      res = await handle_deposit(signerData?.signer, signerData?.client, message, tokenAddress, []);
    }
    if (res) setSuccess(true);
  };

  const call_handle_borrow = async () => {
    let res;
    if (tokenAddress === "osmo") {
      res = await handle_borrow(signerData?.signer, signerData?.client, leverage_contract_address, tokenAddress, amount);
    } else {
      res = await handle_borrow(signerData?.signer, signerData?.client, leverage_contract_address, tokenAddress, amount);
    }
    if (res) setSuccess(true);
  };

  const call_handle_repay = async () => {
    let res;
    if (tokenAddress === "osmo") {
      res = await handle_repay(signerData?.signer, signerData?.client, leverage_contract_address, tokenAddress, amount);
    } else {
      res = await handle_repay(signerData?.signer, signerData?.client, leverage_contract_address, tokenAddress, amount);
    }
    if (res) setSuccess(true);
  };

  const call_handle_withdraw = async () => {
    let res;
    if (tokenAddress === "osmo") {
      const message = { withdraw_token: { token_address: tokenAddress, token_amount: amount, withdraw_type: "native", native: "uosmo" } };
      res = await handle_withdraw(signerData?.signer, signerData?.client, leverage_contract_address, message);
    } else {
      const message = { withdraw_token: { token_address: tokenAddress, token_amount: amount, withdraw_type: "fungible", native: null } };
      res = await handle_withdraw(signerData?.signer, signerData?.client, leverage_contract_address, message);
    }
    if (res) setSuccess(true);
  };

  return (
    <div className="flex flex-col h-fit bg-grey-900[0.4] text-gray-100 w-[400px]">
      <div className="w-full max-w-md mx-auto space-y-4 p-6 rounded-lg">
        <div
          className={`bg-[#2550C0]/[0.21] w-full py-4 rounded-lg border ${activeForm === 'deposit' ? 'border-blue-500' : 'border-gray-700'}`}
          onClick={() => handleButtonClick('deposit')}
        >
          <p className='text-center'>Deposit</p>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${activeForm === 'deposit' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            {activeForm === 'deposit' && (
              <div className="mt-4 p-4 rounded-lg">
                <TokenSelectorMenu setTokenAddress={setTokenAddress} />
                <input
                  type="text"
                  placeholder="Enter deposit amount"
                  className="w-full px-3 py-2 rounded border border-gray-700 bg-gray-800 text-white"
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button className="mt-4 px-4 py-2 bg-blue-600 rounded-lg w-full" onClick={call_handle_deposit}>Submit</button>
              </div>
            )}
          </div>
        </div>
        <div
          className={`bg-[#2550C0]/[0.21] w-full py-4 rounded-lg border ${activeForm === 'withdraw' ? 'border-blue-500' : 'border-gray-700'}`}
          onClick={() => handleButtonClick('withdraw')}
        >
          <p className='text-center'>Withdraw</p>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${activeForm === 'withdraw' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            {activeForm === 'withdraw' && (
              <div className="mt-4 p-4 rounded-lg">
                <TokenSelectorMenu setTokenAddress={setTokenAddress} />
                <input
                  type="text"
                  placeholder="Enter withdraw amount"
                  className="w-full px-3 py-2 rounded border border-gray-700 bg-gray-800 text-white"
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button className="mt-4 px-4 py-2 bg-blue-600 rounded-lg w-full" onClick={call_handle_withdraw}>Submit</button>
              </div>
            )}
          </div>
        </div>
        <div
          className={`bg-[#2550C0]/[0.21] w-full py-4 rounded-lg border ${activeForm === 'borrow' ? 'border-blue-500' : 'border-gray-700'}`}
          onClick={() => handleButtonClick('borrow')}
        >
          <p className='text-center'>Borrow</p>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${activeForm === 'borrow' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            {activeForm === 'borrow' && (
              <div className="mt-4 p-4 rounded-lg">
                <TokenSelectorMenu setTokenAddress={setTokenAddress} />
                <input
                  type="text"
                  placeholder="Enter borrow amount"
                  className="w-full px-3 py-2 rounded border border-gray-700 bg-gray-800 text-white"
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button className="mt-4 px-4 py-2 bg-blue-600 rounded-lg w-full" onClick={call_handle_borrow}>Submit</button>
              </div>
            )}
          </div>
        </div>
        <div
          className={`bg-[#2550C0]/[0.21] w-full py-4 rounded-lg border ${activeForm === 'repay' ? 'border-blue-500' : 'border-gray-700'}`}
          onClick={() => handleButtonClick('repay')}
        >
          <p className='text-center'>Repay</p>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${activeForm === 'repay' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            {activeForm === 'repay' && (
              <div className="mt-4 p-4 rounded-lg">
                <TokenSelectorMenu setTokenAddress={setTokenAddress} />
                <input
                  type="text"
                  placeholder="Enter repay amount"
                  className="w-full px-3 py-2 rounded border border-gray-700 bg-gray-800 text-white"
                  onChange={(e) => setAmount(e.target.value)}
                />
                <button className="mt-4 px-4 py-2 bg-blue-600 rounded-lg w-full" onClick={call_handle_repay}>Submit</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormButtons;
