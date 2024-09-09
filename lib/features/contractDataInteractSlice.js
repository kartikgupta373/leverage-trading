import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const contractInitialData = {
    levearge_listed_tokens: [],
    loading: false,
    error: null
};

export const fetchContractData = createAsyncThunk("contract/interact", async (clientSigner, contract_address, { rejectWithValue }) => {
    try {
        const listed_tokens_data = await clientSigner.queryContractSmart(
            contract_address,
            { listed_tokens: {} }
        );

        return {
            listed_tokens: listed_tokens_data?.Ok?.listed_token
        }
    } catch (error) {
        return rejectWithValue("Contract Query Failed!");
    }
});

const contractDataInteractSlice = createSlice({
    name: "contract interaction",
    initialState: contractInitialData,
    extraReducers: builder => {
        builder.addCase(fetchContractData.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchContractData.fulfilled, (state, action) => {
            state.loading = false;
            state.levearge_listed_tokens = action?.payload?.listed_tokens;
            state.error = null;
        });
        builder.addCase(fetchContractData.rejected, (state, action) => {
            state.loading = false;
            state.levearge_listed_tokens = [],
            state.error = action.error.message
        });
    },
    reducers: {}
})

export default contractDataInteractSlice.reducer