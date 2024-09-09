"use client"
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { handle_borrow } from "@/constant/executeContractFunctions";
import { fetchUserData } from "@/lib/features/userDataInteractSlice";
import { leverage_contract_address } from "@/constant/constant";

const BorrowForm = () => {
    const [amount, setAmount] = useState();
    const dispatch = useAppDispatch();
    const signerData = useAppSelector(state => state.connectWallet);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await handle_borrow(signerData.signer, signerData?.client, leverage_contract_address, amount);
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
                <label htmlFor="amount">Amount: </label>
                <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
            </div>
            <button className="btn btn-primary" type="submit">Borrow</button>
        </form>
    );
}

export default BorrowForm