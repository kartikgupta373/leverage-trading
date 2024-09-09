"use client"
import { useState } from "react";
import { handle_deposit } from "@/constant/executeContractFunctions";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "@/lib/features/userDataInteractSlice";
import { leverage_contract_address } from "@/constant/constant";
import { useAppDispatch } from "@/lib/hooks";


const DepositForm = () => {
  const [tokenAddress, setTokenAddress] = useState("");
  const [amount, setAmount] = useState("");
  const dispatch = useAppDispatch();

  const signerData = useSelector(state => state.connectWallet);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await handle_deposit(signerData?.signer, signerData?.client, signerData?.clientSigner, tokenAddress, leverage_contract_address, amount);
      if (result) {
        console.log(result);
        dispatch(fetchUserData({ signer: signerData.signer, clientSigner: signerData.clientSigner }))
      }
    } catch (error) {
      console.error('Error during deposit:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="tokenContractAddress">Token Contract Address: </label>
        <input
          type="text"
          id="tokenContractAddress"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="amount">Amount: </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <button className="btn btn-primary" type="submit">Deposit</button>
    </form>
  );
};

export default DepositForm;