import { configureStore } from '@reduxjs/toolkit'
import connectWalletReducer from '../lib/features/connectWallet.js';
import contractDataInteractSlice from './features/contractDataInteractSlice.js';
import userDataInteractSlice from './features/userDataInteractSlice.js';

export const makeStore = () => {
  return configureStore({
    reducer: { 
      connectWallet: connectWalletReducer,
      contractInteract: contractDataInteractSlice,
      userDataInteract: userDataInteractSlice
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false,
    })
  })
}