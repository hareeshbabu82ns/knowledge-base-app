import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TablePagination,
  Typography,
  debounce,
} from '@mui/material';
import Panel from 'components/Panel';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetActivitiesQuery, useUpdateActivityMutation } from 'state/activitySlice';
import ActivityListToolbar from './ActivityListToolbar';
import TimerWidget from 'components/TimerWidget';
import { diffInSeconds } from 'utils';

const ActivityList = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const navigate = useNavigate();

  const [updateActivity] = useUpdateActivityMutation();

  const {
    data: activities,
    isLoading,
    isFetching,
    refetch,
  } = useGetActivitiesQuery({ pageSize, page, search });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOnNewClicked = () => {
    navigate('/activities/new');
  };

  return (
    <Panel
      title={
        <ActivityListToolbar
          onNewClicked={handleOnNewClicked}
          searchStr={search}
          onSearch={debounce(setSearch, 500)}
          onRefetch={refetch}
        />
      }
      sx={{ border: 0 }}
      loading={isLoading || isFetching}
      actionsRight={
        <TablePagination
          component="div"
          labelRowsPerPage=""
          count={activities?.total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      }
    >
      <List>
        {activities?.data.map((i) => (
          <ActivityListItem
            key={i._id}
            data={i}
            onClick={() => navigate(i._id)}
            onStart={() => updateActivity({ id: i._id, data: { isRunning: true } })}
            onStop={() => updateActivity({ id: i._id, data: { isRunning: false } })}
          />
        ))}
      </List>
    </Panel>
  );
};

const ActivityListItem = ({ data, onClick, onStart, onStop }) => {
  const diff =
    data?.runtime + (data?.isRunning ? diffInSeconds({ dateStart: data?.startedAt }) : 0);
  return (
    <ListItem
      disablePadding
      disableGutters
      secondaryAction={
        <TimerWidget running={data.isRunning} runtime={diff} onStop={onStop} onStart={onStart} />
      }
    >
      <Stack>
        <ListItemButton role={undefined} onClick={onClick} disableGutters>
          <ListItemText
            primary={
              <Typography variant="h5" color={data.isExclusive ? 'secondary' : 'inherit'}>
                {data.description}
              </Typography>
            }
            secondary={DateTime.fromISO(data.updatedAt).toFormat('MMM dd yyyy HH:mm')}
          ></ListItemText>
        </ListItemButton>
      </Stack>
    </ListItem>
  );
};

export default ActivityList;
