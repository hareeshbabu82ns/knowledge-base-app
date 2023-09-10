import React, { useState } from 'react';
import StyledDataGrid from 'components/StyledDataGrid';
import { useGetActivitiesQuery, useUpdateActivityMutation } from 'state/activitySlice';
import { Checkbox, debounce } from '@mui/material';

import ActivityGridToolbar from './ActivityGridToolbar';
import { useNavigate } from 'react-router-dom';
import TimerWidget from 'components/TimerWidget';
import { diffInSeconds } from 'utils';

const ActivityGrid = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState({});
  const [filters, setFilters] = useState([]);
  const navigate = useNavigate();

  const {
    data: activities,
    isLoading,
    refetch,
  } = useGetActivitiesQuery({ pageSize, offset: page * pageSize, sort, filters, search });

  const [updateActivity] = useUpdateActivityMutation();

  const handleOnNewClicked = () => {
    navigate('/activities/new');
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
      valueGetter: ({ value }) => value.replaceAll(/[\s\\*#`()\][]/gi, ' '),
    },
    {
      field: 'runtime',
      headerName: 'Runtime',
      width: 130,
      editable: false,
      // valueGetter: ({ value }) => formatDuration({ seconds: value }),
      renderCell: ({ value, row }) => {
        // console.log(value, row.startedAt);
        const diff = value + (row?.isRunning ? diffInSeconds({ dateStart: row.startedAt }) : 0);
        return (
          <TimerWidget
            running={row.isRunning}
            runtime={diff}
            onStart={() => updateActivity({ id: row._id, data: { isRunning: true } })}
            onStop={() => updateActivity({ id: row._id, data: { isRunning: false } })}
          />
        );
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
          onNewClicked: handleOnNewClicked,
          onSearch: debounce(setSearch, 500),
        },
      }}
      editMode="row"
      onRowDoubleClick={({ id }) => navigate(id)}
      rowSelection={false}
    ></StyledDataGrid>
  );
};

export default ActivityGrid;
