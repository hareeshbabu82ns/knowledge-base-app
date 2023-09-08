import {
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Pagination,
  Stack,
  TablePagination,
  Typography,
  debounce,
} from '@mui/material';
import Panel from 'components/Panel';
import { DateTime } from 'luxon';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetIncidentsQuery } from 'state/incidentSlice';
import NewIcon from '@mui/icons-material/AddBoxOutlined';
import IncidentGridToolbar from './IncidentGridToolbar';
import IncidentListToolbar from './IncidentListToolbar';

const IncidentList = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sort, setSort] = useState({});
  const [filters, setFilters] = useState([]);
  const navigate = useNavigate();

  const {
    data: incidents,
    isLoading,
    isFetching,
    refetch,
  } = useGetIncidentsQuery({ pageSize, page, sort, filters, search });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOnNewClicked = () => {
    navigate('/incidents/new');
  };

  return (
    <Panel
      title={
        <IncidentListToolbar
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
          count={incidents?.total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={pageSize}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      }
    >
      <List>
        {incidents?.data.map((i) => (
          <IncidentListItem key={i._id} data={i} onClick={() => navigate(i._id)} />
        ))}
      </List>
    </Panel>
  );
};

const IncidentListItem = ({ data, onClick }) => {
  return (
    <ListItem onClick={onClick} disablePadding>
      <Stack>
        <ListItemText
          primary={<Typography variant="h5">{data.description}</Typography>}
          secondary={DateTime.fromISO(data.updatedAt).toFormat('MMM dd yyyy HH:mm')}
        ></ListItemText>
        <ListItemText>
          <TagChips tags={data.tags} />
        </ListItemText>
      </Stack>
    </ListItem>
  );
};

const TagChips = ({ tags }) => {
  return (
    <Stack direction="row" spacing={1}>
      {tags.map((v, idx) => (
        <Chip key={`${v}_${idx}`} size="small" label={v} variant="outlined" />
      ))}
    </Stack>
  );
};
export default IncidentList;
