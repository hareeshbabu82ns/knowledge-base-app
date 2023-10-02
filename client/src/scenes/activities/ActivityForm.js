import { useNavigate, useParams } from 'react-router-dom';
import {
  useAddActivityMutation,
  useDeleteActivityMutation,
  useGetActivityQuery,
  useUpdateActivityMutation,
} from 'state/activitySlice';
import RefreshIcon from '@mui/icons-material/RefreshOutlined';
import BackIcon from '@mui/icons-material/ArrowBackOutlined';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import React, { useEffect, useState } from 'react';
import { Button, FormControlLabel, IconButton, Stack, Switch } from '@mui/material';
import { toast } from 'react-toastify';
import Panel from '../../components/Panel';
import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { useFormik } from 'formik';
import ActivityTrackGrid from './ActivityTrackGrid';
import TimerWidget from 'components/TimerWidget';
import { diffInSeconds } from 'utils';
import MarkDownTextArea from 'components/forms/theme-elements/MarkDownTextArea';

const initActivity = {
  description: '',
  isExclusive: false,
  userId: '',
  runtime: 0,
  startedAt: '',
};

const ActivityForm = () => {
  const { id } = useParams();
  const [activity, setActivity] = useState(initActivity);
  const navigate = useNavigate();

  const [addActivityMutation] = useAddActivityMutation();
  const [updateActivity] = useUpdateActivityMutation();
  const [deleteActivity] = useDeleteActivityMutation();

  const { data, isLoading, isFetching, refetch } = useGetActivityQuery(id, {
    skip: id === 'new',
  });

  useEffect(() => {
    // console.log(data);
    setActivity(data || initActivity);
  }, [data]);

  const processAdd = async ({ description, isExclusive }, { setSubmitting }) => {
    // console.log('Adding Activity');
    const data = {
      description,
      isExclusive,
    };
    // console.log(data, user);
    try {
      const { data: res } = await addActivityMutation(data);
      // console.log(res);
      toast('Activity updated');
      navigate(`/activities/${res.id}`, { replace: true });
      return res;
    } catch (ex) {
      toast(ex, { type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const processUpdate = async ({ _id: id, description, isExclusive }, { setSubmitting }) => {
    const res = await updateActivity({
      id,
      data: { description, isExclusive },
    });
    // console.log(res);
    if (res.error) {
      toast(res.error.data.message, { type: 'error' });
    } else {
      toast('Activity updated');
    }
    setSubmitting(false);
    return res;
  };

  const processDelete = async (id, { setSubmitting }) => {
    setSubmitting(true);
    const res = await deleteActivity(id);
    // console.log(res);
    if (res.error) {
      toast(res.error.data.message, { type: 'error' });
    } else {
      toast('Activity deleted');
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
      initialValues: { ...activity },
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
      title={`ActivityForm ${id}`}
      loading={isLoading || isFetching}
      titleIcon={backAction}
      toolbarActions={toolbarActions}
      actionsRight={actionsRight}
    >
      <form onSubmit={handleSubmit}>
        <Grid2 container spacing={2}>
          <Grid2 xs={6}>
            <FormControlLabel
              label="Exclusive"
              labelPlacement="start"
              control={
                <Switch
                  name="isExclusive"
                  id="isExclusive"
                  checked={values.isExclusive}
                  onChange={handleChange}
                />
              }
            />
          </Grid2>

          <Grid2 xs={6}>
            {id !== 'new' && (
              <TimerWidget
                running={values.isRunning}
                runtime={
                  values?.runtime +
                  (values?.isRunning ? diffInSeconds({ dateStart: values?.startedAt }) : 0)
                }
                onStart={() => updateActivity({ id: id, data: { isRunning: true } })}
                onStop={() => updateActivity({ id: id, data: { isRunning: false } })}
              />
            )}
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

          <Grid2 xs={12}>
            <ActivityTrackGrid activityRefetch={refetch} />
          </Grid2>
          {/* <Grid2 xs={12}>
            <pre>{JSON.stringify(activity, null, "\t")}</pre>
          </Grid2> */}
        </Grid2>
      </form>
    </Panel>
  );
};

export default ActivityForm;

// import { useNavigate, useParams } from "react-router-dom";
// import {
//   addActivityApi,
//   useAddActivityMutation,
//   useDeleteActivityMutation,
//   useGetActivityQuery,
//   useUpdateActivityMutation,
// } from "../../state/activitiesApi";
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

// const initActivity = {
//   description: "",
//   isExclusive: false,
//   userId: "",
// };

// const ActivityForm = () => {
//   const { id } = useParams();
//   const [activity, setActivity] = useState(initActivity);
//   const navigate = useNavigate();

//   const dispatch = useDispatch();

//   const [addActivityMutation] = useAddActivityMutation();
//   const [updateActivity] = useUpdateActivityMutation();
//   const [deleteActivity] = useDeleteActivityMutation();

//   const { data, isLoading, isFetching, refetch } = useGetActivityQuery(id, {
//     skip: id === "new",
//   });

//   useEffect(() => {
//     // console.log(data);
//     setActivity(data || initActivity);
//   }, [data]);

//   const processAdd = async ({ description }, { setSubmitting }) => {
//     // console.log('Adding Activity');
//     const data = {
//       description,
//       isExclusive: false,
//     };
//     // console.log(data, user);
//     const { payload } = await dispatch(addActivityApi({ data, addActivityMutation }));
//     console.log(payload);
//     if (payload.error) {
//       toast(payload.error.data.message, { type: "error" });
//     } else {
//       toast("Activity updated");
//     }
//     setSubmitting(false);
//     navigate(`/activities/${payload.data.$id}`, { replace: true });
//     return payload.data;
//   };

//   const processUpdate = async (
//     { $id: id, description, isExclusive },
//     { setSubmitting }
//   ) => {
//     const res = await updateActivity({
//       id,
//       data: { description, isExclusive },
//     });
//     // console.log(res);
//     if (res.error) {
//       toast(res.error.data.message, { type: "error" });
//     } else {
//       toast("Activity updated");
//     }
//     setSubmitting(false);
//     return res;
//   };

//   const processDelete = async (id, { setSubmitting }) => {
//     setSubmitting(true);
//     const res = await deleteActivity(id);
//     // console.log(res);
//     if (res.error) {
//       toast(res.error.data.message, { type: "error" });
//     } else {
//       toast("Activity deleted");
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
//       initialValues={activity}
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
//             title={`ActivityForm ${id}`}
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
//                     name="isExclusive"
//                     type="checkbox"
//                     label="Complete"
//                   />
//                 </Grid2>
//                 <Grid2 xs={12}>
//                   <pre>{JSON.stringify(activity, null, "\t")}</pre>
//                 </Grid2>
//               </Grid2>
//             </Form>
//           </Panel>
//         );
//       }}
//     </Formik>
//   );
// };

// export default ActivityForm;
