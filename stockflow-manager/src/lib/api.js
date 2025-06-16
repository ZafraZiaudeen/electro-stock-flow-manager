import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BACKEND_URL = "http://localhost:8000";

export const api = createApi({
   reducerPath: "api",
   baseQuery: fetchBaseQuery({
    baseUrl: `${BACKEND_URL}/api/`,
    prepareHeaders: async (headers, { getState }) => {
      const token = await window?.Clerk?.session?.getToken();
      console.log(token);
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
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
   getPurchaseEntryByPartNumber: builder.query({
      query: (partNumber) => `purchase-entries/part/${partNumber}`, // Adjust endpoint as per backend
      providesTags: ["PurchaseEntries"],
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
  }),
});

export const {
  useGetAllPurchaseEntriesQuery,
  useGetPurchaseEntryByIdQuery,
  useCreatePurchaseEntryMutation,
  useUpdatePurchaseEntryMutation,
  useDeletePurchaseEntryMutation,
  useGetPurchaseEntryByPartNumberQuery,
} = api;