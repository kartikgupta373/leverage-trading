import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { usdc_contract_address, leverage_contract_address, native_token_name, tokens, queryBalanceMethods } from "@/constant/constant";


const userAssetInitialData = {
    native: null,
    usdc: null,
    orders: [],
    loading: false,
    error: null
}

export const fetchUserData = createAsyncThunk("/fetch/userData", async ({ signer, clientSigner }, { rejectWithValue }) => {

    try {

        const query_balances = {}

        for (const token of tokens) {
            query_balances[token.name] = {};
            for (const queryBalanceMethod of queryBalanceMethods) {
                const response = await clientSigner.queryContractSmart(
                    leverage_contract_address,
                    { [queryBalanceMethod.method]: { token_address: token.address, user_address: signer } }
                );
                query_balances[token.name][queryBalanceMethod.key] = response;
            }
        }

        const orders_response = await clientSigner.queryContractSmart(
            leverage_contract_address,
            { user_orders: { user_address: signer } }
        )

        console.log(orders_response)
        return { query: query_balances, orders: orders_response };
    } catch (error) {
        console.log(error)
        return rejectWithValue("User Query Failed!");
    }
})

const userDataInteractSlice = createSlice({
    name: "user asset interaction",
    initialState: userAssetInitialData,
    extraReducers: builder => {
        builder.addCase(fetchUserData.pending, (state) => {
            state.loading = true
        });

        builder.addCase(fetchUserData.fulfilled, (state, action) => {
            state.loading = false;
            state.error = null;
            state.native = action.payload?.query.native;
            state.usdc = action.payload?.query.usdc;
            state.order = action.payload?.orders;
        });

        builder.addCase(fetchUserData.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error?.message
        })
    },
    reducers: {
        resetUserData: (state) => {
            state.native = null;
            state.usdc = null;
            state.orders = [];
            state.loading = false;
            state.error = null;
        }
    }
});

export const { resetUserData } = userDataInteractSlice.actions;
export default userDataInteractSlice.reducer;