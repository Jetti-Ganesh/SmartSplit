import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const baseQuery = fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_URL}/api`,

    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        // console.log(token);

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    },
});

// Custom base query
const baseQueryWithAuth = async (args, api, extraOptions) => {

    const result = await baseQuery(args, api, extraOptions);

    // Like response interceptor
    if (result.error && result.error.status === 401) {

        localStorage.removeItem('token');
        localStorage.removeItem('user');


        window.location.href = '/login';
    }

    return result;
};

export const expenseAPI = createApi({
    reducerPath: 'expenseAPI',
    baseQuery: baseQueryWithAuth,
    endpoints: (builder) =>
    ({
        getExpenses: builder.query({
            query: (groupId) => `getexpenses/${groupId}`,
            providesTags: ['Expenses']
        }),
        createExpense: builder.mutation({
            query: (newExpense) => ({
                url: 'create-expense',
                method: 'POST',
                body: newExpense
            }),
            invalidatesTags: ['Expenses']
        })
    })
})
export const { useCreateExpenseMutation, useGetExpensesQuery } = expenseAPI;