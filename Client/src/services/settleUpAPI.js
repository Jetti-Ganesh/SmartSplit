import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,
    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
    const result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    return result;
};

export const settleUpAPI = createApi({
    reducerPath: 'settleUpAPI',
    baseQuery: baseQueryWithAuth,
    endpoints: (builder) => ({
        getBalances: builder.query({
            query: (groupId) => `settlements/${groupId}/balances`,
            providesTags: ['Settlements']
        }),
        recordSettlement: builder.mutation({
            query: (settlement) => ({
                url: 'settlements',
                method: 'POST',
                body: settlement
            }),
            invalidatesTags: ['Settlements']
        }),
        simplifyDebts: builder.query({
            query: (groupId) => `settlements/${groupId}/simplify`
        })
    })
});

export const { useGetBalancesQuery, useRecordSettlementMutation, useSimplifyDebtsQuery } = settleUpAPI;
