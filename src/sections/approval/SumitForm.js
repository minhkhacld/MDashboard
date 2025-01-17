import { LoadPanel, Position } from 'devextreme-react/load-panel';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
// notistack
import { useSnackbar } from 'notistack';
// Validate form
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Divider, FormControlLabel, FormGroup, Grid, MenuItem, Stack, Switch } from '@mui/material';

// Redux
import { useSelector } from '../../redux/store';
// hooks
import { FormProvider, RHFSelectMenuItem, RHFTextField } from '../../components/hook-form';
import useLocales from '../../hooks/useLocales';
// Components
import axios from '../../utils/axios';

// ----------------------------------------------------------------------

const SubmitForm = () => {

  // Hooks
  const { translate } = useLocales();
  const navigate = useNavigate();
  const { name } = useParams();
  const location = useLocation();
  const Guid = location.state?.Guid || null;
  const PaymentMethod = location.state?.PaymentMethod || null;
  const { enqueueSnackbar } = useSnackbar();
  // const { user, userInfo } = useAuth();
  const { error, WFInstance, LoginUser, RelatedDocGuid, AllUser } = useSelector((store) => store.workflow);

  const toApproverRef = useRef(null);

  // Component state
  const [switchBtn, setSwitch] = useState(true);
  const [loading, setLoading] = useState(false);

  const actionList =
    WFInstance === null
      ? []
      : WFInstance?.CurrentStatus?.Actions.filter(
        (action) => action.ActionName !== 'Reject' && action.ActionName !== 'Closed' && action.ActionName !== 'Recall'
      );

  const defaultValues = useMemo(
    () => ({
      ActionId: '',
      ToApproverId: '',
      Comment: '',
      ApproverList: [],
      LoginUserId: LoginUser?.UserId,
      FRReportParams: RelatedDocGuid,
      ActionList: [],
    }),
    [RelatedDocGuid, LoginUser]
  );

  useEffect(() => {
    (async () => {
      setLoading(true)
      const responseDefault = await axios
        .get(`/api/UserMobileApi/GetDefaultToStatusAndToEmpByRecordGuid/${Guid}`);
      // console.log('GetAllUserAndPriority', responseDefault);
      if (responseDefault?.status === 200 && responseDefault?.data?.ToEmpId !== null && responseDefault?.data?.ToStatusId !== null) {
        setValue('ActionList', WFInstance.CurrentStatus?.Actions.filter(action => {
          if (PaymentMethod === 'Cash') {
            return action.ActionName !== 'Reject' && action.ActionName !== 'Closed' && action.ActionName !== 'Recall' && action.ActionName !== "To Finance Dep."
          }
          return action.ActionName !== 'Reject' && action.ActionName !== 'Closed' && action.ActionName !== 'Recall' && action.ActionName !== "To Treasurer"
        }))
        setValue('ActionId', WFInstance.CurrentStatus?.Actions.find(d => d?.ToStatusId === responseDefault?.data?.ToStatusId)?.Id);
        setValue('ToApproverId', responseDefault.data.ToEmpId);
        setValue('ApproverList', [{ Id: responseDefault.data.ToEmpId, KnowAs: responseDefault.data.ToEmpKnowAs }]);
        setLoading(false);
      } else {
        await axios
          .get(`/api/WorkflowApi/GetToStatusDefault/${WFInstance?.CurrentStatus.Id}/${LoginUser.EmpId}`)
          .then(async (response) => {
            if (response.data) {
              await axios
                .get(
                  `/api/WorkflowApi/GetToEmployee/${WFInstance.CurrentStatus.Id}/${response.data.data[0].WFStatusActionId}/${LoginUser?.EmpId}`
                )
                .then((result) => {
                  // console.log('ApproverList', result, 'ActionList', response, 'WFInstance', WFInstance);
                  setValue('ActionId', response.data.data[0].WFStatusActionId);
                  setValue('ToApproverId', response.data.data[0].ApproverId);
                  setValue('ApproverList', result.data.data);
                  setValue('ActionList', WFInstance.CurrentStatus?.Actions.filter(action => {
                    if (PaymentMethod === 'Cash') {
                      return action.ActionName !== 'Reject' && action.ActionName !== 'Closed' && action.ActionName !== 'Recall' && action.ActionName !== "To Finance Dep."
                    }
                    return action.ActionName !== 'Reject' && action.ActionName !== 'Closed' && action.ActionName !== 'Recall' && action.ActionName !== "To Treasurer"

                  }))
                  setLoading(false)
                })
                .catch((err) => {
                  setLoading(false)
                  console.error(err);
                });
            }
          })
          .catch((err) => {
            setLoading(false)
            console.error(err);
          });
      }
    })()
  }, []);

  const stepScheme = Yup.object().shape({
    ActionId: Yup.string().required('Action is required'),
    ToApproverId: Yup.string().required('Approver is required'),
  });

  const methods = useForm({
    resolver: yupResolver(stepScheme),
    defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  if (WFInstance === null) {
    return null;
  }

  const values = watch();

  const handleSend = async (action) => {
    console.log('Submit action', action)
    try {
      const postData = {
        ActionId: values.ActionId,
        ToApproverId: values.ToApproverId,
        Comment: values.Comment,
        LoginUserId: values.LoginUserId,
        FRReportParams: values.FRReportParams,
      };
      //  handle custom api, if have custom api in selected action must call api before for validate WF
      const approvalAction = WFInstance.CurrentStatus?.Actions.find((d) => d.Id === values.ActionId);
      const CustomActionApi = approvalAction?.CustomActionApi || null;

      // With custom API case
      if (CustomActionApi !== null) {
        const apiUrl = `${CustomActionApi}/${Guid}/true`;
        const responseCustomApi = await axios.get(apiUrl);
        if (responseCustomApi) {
          // console.log('responseCustomApi', responseCustomApi);
          const responseJump = await axios.post(`/api/WorkflowApi/ExecuteActionFinanceRequests`, postData);
          // console.log('responseJump - with customapi case', responseJump);
          if (responseJump) {
            enqueueSnackbar(action === 'SUBMIT' ? 'Request has been sent' : 'Request has been rejected', {
              anchorOrigin: {
                vertical: 'top',
                horizontal: 'center',
              },
            });
            navigate(-1);
          }
        }
      }
      // No custom API case
      else {
        const responseJump = await axios.post(`/api/WorkflowApi/ExecuteActionFinanceRequests`, postData);
        // console.log('responseJump - no customapi case', responseJump);
        if (responseJump) {
          enqueueSnackbar(action === 'SUBMIT' ? 'Request has been sent' : 'Request has been rejected', {
            anchorOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
          });
          navigate(-1);
        }
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  const handleChangeType = (e) => {
    setSwitch(!switchBtn);
    if (e.target.value === 'true') {
      const rejectAction = WFInstance.CurrentStatus.Actions.find((action) => action.ActionName === 'Reject');
      if (rejectAction) {
        setValue('ActionId', rejectAction.Id);
        setValue('ToApproverId', rejectAction.ToStatusId);
      }
    }
    else {
      (async () => {
        setLoading(true)
        const responseDefault = await axios
          .get(`/api/UserMobileApi/GetDefaultToStatusAndToEmpByRecordGuid/${Guid}`);
        // console.log('GetAllUserAndPriority', responseDefault);
        if (responseDefault?.status === 200 && responseDefault?.data?.ToEmpId !== null && responseDefault?.data?.ToStatusId !== null) {
          setValue('ActionList', WFInstance.CurrentStatus?.Actions.filter(action => {
            if (PaymentMethod === 'Cash') {
              return action.ActionName !== 'Reject' && action.ActionName !== 'Closed' && action.ActionName !== 'Recall' && action.ActionName !== "To Finance Dep."
            }
            return action.ActionName !== 'Reject' && action.ActionName !== 'Closed' && action.ActionName !== 'Recall' && action.ActionName !== "To Treasurer"
          }))
          setValue('ActionId', WFInstance.CurrentStatus?.Actions.find(d => d?.ToStatusId === responseDefault?.data?.ToStatusId)?.Id);
          setValue('ToApproverId', responseDefault.data.ToEmpId);
          setValue('ApproverList', [{ Id: responseDefault.data.ToEmpId, KnowAs: responseDefault.data.ToEmpKnowAs }]);
          setLoading(false)
        } else {
          await axios
            .get(`/api/WorkflowApi/GetToStatusDefault/${WFInstance?.CurrentStatus.Id}/${LoginUser.EmpId}`)
            .then(async (response) => {
              if (response.data) {
                await axios
                  .get(
                    `/api/WorkflowApi/GetToEmployee/${WFInstance.CurrentStatus.Id}/${response.data.data[0].WFStatusActionId}/${LoginUser?.EmpId}`
                  )
                  .then((result) => {
                    // console.log('ApproverList', result, 'ActionList', response, 'WFInstance', WFInstance);
                    setValue('ActionId', response.data.data[0].WFStatusActionId);
                    setValue('ToApproverId', response.data.data[0].ApproverId);
                    setValue('ApproverList', result.data.data);
                    setValue('ActionList', WFInstance.CurrentStatus?.Actions.filter(action => {
                      if (PaymentMethod === 'Cash') {
                        return action.ActionName !== 'Reject' && action.ActionName !== 'Closed' && action.ActionName !== 'Recall' && action.ActionName !== "To Finance Dep."
                      }
                      return action.ActionName !== 'Reject' && action.ActionName !== 'Closed' && action.ActionName !== 'Recall' && action.ActionName !== "To Treasurer"

                    }))
                    setLoading(false)
                  })
                  .catch((err) => {
                    setLoading(false)
                    console.error(err);
                  });
              }
            })
            .catch((err) => {
              setLoading(false)
              console.error(err);
            });
        }
      })()
    }
  };

  const handleSelectAction = async (e) => {
    // console.log(e.target.value, WFInstance);
    setValue('ActionId', e.target.value);
    setValue('ToApproverId', '');
    await axios
      .get(`/api/WorkflowApi/GetToEmployee/${WFInstance.CurrentStatus.Id}/${e.target.value}/${LoginUser?.EmpId}`)
      .then((response) => {
        // console.log(response);
        if (response.data) {
          setValue('ApproverList', response.data.data);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const toApprovalList = values.ApproverList.length === 0 ? [] : values.ApproverList;
  const isStepBOD = LoginUser?.UserName?.toLowerCase().slice(0, 3).includes('bod') || WFInstance.CurrentStatus.StatusName === "G. Director Approval";

  // console.log(
  //   // values,
  //   WFInstance,
  //   // LoginUser,
  //   // isSubmitting,
  // );

  return (
    <>
      <Stack id='approval-submit-form'>
        {/* <Stack sx={{ mb: 3 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  defaultChecked
                  sx={{
                    '& .MuiSwitch-track': {
                      borderRadius: 26 / 2,
                      backgroundColor: 'error.light',
                    },
                    '& .MuiSwitch-thumb': {
                      borderRadius: 26 / 2,
                      backgroundColor: switchBtn ? 'primary.main' : 'error.main',
                    },
                  }}
                />
              }
              label={isStepBOD ? translate(switchBtn ? 'Approve' : 'button.reject') : translate(switchBtn ? 'button.submit' : 'button.reject')}
              value={switchBtn}
              onChange={(e) => handleChangeType(e)}
              disabled={WFInstance.CurrentStatus.StatusName === 'Draft'}
            />
          </FormGroup>
        </Stack> */}

        <FormProvider methods={methods} onSubmit={handleSubmit(() => handleSend(switchBtn ? 'SUBMIT' : 'REJECT'))}>
          <Grid container rowSpacing={2} columnSpacing={2}>
            {switchBtn && (
              <>
                <Grid item xs={12} sm={12}>
                  <RHFSelectMenuItem
                    name="ActionId"
                    size="medium"
                    label={translate('chooseStep')}
                    onChange={(e) => handleSelectAction(e)}
                  >
                    {values.ActionList.length > 0 &&
                      values.ActionList.map((action) => (
                        <MenuItem key={action.Id} value={action.Id}>
                          {action.ActionName}
                        </MenuItem>
                      ))
                    }
                  </RHFSelectMenuItem>
                </Grid>

                <Grid item xs={12} sm={12}>
                  <RHFSelectMenuItem name="ToApproverId" size="medium" displayEmpty label={translate('toApprover')}>
                    {values.ApproverList.length > 0 &&
                      values.ApproverList.map((approver) => (
                        <MenuItem key={approver.Id} value={approver.Id}>
                          {approver?.KnowAs}
                        </MenuItem>
                      ))}
                  </RHFSelectMenuItem>
                </Grid>

              </>
            )}
            <Grid item xs={12} sm={12} md={12}>
              <RHFTextField name="Comment" size="medium" label={translate('remark')} multiline rows={4} />
            </Grid>
          </Grid>
          <Stack justifyContent="space-between" direction="row" spacing={2} sx={{ mt: 3 }}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    defaultChecked
                    sx={{
                      '& .MuiSwitch-track': {
                        borderRadius: 26 / 2,
                        backgroundColor: 'error.light',
                      },
                      '& .MuiSwitch-thumb': {
                        borderRadius: 26 / 2,
                        backgroundColor: switchBtn ? 'primary.main' : 'error.main',
                      },
                    }}
                  />
                }
                label={isStepBOD ? translate(switchBtn ? 'Approve' : 'button.reject') : translate(switchBtn ? 'button.submit' : 'button.reject')}
                value={switchBtn}
                onChange={(e) => handleChangeType(e)}
                disabled={WFInstance.CurrentStatus.StatusName === 'Draft'}
              />
            </FormGroup>

            {switchBtn ? (
              <LoadingButton
                size="small"
                variant="contained"
                loading={isSubmitting}
                // onClick={() => handleSubmit(handleSend('SUBMIT'))}
                disabled={isSubmitting}
                type="submit"
              >
                {translate('button.confirm')}
              </LoadingButton>
            ) : (
              <LoadingButton
                color="error"
                size="small"
                variant="contained"
                loading={isSubmitting}
                disabled={isSubmitting}
                // onClick={() => handleSubmit(handleSend('REJECT'))}
                type="submit"
              >
                {translate('button.confirm')}
              </LoadingButton>
            )}
          </Stack>
        </FormProvider>

        <Divider sx={{ mt: 5 }} />
      </Stack>

      {loading && (
        <LoadPanel
          message="Please, wait..."
          visible={loading}
          position='center'
          // shadingColor={'#4c55598c'}
          hideOnOutsideClick
          showPane={false}
          onHidden={() => setLoading(false)}
        >
          <Position my="center" at="center" of="#approval-submit-form" />
        </LoadPanel>
      )}
    </>

  );
};

export default SubmitForm;
