import axios from "axios";

export const POST = async (request) => {
    const { sell_token_price, buy_token_price } = await request.json();
    try {
        const response = await axios.get(`https://pro-api.coinmarketcap.com/v1/tools/price-conversion?symbol=${sell_token_price}&amount=1&convert=${buy_token_price}`,
            { headers: { "X-CMC_PRO_API_KEY": "99e8b7ac-34a8-4b56-9ac3-a00ce4165050" } },
        );


        return Response.json({ data: response.data?.data }, { status: 200 })
    } catch (error) {
        return Response.error({ error }, { status: 500 })
    }
}