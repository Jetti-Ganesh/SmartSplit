import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './api';
const baseQuery = fetchBaseQuery({
    baseUrl: API_BASE_URL,

    prepareHeaders: (headers) => {
        const token = localStorage.getItem('token');
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    },
});

// Custom base query
const baseQueryWithAuth = async (args, api, extraOptions) => {

    const result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
        }),
        addMember: builder.mutation({
            query: ({ groupId, email }) => ({
                url: `add-member/${groupId}`,
                method: 'POST',
                body: { email }
            }),
            invalidatesTags: ['Groups']
        }),
        joinGroup: builder.mutation({
            query: ({ code }) => ({
                url: 'join-group',
                method: 'POST',
                body: { code }
            }),
            invalidatesTags: ['Groups']
        })
    })
})
export const { useCreateGroupMutation, useGetGroupsQuery, useAddMemberMutation, useJoinGroupMutation } = groupAPI;