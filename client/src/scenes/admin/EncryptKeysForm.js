import Panel from 'components/Panel';
import React, { useEffect } from 'react';
import { IconButton, TextField } from '@mui/material';

import LockIcon from '@mui/icons-material/LockOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import GenerateIcon from '@mui/icons-material/AutorenewOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { encryptionKeySelector, setEncryption } from 'state';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { generateEncryptionKey } from 'utils';

const EncryptKeysForm = () => {
  const dispatch = useDispatch();
  const encKey = useSelector(encryptionKeySelector);

  const [formData, setFormData] = React.useState({ encKey: '' });

  useEffect(() => {
    setFormData({ encKey });
  }, [encKey]);

  const onInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const genKey = async () => {
    console.log('generating key...');
    const key = await generateEncryptionKey();

    console.log(key);
    dispatch(setEncryption(key));
  };
  const handleSubmit = () => {
    dispatch(setEncryption(formData.encKey));
  };

  const toolbarActions = (
    <React.Fragment>
      <IconButton onClick={handleSubmit}>
        <SaveIcon />
      </IconButton>
      <IconButton onClick={genKey}>
        <GenerateIcon />
      </IconButton>
    </React.Fragment>
  );

  return (
    <Panel title={`Encryption Keys`} titleIcon={<LockIcon />} toolbarActions={toolbarActions}>
      <form onSubmit={(e) => e.preventDefault()}>
        <Grid2 container spacing={2}>
          <Grid2 xs={12}>
            <TextField
              name="encKey"
              required
              fullWidth
              id="encKey"
              label="Key"
              autoFocus
              value={formData.encKey}
              onChange={onInputChange}
              size="small"
            />
          </Grid2>
        </Grid2>
      </form>
    </Panel>
  );
};

export default EncryptKeysForm;
