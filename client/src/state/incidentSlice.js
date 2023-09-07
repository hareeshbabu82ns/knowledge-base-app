import { api } from './api';
import { getCurrentDate } from 'utils';

export const incidentApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getIncidentTags: builder.query({
      query: ({ search }) => ({
        url: `api/activity/incidents/tags`,
        method: 'GET',
        params: { search },
      }),
      providesTags: ['IncidentTags'],
    }),
    getIncidents: builder.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: `api/activity/incidents`,
        method: 'GET',
        params: { page, pageSize, search },
      }),
      providesTags: ['Incidents'],
    }),
    getIncident: builder.query({
      query: (id) => {
        return {
          url: `api/activity/incidents/${id}`,
          method: 'GET',
        };
      },
      providesTags: (_, __, arg) => [{ type: 'Incident', id: arg }],
    }),
    addIncident: builder.mutation({
      query: ({ description, tags }) => {
        return {
          url: `api/activity/incidents`,
          method: 'POST',
          body: {
            description,
            tags: typeof tags === 'string' ? tags.split(',') : tags,
            clientDate: getCurrentDate(),
          },
        };
      },
      invalidatesTags: ['Incidents', 'IncidentTags'],
    }),
    updateIncident: builder.mutation({
      query: ({ id, data: { description, tags } }) => ({
        url: `api/activity/incidents/${id}`,
        method: 'PATCH',
        body: {
          description,
          tags: typeof tags === 'string' ? tags.split(',') : tags,
          clientDate: getCurrentDate(),
        },
      }),
      invalidatesTags: (_, __, arg) => [
        'Incidents',
        'IncidentTags',
        { type: 'Incident', id: arg.id },
      ],
    }),
    deleteIncident: builder.mutation({
      query: (id) => ({
        url: `api/activity/incidents/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Incidents'],
    }),
  }),
});

export const {
  useGetIncidentTagsQuery,
  useGetIncidentsQuery,
  useGetIncidentQuery,
  useAddIncidentMutation,
  useUpdateIncidentMutation,
  useDeleteIncidentMutation,
} = incidentApiSlice;

export const selectIncidentsResult = incidentApiSlice.endpoints.getIncidents.select();
