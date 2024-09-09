"use client"
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { connectWallet, disconnect } from '../lib/features/connectWallet';
import Link from 'next/link';
import Image from 'next/image';
import { FaSpinner } from 'react-icons/fa';
import { resetUserData } from '../lib/features/userDataInteractSlice';

const Header = () => {
    const signerData = useSelector(state => state.connectWallet);
    const dispatch = useDispatch();
    const signerAssetData = useSelector(state => state.userDataInteract);
    const [activeButton, setActiveButton] = useState(null);

    const handleButtonClick = (buttonName) => {
        setActiveButton(buttonName);
    };

    const handleConnectWallet = () => {
        dispatch(connectWallet());
    };

    const handleDisconnectWallet = () => {
        dispatch(disconnect());
        // dispatch(resetUserData());
    };

    return (
        <div className="pt-4 px-4 flex items-center justify-between fixed w-full shadow-sm z-20">
            <div>    
                <Link href="/dashboard">
                    <h1 className="text-3xl font-bold px-5">Levi<span className='text-yellow-400'>Fi</span></h1>
                </Link>
            </div>
            <div className='flex justify-center'>
                <Link href="/dashboard">
                    <button type="button" onClick={() => handleButtonClick('dashboard')} 
                    className={`font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 hover:text-yellow-400 ${
                    activeButton === 'dashboard' ? 'text-yellow-400' : 'text-white'}`}>
                        Dashboard
                    </button>
                </Link>
                <Link href="/exchange">
                    <button type="button" onClick={() => handleButtonClick('exchange')} 
                    className={`font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 hover:text-yellow-400 ${
                    activeButton === 'exchange' ? 'text-yellow-400' : 'text-white'}`}>Exchange
                    </button>
                </Link>
            </div>
            <div className="flex items-center">
                {!signerData.signer && (
                    <button 
                        type="button" 
                        className="text-black bg-yellow-400 hover:bg-yellow-500 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 w-[180px]" 
                        onClick={handleConnectWallet}
                        disabled={signerData.loading} // Disable button when loading
                    >
                        {signerData.loading ? (
                            <div className="flex items-center justify-center">
                                <FaSpinner className="animate-spin mr-2" /> 
                                Connecting...
                            </div>
                        ) : (
                            'Connect Wallet'
                        )}
                    </button>
                )}
                {signerData.signer && (
                    <button 
                        type="button" 
                        className="text-black bg-yellow-400 hover:bg-yellow-500 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 w-[180px]" 
                        onClick={handleDisconnectWallet}
                    >
                        Disconnect Wallet
                    </button>
                )}
            </div>
        </div>
    )
}

export default Header;
