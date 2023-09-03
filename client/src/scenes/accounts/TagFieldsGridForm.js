import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  useGridApiContext,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';
import { v4 as uuidV4 } from 'uuid';
import { MenuItem, Select, Typography, Stack, Chip } from '@mui/material';
import { COMPARISION_OPS_EQ, EXPENSE_IGNORE_FIELDS, COMPARISION_OPS } from 'constants';

const initialRows = [
  {
    id: uuidV4(),
    name: 'description',
    comparision: COMPARISION_OPS_EQ,
    value: '',
    tags: [],
  },
];

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = uuidV4();
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        name: '',
        comparision: COMPARISION_OPS_EQ,
        value: '',
        tags: [],
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Typography variant="h3" color="secondary">
        Tag Fields
      </Typography>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add Tag
      </Button>
      <Box flexGrow={1} />
      <GridToolbarQuickFilter />
    </GridToolbarContainer>
  );
}

function TagFieldComparisionSelectEditInputCell({ id, value, field }) {
  const apiRef = useGridApiContext();

  const handleChange = async (event) => {
    await apiRef.current.setEditCellValue({
      id,
      field,
      value: event.target.value,
    });
    apiRef.current.stopCellEditMode({ id, field });
  };

  return (
    <Select
      size="small"
      fullWidth
      value={value}
      onChange={handleChange}
      sx={{ height: 1 }}
      autoFocus
    >
      {COMPARISION_OPS.map((t) => (
        <MenuItem key={t} value={t}>
          {t}
        </MenuItem>
      ))}
    </Select>
  );
}
function ExpenseTagFieldSelectEditInputCell({ id, value, field }) {
  const apiRef = useGridApiContext();

  const handleChange = async (event) => {
    await apiRef.current.setEditCellValue({
      id,
      field,
      value: event.target.value,
    });
    apiRef.current.stopCellEditMode({ id, field });
  };

  return (
    <Select
      size="small"
      fullWidth
      value={value}
      onChange={handleChange}
      sx={{ height: 1 }}
      autoFocus
    >
      {EXPENSE_IGNORE_FIELDS.map((t) => (
        <MenuItem key={t} value={t}>
          {t}
        </MenuItem>
      ))}
    </Select>
  );
}

export default function TagFieldsGridForm({ fields, onConfigUpdated }) {
  const [rows, setRows] = React.useState(fields || initialRows);
  const [rowModesModel, setRowModesModel] = React.useState({});

  const handleRowEditStart = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleRowEditStop = (params, event) => {
    event.defaultMuiPrevented = true;
  };

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    const finalRows = rows.filter((row) => row.id !== id);
    setRows(finalRows);
    if (onConfigUpdated) onConfigUpdated({ rows: finalRows });
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = (newRow) => {
    const updatedRow = {
      ...newRow,
      tags: newRow.tags.split(','),
      isNew: false,
    };
    const finalRows = rows.map((row) => (row.id === newRow.id ? updatedRow : row));
    setRows(finalRows);
    if (onConfigUpdated) onConfigUpdated({ rows: finalRows });
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 180,
      editable: true,
      renderEditCell: (props) => <ExpenseTagFieldSelectEditInputCell {...props} />,
    },
    {
      field: 'comparision',
      headerName: 'Comparision',
      editable: true,
      sortable: false,
      renderEditCell: (props) => <TagFieldComparisionSelectEditInputCell {...props} />,
    },
    {
      field: 'value',
      headerName: 'Value',
      flex: 1,
      editable: true,
      sortable: false,
    },
    {
      field: 'tags',
      headerName: 'Tags',
      flex: 1,
      editable: true,
      sortable: false,
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
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem icon={<SaveIcon />} label="Save" onClick={handleSaveClick(id)} />,
            <GridActionsCellItem
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
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
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
    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStart={handleRowEditStart}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
      />
    </Box>
  );
}
