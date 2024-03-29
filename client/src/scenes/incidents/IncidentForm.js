import { useNavigate, useParams } from 'react-router-dom';
import {
  useAddIncidentMutation,
  useDeleteIncidentMutation,
  useGetIncidentQuery,
  useUpdateIncidentMutation,
} from 'state/incidentSlice';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import BackIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import React, { useEffect, useState } from 'react';
import { Button, FormControlLabel, IconButton, Stack, Switch, Tooltip } from '@mui/material';
import { toast } from 'react-toastify';
import Panel from '../../components/Panel';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { useFormik } from 'formik';
import IncidentTagsSelect from './IncidentTagsSelect';
import { useSelector } from 'react-redux';
import { encryptionKeySelector } from 'state';
import { decryptData, encryptData } from 'utils';
import MarkDownTextArea from 'components/forms/theme-elements/MarkDownTextArea';

const initIncident = {
  description: '',
  userId: '',
  tags: '',
  isEncrypted: false,
};

const IncidentForm = () => {
  const { id } = useParams();
  const [incident, setIncident] = useState(initIncident);
  const navigate = useNavigate();
  const encKey = useSelector(encryptionKeySelector);

  const [addIncidentMutation] = useAddIncidentMutation();
  const [updateIncident] = useUpdateIncidentMutation();
  const [deleteIncident] = useDeleteIncidentMutation();

  const { data, isLoading, isFetching, refetch } = useGetIncidentQuery(id, {
    skip: id === 'new',
  });

  useEffect(() => {
    // console.log(data, encKey);
    const res = data
      ? {
          ...data,
        }
      : initIncident;
    try {
      if (encKey === '') toast.error('Empty Encryption Key');
      else {
        res.description = data?.isEncrypted
          ? decryptData({ key: encKey, data: data?.description })
          : data?.description;
        // console.log(data?.description, description);
      }
    } catch (ex) {
      toast.error('Decryption failed');
    }
    setIncident(res);
  }, [data]);

  const processAdd = async ({ description, isEncrypted, tags }, { setSubmitting }) => {
    // console.log('Adding Incident');
    const encDesc = isEncrypted ? encryptData({ key: encKey, data: description }) : description;
    console.log('Adding Incident', description, encDesc);
    const data = {
      description: encDesc,
      isEncrypted,
      tags: tags.split(','),
    };
    // console.log(data, user);
    try {
      const { data: res } = await addIncidentMutation(data);
      // console.log(res);
      toast('Incident updated');
      navigate(`/incidents/${res.id}`, { replace: true });
      return res;
    } catch (ex) {
      toast(ex, { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const processUpdate = async ({ _id: id, description, isEncrypted, tags }, { setSubmitting }) => {
    // console.log(tags);
    const encDesc = isEncrypted ? encryptData({ key: encKey, data: description }) : description;
    const res = await updateIncident({
      id,
      data: { description: encDesc, isEncrypted, tags },
    });
    // console.log(res);
    if (res.error) {
      toast(res.error.data.message, { type: 'error' });
    } else {
      toast('Incident updated');
    }
    setSubmitting(false);
    return res;
  };

  const processDelete = async (id, { setSubmitting }) => {
    setSubmitting(true);
    const res = await deleteIncident(id);
    // console.log(res);
    if (res.error) {
      toast(res.error.data.message, { type: 'error' });
    } else {
      toast('Incident deleted');
      navigate(-1);
    }
    setSubmitting(false);
    return res;
  };

  const validate = (values) => {
    const errors = {};
    if (!values.description) {
      errors.description = 'Required';
      return errors;
    }
  };

  const onSubmit = (values, { setSubmitting }) =>
    id === 'new' ? processAdd(values, { setSubmitting }) : processUpdate(values, { setSubmitting });

  const { submitForm, isSubmitting, setSubmitting, handleChange, handleSubmit, values } = useFormik(
    {
      initialValues: { ...incident },
      enableReinitialize: true,
      validate,
      onSubmit,
    },
  );

  const toolbarActions = (
    <React.Fragment>
      <IconButton disabled={isLoading || isFetching} onClick={id === 'new' ? undefined : refetch}>
        <RefreshIcon />
      </IconButton>
    </React.Fragment>
  );

  const backAction = (
    <IconButton disabled={isLoading || isFetching} onClick={() => navigate(-1)}>
      <BackIcon />
    </IconButton>
  );

  const actionsRight = (
    <Stack direction={'row'} gap={1}>
      <Button
        variant="contained"
        color="primary"
        disabled={isSubmitting}
        onClick={submitForm}
        startIcon={<SaveIcon />}
      >
        Save
      </Button>
      <Button
        variant="contained"
        color="warning"
        disabled={id === 'new' || isSubmitting}
        onClick={() => processDelete(id, { setSubmitting })}
        startIcon={<DeleteIcon />}
      >
        Delete
      </Button>
    </Stack>
  );

  return (
    <Panel
      title={`IncidentForm ${id}`}
      loading={isLoading || isFetching}
      titleIcon={backAction}
      toolbarActions={toolbarActions}
      actionsRight={actionsRight}
    >
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2}>
          <Grid2 xs={4} sm={2}>
            <Tooltip title="Encrypt Content">
              <FormControlLabel
                label={<LockIcon />}
                labelPlacement="start"
                control={
                  <Switch
                    name="isEncrypted"
                    id="isEncrypted"
                    checked={values.isEncrypted}
                    onChange={handleChange}
                  />
                }
              />
            </Tooltip>
          </Grid2>
          <Grid2 xs={8} sm={10}>
            <IncidentTagsSelect
              size="small"
              freeSolo
              value={values.tags}
              onChange={(value) =>
                handleChange({
                  target: {
                    name: 'tags',
                    value: Array.isArray(value) ? value.join(',') : value,
                  },
                })
              }
            />
          </Grid2>

          <Grid2 xs={12}>
            <MarkDownTextArea
              id="description"
              name="description"
              label="Content"
              minRows={15}
              maxRows={15}
              onChange={handleChange}
              value={values.description}
            />
          </Grid2>
          {/* <Grid2 xs={12}>
            <pre>{JSON.stringify(incident, null, "\t")}</pre>
          </Grid2> */}
        </Grid2>
      </form>
    </Panel>
  );
};

export default IncidentForm;

// import { useNavigate, useParams } from "react-router-dom";
// import {
//   addIncidentApi,
//   useAddIncidentMutation,
//   useDeleteIncidentMutation,
//   useGetIncidentQuery,
//   useUpdateIncidentMutation,
// } from "../../state/incidentsApi";
// import RefreshIcon from "@mui/icons-material/RefreshOutlined";
// import BackIcon from "@mui/icons-material/ArrowBackOutlined";
// import SaveIcon from "@mui/icons-material/SaveOutlined";
// import DeleteIcon from "@mui/icons-material/DeleteOutlined";
// import React, { useEffect, useState } from "react";
// import { Field, Form, Formik } from "formik";
// import { Switch, TextField } from "formik-mui";
// import { Button, IconButton, Stack } from "@mui/material";
// import { useDispatch } from "react-redux";
// import { toast } from "react-toastify";
// import Panel from "../../components/Panel";
// import Grid2 from "@mui/material/Unstable_Grid2/Grid2";

// const initIncident = {
//   description: "",
//   tags: false,
//   userId: "",
// };

// const IncidentForm = () => {
//   const { id } = useParams();
//   const [incident, setIncident] = useState(initIncident);
//   const navigate = useNavigate();

//   const dispatch = useDispatch();

//   const [addIncidentMutation] = useAddIncidentMutation();
//   const [updateIncident] = useUpdateIncidentMutation();
//   const [deleteIncident] = useDeleteIncidentMutation();

//   const { data, isLoading, isFetching, refetch } = useGetIncidentQuery(id, {
//     skip: id === "new",
//   });

//   useEffect(() => {
//     // console.log(data);
//     setIncident(data || initIncident);
//   }, [data]);

//   const processAdd = async ({ description }, { setSubmitting }) => {
//     // console.log('Adding Incident');
//     const data = {
//       description,
//       tags: false,
//     };
//     // console.log(data, user);
//     const { payload } = await dispatch(addIncidentApi({ data, addIncidentMutation }));
//     console.log(payload);
//     if (payload.error) {
//       toast(payload.error.data.message, { type: "error" });
//     } else {
//       toast("Incident updated");
//     }
//     setSubmitting(false);
//     navigate(`/incidents/${payload.data.$id}`, { replace: true });
//     return payload.data;
//   };

//   const processUpdate = async (
//     { $id: id, description, tags },
//     { setSubmitting }
//   ) => {
//     const res = await updateIncident({
//       id,
//       data: { description, tags },
//     });
//     // console.log(res);
//     if (res.error) {
//       toast(res.error.data.message, { type: "error" });
//     } else {
//       toast("Incident updated");
//     }
//     setSubmitting(false);
//     return res;
//   };

//   const processDelete = async (id, { setSubmitting }) => {
//     setSubmitting(true);
//     const res = await deleteIncident(id);
//     // console.log(res);
//     if (res.error) {
//       toast(res.error.data.message, { type: "error" });
//     } else {
//       toast("Incident deleted");
//       navigate(-1);
//     }
//     setSubmitting(false);
//     return res;
//   };

//   const toolbarActions = (
//     <React.Fragment>
//       <IconButton
//         disabled={isLoading || isFetching}
//         onClick={id === "new" ? undefined : refetch}
//       >
//         <RefreshIcon />
//       </IconButton>
//     </React.Fragment>
//   );

//   const backAction = (
//     <IconButton disabled={isLoading || isFetching} onClick={() => navigate(-1)}>
//       <BackIcon />
//     </IconButton>
//   );

//   return (
//     <Formik
//       enableReinitialize
//       initialValues={incident}
//       validate={(values) => {
//         const errors = {};
//         if (!values.description) {
//           errors.description = "Required";
//           return errors;
//         }
//       }}
//       onSubmit={(values, { setSubmitting }) =>
//         id === "new"
//           ? processAdd(values, { setSubmitting })
//           : processUpdate(values, { setSubmitting })
//       }
//     >
//       {({ submitForm, isSubmitting, setSubmitting }) => {
//         const actionsRight = (
//           <Stack direction={"row"} gap={1}>
//             <Button
//               variant="contained"
//               color="primary"
//               disabled={isSubmitting}
//               onClick={submitForm}
//               startIcon={<SaveIcon />}
//             >
//               Save
//             </Button>
//             <Button
//               variant="contained"
//               color="warning"
//               disabled={id === "new" || isSubmitting}
//               onClick={() => processDelete(id, { setSubmitting })}
//               startIcon={<DeleteIcon />}
//             >
//               Delete
//             </Button>
//           </Stack>
//         );
//         return (
//           <Panel
//             title={`IncidentForm ${id}`}
//             loading={isLoading || isFetching}
//             titleIcon={backAction}
//             toolbarActions={toolbarActions}
//             actionsRight={actionsRight}
//           >
//             <Form>
//               <Grid2 container>
//                 <Grid2>
//                   <Field
//                     component={TextField}
//                     name="description"
//                     type="text"
//                     label="Content"
//                   />
//                 </Grid2>

//                 <Grid2>
//                   <Field
//                     component={Switch}
//                     name="tags"
//                     type="checkbox"
//                     label="Complete"
//                   />
//                 </Grid2>
//                 <Grid2 xs={12}>
//                   <pre>{JSON.stringify(incident, null, "\t")}</pre>
//                 </Grid2>
//               </Grid2>
//             </Form>
//           </Panel>
//         );
//       }}
//     </Formik>
//   );
// };

// export default IncidentForm;
