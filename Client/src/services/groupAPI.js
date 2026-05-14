import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
const baseQuery = fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api',

    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        console.log(token);
        
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

export const groupAPI = createApi({
    reducerPath: 'groupAPI',
    baseQuery: baseQueryWithAuth,
    endpoints: (builder) =>
    ({
        getGroups: builder.query({
            query: () => 'getgroups',
            providesTags: ['Groups']
        }),
        createGroup: builder.mutation({
            query: (newGroup) => ({
                url: 'create-group',
                method: 'POST',
                body: newGroup
            }),
            invalidatesTags: ['Groups']
        })
    })
})
export const { useCreateGroupMutation, useGetGroupsQuery } = groupAPI;