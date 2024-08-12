import { DateTime } from 'luxon';
import { api } from './api';
import { getCurrentDate } from 'utils';

export const activityApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query({
      query: ({ page, pageSize, sort, search }) => ({
        url: `api/activity/activities`,
        method: 'GET',
        params: { page, pageSize, search },
      }),
      providesTags: ['Activities'],
    }),
    getActivity: builder.query({
      query: (id) => {
        return {
          url: `api/activity/${id}`,
          method: 'GET',
        };
      },
      providesTags: (_, __, arg) => [{ type: 'Activity', id: arg }],
    }),
    addActivity: builder.mutation({
      query: ({ description, isExclusive, isRunning }) => {
        return {
          url: `api/activity/activities`,
          method: 'POST',
          body: {
            description,
            isExclusive,
            isRunning,
            clientDate: getCurrentDate(),
          },
        };
      },
      invalidatesTags: ['Activities'],
    }),
    updateActivity: builder.mutation({
      query: ({ id, data: { description, isExclusive, isRunning } }) => ({
        url: `api/activity/activities/${id}`,
        method: 'PATCH',
        body: {
          description,
          isExclusive,
          isRunning,
          clientDate: DateTime.now().toFormat('yyyyMMddHHmmss'),
        },
      }),
      invalidatesTags: (_, __, arg) => ['Activities', { type: 'Activity', id: arg.id }],
    }),
    deleteActivity: builder.mutation({
      query: (id) => ({
        url: `api/activity/activities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Activities'],
    }),
    // Activity Tracks
    getActivityTracks: builder.query({
      query: ({ id, page, pageSize, sort }) => ({
        url: `api/activity/${id}/tracks`,
        method: 'GET',
        params: { page, pageSize, sort },
      }),
      providesTags: (_, __, { id }) => [
        { type: 'Activity', id },
        { type: 'ActivityTracks', id },
      ],
    }),
    updateActivityTrack: builder.mutation({
      query: ({ activityId, trackId, dateStart, dateEnd }) => ({
        url: `api/activity/${activityId}/tracks/${trackId}`,
        method: 'PATCH',
        body: { dateStart, dateEnd },
      }),
      providesTags: (_, __, { activityId, trackId }) => [
        { type: 'Activity', activityId },
        { type: 'ActivityTracks', trackId },
      ],
    }),
    deleteActivityTrack: builder.mutation({
      query: ({ activityId, trackId }) => ({
        url: `api/activity/${activityId}/tracks/${trackId}`,
        method: 'DELETE',
      }),
      providesTags: (_, __, { activityId, trackId }) => [
        { type: 'Activity', activityId },
        { type: 'ActivityTracks', trackId },
      ],
    }),
  }),
});

export const {
  useGetActivityTracksQuery,
  useUpdateActivityTrackMutation,
  useDeleteActivityTrackMutation,
  useGetActivitiesQuery,
  useGetActivityQuery,
  useAddActivityMutation,
  useUpdateActivityMutation,
  useDeleteActivityMutation,
} = activityApiSlice;

export const selectActivitiesResult = activityApiSlice.endpoints.getActivities.select();
