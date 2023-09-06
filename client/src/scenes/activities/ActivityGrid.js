import React, { useState } from 'react';
import StyledDataGrid from 'components/StyledDataGrid';
import { GridActionsCellItem, GridRowModes } from '@mui/x-data-grid';
import {
  useAddActivityMutation,
  useDeleteActivityMutation,
  useGetActivitiesQuery,
  useUpdateActivityMutation,
} from 'state/activitySlice';
import { Checkbox } from '@mui/material';

import StartIcon from '@mui/icons-material/PlayArrowOutlined';
import StopIcon from '@mui/icons-material/StopOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import ActivityGridToolbar from './ActivityGridToolbar';
import { useNavigate } from 'react-router-dom';
import { Duration } from 'luxon';
import TimerWidget from 'components/TimerWidget';
import { diffInSeconds } from 'utils';

const ActivityGrid = () => {
  const [rowModesModel, setRowModesModel] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState({});
  const [filters, setFilters] = useState([]);
  const navigate = useNavigate();

  const {
    data: activities,
    isLoading,
    refetch,
  } = useGetActivitiesQuery({ pageSize, offset: page * pageSize, sort, filters });

  const [addActivityMutation] = useAddActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const [deleteActivity] = useDeleteActivityMutation();

  const handleOnNewClicked = () => {
    navigate('/activities/new');
  };
  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false };
    updateActivity({ id: newRow['_id'], data: { description: newRow.description } });
    return updatedRow;
  };

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

  const handleDeleteClick = (id) => async () => {
    // console.log( id )
    await deleteActivity(id);
  };

  const handleAddActivity = async (description) => {
    // console.log('Adding Activity');
    const data = {
      description,
      isExclusive: false,
    };
    // console.log(data, user);
    return addActivityMutation(data);
  };

  const columns = [
    {
      field: '_id',
      headerName: 'ID',
      flex: 1,
    },
    {
      field: 'isExclusive',
      headerName: 'Exclusive',
      width: 100,
      renderCell: ({ value, row }) => {
        return (
          <Checkbox
            checked={value}
            onChange={(_, checked) =>
              updateActivity({ id: row['_id'], data: { isExclusive: checked } })
            }
          />
        );
      },
    },
    {
      field: 'isRunning',
      headerName: 'Running',
      width: 100,
      renderCell: ({ value, row }) => {
        return (
          <Checkbox
            checked={value}
            onChange={(_, checked) =>
              updateActivity({ id: row['_id'], data: { isRunning: checked } })
            }
          />
        );
      },
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      editable: true,
    },
    {
      field: 'runtime',
      headerName: 'Runtime',
      width: 100,
      editable: false,
      // valueGetter: ({ value }) => formatDuration({ seconds: value }),
      renderCell: ({ value, row }) => {
        // console.log(value, row.startedAt);
        const diff = value + (row?.isRunning ? diffInSeconds({ dateStart: row.startedAt }) : 0);
        return <TimerWidget running={row.isRunning} runtime={diff} />;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: ({ id, row: { isRunning } }) => {
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
          !isRunning ? (
            <GridActionsCellItem
              key={`start_${id}`}
              icon={<StartIcon />}
              label="Start"
              className="textPrimary"
              onClick={() => updateActivity({ id, data: { isRunning: true } })}
              color="inherit"
            />
          ) : (
            <React.Fragment />
          ),
          isRunning ? (
            <GridActionsCellItem
              key={`stop_${id}`}
              icon={<StopIcon />}
              label="Stop"
              className="textPrimary"
              onClick={() => updateActivity({ id, data: { isRunning: false } })}
              color="inherit"
            />
          ) : (
            <React.Fragment />
          ),
          <GridActionsCellItem
            key={`edit_${id}`}
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
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
      loading={isLoading}
      rows={activities?.data || []}
      columns={columns}
      getRowId={(row) => row['_id']}
      pagination
      page={page}
      sx={{ height: '80vh' }}
      initialState={{
        pagination: {
          paginationModel: { pageSize, page },
        },
        columns: {
          columnVisibilityModel: {
            _id: false,
            isRunning: false,
          },
        },
      }}
      rowCount={activities?.total || 0}
      paginationMode="server"
      sortingMode="server"
      filterMode="server"
      onPaginationModelChange={(m) => {
        if (page !== m.page) setPage(m.page);
        if (pageSize !== m.pageSize) setPageSize(m.pageSize);
      }}
      onSortModelChange={(m) => {
        setSort(m[0]);
      }}
      onFilterModelChange={(newFilterModel) => {
        // console.log(newFilterModel);
        setFilters(newFilterModel.items);
      }}
      slots={{ toolbar: ActivityGridToolbar }}
      slotProps={{
        toolbar: {
          onRefetch: refetch,
          onAddActivity: handleAddActivity,
          onNewClicked: handleOnNewClicked,
        },
      }}
      editMode="row"
      rowModesModel={rowModesModel}
      onRowModesModelChange={handleRowModesModelChange}
      onRowEditStart={handleRowEditStart}
      onRowEditStop={handleRowEditStop}
      processRowUpdate={processRowUpdate}
      onRowDoubleClick={({ id }) => navigate(id)}
    ></StyledDataGrid>
  );
};

export default ActivityGrid;
