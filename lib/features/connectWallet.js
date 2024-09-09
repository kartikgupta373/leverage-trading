"use client"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { setupWebKeplr, GasPrice, Registry } from "cosmwasm";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc"
import { SigningStargateClient } from "@cosmjs/stargate";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { defaultRegistryTypes } from "@cosmjs/stargate";
import { tokens, queryBalanceMethods, leverage_contract_address } from "@/constant/constant";

const userWalletInitialState = {
    signer: null,
    clientSigner: null,
    client: null,
    loading: false,
    chain: null,
    error: null,
}

const addChain = async () => {
    try {
        const data = await window.keplr.experimentalSuggestChain({
            chainId: "osmo-test-5",
            chainName: "Osmosis Testnet 5",
            rpc: "https://rpc.osmotest5.osmosis.zone:443",
            rest: "https://lcd.osmotest5.osmosis.zone:1317",
            bip44: {
                coinType: 118,
            },
            bech32Config: {
                bech32PrefixAccAddr: "osmo",
                bech32PrefixAccPub: "osmo" + "pub",
                bech32PrefixValAddr: "osmo" + "valoper",
                bech32PrefixValPub: "osmo" + "valoperpub",
                bech32PrefixConsAddr: "osmo" + "valcons",
                bech32PrefixConsPub: "osmo" + "valconspub",
            },
            currencies: [
                {
                    coinDenom: "OSMO",
                    coinMinimalDenom: "uosmo",
                    coinDecimals: 6,
                    coinGeckoId: "osmosis",
                },
            ],
            feeCurrencies: [
                {
                    coinDenom: "OSMO",
                    coinMinimalDenom: "uosmo",
                    coinDecimals: 6,
                    coinGeckoId: "osmosis",
                    gasPriceStep: {
                        low: 0.01,
                        average: 0.025,
                        high: 0.04,
                    },
                },
            ],
            stakeCurrency: {
                coinDenom: "OSMO",
                coinMinimalDenom: "uosmo",
                coinDecimals: 6,
                coinGeckoId: "osmosis",
            },
        });
    } catch (error) {
        console.log(error);
    }
}

export const connectWallet = createAsyncThunk("connectWallet", async () => {
    try {
        console.log("Wallet Connected")
        addChain();

        if (!window.keplr) {
            throw new Error("Keplr Wallet extension not found");
        }

        await window.keplr.enable("osmo-test-5");

        const offlineSigner = await window.keplr.getOfflineSigner("osmo-test-5");
        
        const accounts = await offlineSigner.getAccounts();
        

        const tmClient = await Tendermint37Client.connect("https://rpc.osmotest5.osmosis.zone");
        

        const signerClient = await setupWebKeplr({
            rpcEndpoint: "https://rpc.osmotest5.osmosis.zone",
            chainId: "osmo-test-5",
            prefix: "osmosis",
            gasPrice: GasPrice.fromString("0.250uosmo"),
            tmClient
        });

        signerClient.tmClient = tmClient;



        const registry = new Registry([...defaultRegistryTypes, ["/cosmwasm.wasm.v1.MsgExecuteContract", MsgExecuteContract]]);

        const client = await SigningStargateClient.connectWithSigner(
            "https://rpc.osmotest5.osmosis.zone:443", offlineSigner, { registry: registry }
        )
            
        

        return {
            signer: accounts[0].address,
            clientSigner: signerClient,
            chain: "Osmosis Testnet",
            client,
        }
    } catch (error) {
        console.log(error)
    }
})

export const connectSlice = createSlice({
    name: "connect wallet slice",
    initialState: userWalletInitialState,
    extraReducers: builder => {
        builder.addCase(connectWallet.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(connectWallet.fulfilled, (state, action) => {
            state.loading = false;
            state.signer = action?.payload?.signer;
            state.clientSigner = action?.payload?.clientSigner;
            state.client = action?.payload?.client;
            state.chain = action?.payload?.chain;
            state.error = null;
        })
        builder.addCase(connectWallet.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
            state.signer = null;
            state.clientSigner = null;
            state.client = null;
        })
    },
    reducers: {
        disconnect: () => {
            return userWalletInitialState
        }
    }
})

export const { disconnect } = connectSlice.actions
export default connectSlice.reducer;