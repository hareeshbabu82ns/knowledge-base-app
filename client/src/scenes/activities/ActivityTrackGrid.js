import React, { useState } from 'react';
import StyledDataGrid from 'components/StyledDataGrid';
import { GridActionsCellItem, GridRowModes } from '@mui/x-data-grid';
import {
  useDeleteActivityTrackMutation,
  useGetActivityTracksQuery,
  useUpdateActivityTrackMutation,
} from 'state/activitySlice';

import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import ActivityTrackToolbar from './ActivityTrackToolbar';
import { useParams } from 'react-router-dom';
import TimerWidget from 'components/TimerWidget';
import { diffInSeconds, formatJsDateToDB, formatToJSDate } from 'utils';
import { toast } from 'react-toastify';
import { useMediaQuery } from '@mui/material';

const ActivityTrackGrid = ({ activityRefetch }) => {
  const { id } = useParams();
  const [rowModesModel, setRowModesModel] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState({ field: 'dateStart', sort: 'desc' });

  const smUp = useMediaQuery((theme) => theme.breakpoints.up(500));

  const [deleteActivityTrack] = useDeleteActivityTrackMutation();
  const [updateActivityTrack] = useUpdateActivityTrackMutation();

  const {
    data: activityTracks,
    isLoading,
    isFetching,
    refetch,
  } = useGetActivityTracksQuery({ pageSize, page, sort: JSON.stringify(sort), id });

  // const handleOnNewClicked = () => {
  // };

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = React.useCallback(async (newRow, oldRow) => {
    // console.log(newRow, oldRow);

    const updatedRow = {
      ...newRow,
      isNew: false,
    };

    if (updatedRow.dateStart === oldRow.dateStart && updatedRow.dateEnd === oldRow.dateEnd) {
      // no changes
      return oldRow;
    }
    if (updatedRow.dateEnd !== '' && updatedRow.dateStart >= updatedRow.dateEnd) {
      return Promise.reject('Date Start and Date End Inconsistant');
    }
    // console.log(updatedRow);
    // updateActivity({ id: newRow['_id'], data: { description: newRow.description } });
    const res = await updateActivityTrack({
      activityId: updatedRow.activityId,
      trackId: updatedRow._id,
      dateStart: updatedRow.dateStart,
      dateEnd: updatedRow.dateEnd,
    });
    // console.log(res);
    if (res?.error) {
      // if (activityRefetch) await activityRefetch();
      return Promise.reject(res.error?.data.message);
    }
    return updatedRow;
  }, []);

  const handleProcessRowUpdateError = React.useCallback((error) => {
    toast.error(error);
  }, []);

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const handleDeleteClick = (trackId) => async () => {
    // console.log( trackId )
    await deleteActivityTrack({ activityId: id, trackId });
    await refetch();
    if (activityRefetch) await activityRefetch();
  };

  const columns = [
    {
      field: '_id',
      headerName: 'ID',
      flex: 1,
    },
    {
      field: 'dateStart',
      headerName: 'Date Start',
      width: smUp ? undefined : 200,
      flex: smUp ? 1 : undefined,
      editable: true,
      type: 'dateTime',
      valueGetter: ({ value }) => formatToJSDate({ dateStr: value }),
      valueSetter: ({ value, row }) => ({ ...row, dateStart: formatJsDateToDB({ date: value }) }),
    },
    {
      field: 'dateEnd',
      headerName: 'Date End',
      width: smUp ? undefined : 200,
      flex: smUp ? 1 : undefined,
      editable: true,
      type: 'dateTime',
      valueGetter: ({ value }) => (value === '' ? value : formatToJSDate({ dateStr: value })),
      valueSetter: ({ value, row }) => ({ ...row, dateEnd: formatJsDateToDB({ date: value }) }),
    },
    {
      field: 'runtime',
      headerName: 'Run Time',
      width: 100,
      // valueGetter: ({ value }) => formatDuration({ seconds: value }),
      renderCell: ({ value, row }) => {
        // console.log(value, row.startedAt);
        const diff =
          value + (row?.dateEnd === '' ? diffInSeconds({ dateStart: row?.dateStart }) : 0);
        return <TimerWidget running={row?.dateEnd === ''} runtime={diff} />;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: ({ id, row: { dateEnd } }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key={`save_${id}`}
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              key={`cancel_${id}`}
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }
        return [
          <GridActionsCellItem
            key={`edit_${id}`}
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            disabled={dateEnd === ''}
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            key={`delete_${id}`}
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ];
      },
    },
  ];

  return (
    <StyledDataGrid
      loading={isLoading || isFetching}
      rows={activityTracks?.data || []}
      columns={columns}
      getRowId={(row) => row['_id']}
      pagination
      page={page}
      autoHeight
      paginationMode="server"
      sortingMode="server"
      initialState={{
        pagination: {
          paginationModel: { pageSize, page },
        },
        sorting: {
          sortModel: [sort],
        },
        columns: {
          columnVisibilityModel: {
            _id: false,
            isRunning: false,
          },
        },
      }}
      rowHeight={72}
      rowCount={activityTracks?.total || 0}
      onPaginationModelChange={(m) => {
        if (page !== m.page) setPage(m.page);
        if (pageSize !== m.pageSize) setPageSize(m.pageSize);
      }}
      onSortModelChange={(m) => {
        setSort(m[0]);
      }}
      slots={{ toolbar: ActivityTrackToolbar }}
      slotProps={{
        toolbar: {
          onRefetch: refetch,
        },
      }}
      editMode="row"
      rowModesModel={rowModesModel}
      onProcessRowUpdateError={handleProcessRowUpdateError}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStart={handleRowEditStart}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={processRowUpdate}
      rowSelection={false}
    ></StyledDataGrid>
  );
};

export default ActivityTrackGrid;
