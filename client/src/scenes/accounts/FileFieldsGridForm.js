import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Close";
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  useGridApiContext,
} from "@mui/x-data-grid";
import { v4 as uuidV4 } from "uuid";
import { MenuItem, Select, Typography } from "@mui/material";
import { ACCOUNT_CONFIG_FIELD_TYPES } from "constants";

const initialRows = [
  {
    id: uuidV4(),
    name: "fieldName",
    format: "",
    ignore: false,
    negated: false,
    timeColumnIndex: 0,
    type: "",
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
        name: "",
        format: "",
        ignore: false,
        negated: false,
        timeColumnIndex: 0,
        type: "",
        isNew: true,
      },
    ]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: "name" },
    }));
  };

  return (
    <GridToolbarContainer>
      <Typography variant="h3" color="secondary">
        Input File Fields
      </Typography>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add Field
      </Button>
    </GridToolbarContainer>
  );
}

function SelectEditInputCell({ id, value, field }) {
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
      {ACCOUNT_CONFIG_FIELD_TYPES.map((t) => (
        <MenuItem key={t} value={t}>
          {t}
        </MenuItem>
      ))}
    </Select>
  );
}

export default function FileFieldsGridForm({ fileFields, onConfigUpdated }) {
  const [rows, setRows] = React.useState(fileFields || initialRows);
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
    const updatedRow = { ...newRow, isNew: false };
    const finalRows = rows.map((row) =>
      row.id === newRow.id ? updatedRow : row
    );
    setRows(finalRows);
    if (onConfigUpdated) onConfigUpdated({ rows: finalRows });
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    { field: "name", headerName: "Name", width: 180, editable: true },
    {
      field: "type",
      headerName: "Type",
      editable: true,
      renderEditCell: (props) => <SelectEditInputCell {...props} />,
    },
    {
      field: "format",
      headerName: "Format",
      width: 120,
      editable: true,
      sortable: false,
    },
    {
      field: "ignore",
      headerName: "Ignore",
      type: "boolean",
      editable: true,
      sortable: false,
    },
    {
      field: "negated",
      headerName: "Negated",
      type: "boolean",
      editable: true,
      sortable: false,
    },
    {
      field: "timeColumnIndex",
      headerName: "Time Column Index",
      type: "number",
      editable: true,
      sortable: false,
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      cellClassName: "actions",
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              onClick={handleSaveClick(id)}
            />,
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
        width: "100%",
        "& .actions": {
          color: "text.secondary",
        },
        "& .textPrimary": {
          color: "text.primary",
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
