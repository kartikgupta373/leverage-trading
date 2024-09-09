"use client"
import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserData } from '@/lib/features/userDataInteractSlice';
import BalancesTable from './BalancesTable';

const UserStats = () => {
  const signerData = useSelector(state => state.connectWallet);


  const dispatch = useDispatch();
  const signerAssetData = useSelector(state => state.userDataInteract);

  useEffect(() => {
    if (signerData?.clientSigner) {
      dispatch(fetchUserData({ signer: signerData.signer, clientSigner: signerData.clientSigner }))
    }
  }, [signerData])

 
  return (
    <div className="p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">User Stats</h2>
      <BalancesTable />
    </div>
  )
}

export default UserStats