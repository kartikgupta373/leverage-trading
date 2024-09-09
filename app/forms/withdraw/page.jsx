"use client"
import { useState } from "react";
import { handle_withdraw } from "@/constant/executeContractFunctions";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "@/lib/features/userDataInteractSlice";
import { leverage_contract_address } from "@/constant/constant";
import { useAppDispatch } from "@/lib/hooks";


const WithdrawForm = () => {
    const [tokenAddress, setTokenAddress] = useState("");
    const [amount, setAmount] = useState("");
    const dispatch = useAppDispatch();

    const signerData = useSelector(state => state.connectWallet);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await handle_withdraw(signerData?.signer, signerData?.client, leverage_contract_address, tokenAddress, amount);
            if (result) {
                console.log(result);
                dispatch(fetchUserData({ signer: signerData.signer, clientSigner: signerData.clientSigner }))
            }
        } catch (error) {
            console.error('Error during withdraw:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="tokenContractAddress">Token Address: </label>
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
            <button className="btn btn-primary" type="submit">Withdraw</button>
        </form>
    );
};

export default WithdrawForm;