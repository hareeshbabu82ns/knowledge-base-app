import { Box } from '@mui/material';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { CustomTextarea } from './CustomTextArea';
import MuiMarkdown from 'mui-markdown';

const MarkDownTextArea = ({ value, onChange, id, boxSx, ...rest }) => {
  const [textValue, setTextValue] = React.useState(value);

  useEffect(() => {
    setTextValue(value);
  }, [value]);

  const handleValueChange = (e) => {
    setTextValue(e.target.value);
    onChange(e);
  };

  const [tabIdx, setTabIdx] = React.useState(0);

  const handleTabIndexChange = (event, newTabIdx) => {
    setTabIdx(newTabIdx);
  };

  return (
    <Box sx={{ width: '100%', ...boxSx }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIdx} onChange={handleTabIndexChange} aria-label={`${id} tabs`}>
          <Tab label="Editor" {...a11yProps(id, 0)} />
          <Tab label="Preview" {...a11yProps(id, 1)} />
        </Tabs>
      </Box>
      <CustomTabPanel value={tabIdx} index={0}>
        <CustomTextarea {...rest} id={id} onChange={handleValueChange} value={textValue} />
      </CustomTabPanel>
      <CustomTabPanel value={tabIdx} index={1} id={id}>
        <Box
          sx={{
            border: (theme) => `1px solid ${theme.palette.grey[400]}`,
            borderRadius: 1,
            p: 1,
            height: 340,
            overflowY: 'scroll',
          }}
        >
          <MuiMarkdown>{textValue}</MuiMarkdown>
        </Box>
      </CustomTabPanel>
    </Box>
  );
};

export default MarkDownTextArea;

function CustomTabPanel(props) {
  const { id, children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${id}-tabpanel-${index}`}
      aria-labelledby={`${id}-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(id, index) {
  return {
    id: `${id}-tab-${index}`,
    'aria-controls': `${id}-tabpanel-${index}`,
  };
}
