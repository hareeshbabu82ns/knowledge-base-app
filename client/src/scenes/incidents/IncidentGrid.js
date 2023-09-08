import React, { useState } from 'react';
import StyledDataGrid from 'components/StyledDataGrid';
import { GridActionsCellItem, GridRowModes } from '@mui/x-data-grid';
import {
  useAddIncidentMutation,
  useDeleteIncidentMutation,
  useGetIncidentsQuery,
  useUpdateIncidentMutation,
} from 'state/incidentSlice';
import { Checkbox, Chip, Stack, Typography, debounce } from '@mui/material';

import StartIcon from '@mui/icons-material/PlayArrowOutlined';
import StopIcon from '@mui/icons-material/StopOutlined';
import EditIcon from '@mui/icons-material/EditOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';

import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import IncidentGridToolbar from './IncidentGridToolbar';
import { useNavigate } from 'react-router-dom';
import { DateTime } from 'luxon';

const IncidentGrid = () => {
  const [search, setSearch] = useState('');
  const [rowModesModel, setRowModesModel] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState({});
  const [filters, setFilters] = useState([]);
  const navigate = useNavigate();

  const {
    data: incidents,
    isLoading,
    refetch,
  } = useGetIncidentsQuery({ pageSize, offset: page * pageSize, sort, filters, search });

  const [addIncidentMutation] = useAddIncidentMutation();
  const [updateIncident] = useUpdateIncidentMutation();
  const [deleteIncident] = useDeleteIncidentMutation();

  const handleOnNewClicked = () => {
    navigate('/incidents/new');
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
    updateIncident({ id: newRow['_id'], data: { description: newRow.description } });
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
    await deleteIncident(id);
  };

  const handleAddIncident = async (description) => {
    // console.log('Adding Incident');
    const data = {
      description,
    };
    // console.log(data, user);
    return addIncidentMutation(data);
  };

  const columns = [
    {
      field: '_id',
      headerName: 'ID',
      flex: 1,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      editable: true,
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      renderCell: ({ value }) => {
        return (
          <Stack direction="row" spacing={1}>
            {value.map((v, idx) => (
              <Chip
                key={`${v}_${idx}`}
                label={<Typography variant="body2">{v}</Typography>}
                variant="outlined"
              />
            ))}
          </Stack>
        );
      },
    },
    {
      field: 'updatedAt',
      headerName: 'Updated At',
      width: 150,
      valueFormatter: ({ value }) => DateTime.fromISO(value).toFormat('MMM dd yyyy HH:mm'),
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
      rows={incidents?.data || []}
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
      rowHeight={72}
      rowCount={incidents?.total || 0}
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
      slots={{ toolbar: IncidentGridToolbar }}
      slotProps={{
        toolbar: {
          onRefetch: refetch,
          onAddIncident: handleAddIncident,
          onNewClicked: handleOnNewClicked,
          onSearch: debounce(setSearch, 500),
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

export default IncidentGrid;
