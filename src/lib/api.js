import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = "http://localhost:8000";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/`,
    prepareHeaders: async (headers, { getState }) => {
      const token = await window?.Clerk?.session?.getToken();
      //console.log(token);
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    },
  }),
  endpoints: (builder) => ({
    getAllPurchaseEntries: builder.query({
      query: () => "purchase-entries",
      providesTags: ["PurchaseEntries"],
    }),
    getPurchaseEntryById: builder.query({
      query: (id) => `purchase-entries/${id}`,
    }),
    createPurchaseEntry: builder.mutation({
      query: (purchaseEntry) => ({
        url: "purchase-entries",
        method: "POST",
        body: purchaseEntry,
      }),
      invalidatesTags: ["PurchaseEntries"],
    }),
    updatePurchaseEntry: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `purchase-entries/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: ["PurchaseEntries"],
    }),
    deletePurchaseEntry: builder.mutation({
      query: (id) => ({
        url: `purchase-entries/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PurchaseEntries"],
    }),
    getPurchaseEntryByPartNumber: builder.query({
      query: (partNumber) => `purchase-entries/part/${partNumber}`,
    }),
    getAllProjects: builder.query({
      query: () => "projects",
    }),
    createProject: builder.mutation({
      query: (project) => ({
        url: "projects",
        method: "POST",
        body: project,
      }),
    }),
    getAllIssues: builder.query({
      query: () => "issues",
    }),
    createIssue: builder.mutation({
      query: (issue) => ({
        url: "issues",
        method: "POST",
        body: issue,
      }),
    }),
    // New endpoints
    getAvailableInventoryByPartNumber: builder.query({
      query: (partNumber) => `issues/available/${partNumber}`,
    }),
    createOpeningStock: builder.mutation({
      query: (stock) => ({
        url: "opening-stock",
        method: "POST",
        body: stock,
      }),
    }),
    getAllOpeningStock: builder.query({
      query: () => "opening-stock",
    }),
    // User Management Endpoints
    getAllUsers: builder.query({
      query: () => "users",
      providesTags: ["Users"],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: "users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    updateUserRole: builder.mutation({
      query: ({ userId, role }) => ({
        url: `users/${userId}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: ["Users"],
    }),
    updateUserStatus: builder.mutation({
      query: ({ userId, status }) => ({
        url: `users/${userId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
    resendUserInvite: builder.mutation({
      query: (userId) => ({
        url: `users/${userId}/resend-invite`,
        method: "POST",
      }),
    }),
    requestUpgrade: builder.mutation({
      query: () => ({
        url: "users/request-upgrade",
        method: "POST",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetAllPurchaseEntriesQuery,
  useGetPurchaseEntryByIdQuery,
  useCreatePurchaseEntryMutation,
  useUpdatePurchaseEntryMutation,
  useDeletePurchaseEntryMutation,
  useGetPurchaseEntryByPartNumberQuery,
  useGetAllProjectsQuery,
  useCreateProjectMutation,
  useGetAllIssuesQuery,
  useCreateIssueMutation,
  useGetAvailableInventoryByPartNumberQuery,
  useCreateOpeningStockMutation,
  useGetAllOpeningStockQuery,
  // User Management Hooks
  useGetAllUsersQuery,
  useCreateUserMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useResendUserInviteMutation,
  useRequestUpgradeMutation,
} = api;