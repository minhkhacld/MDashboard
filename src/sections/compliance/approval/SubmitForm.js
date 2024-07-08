import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
// notistack
import { useSnackbar } from 'notistack';
// Validate form
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
// @mui
import { LoadingButton } from '@mui/lab';
import { Divider, FormControlLabel, FormGroup, Grid, MenuItem, Stack, Switch } from '@mui/material';
// Redux
import { useSelector } from '../../../redux/store';
// hooks
import { FormProvider, RHFSelectMenuItem, RHFTextField } from '../../../components/hook-form';
import useLocales from '../../../hooks/useLocales';
// Components
import PopupConfirm from '../../../components/PopupConfirm';
import axios from '../../../utils/axios';

// ----------------------------------------------------------------------

const SubmitForm = (props) => {
  SubmitForm.propTypes = {
    WFInstance: PropTypes.object,
  };

  // Hooks
  const { translate } = useLocales();
  const navigate = useNavigate();
  // const { name } = useParams();
  const location = useLocation();
  const Guid = location.state?.Guid || null;
  const { enqueueSnackbar } = useSnackbar();
  // const { user, userInfo } = useAuth();
  const { LoginUser } = useSelector((store) => store.workflow);
  // const { WFInstance, RelatedDocGuid } = useSelector((store) => store.bankAccount);
  const { WFInstance } = props;
  // const auth = useAuth();
  const [confirmModal, setConfirmModal] = useState(false);
  const [isReject, setIsReject] = useState(false);

  // Component state
  const [switchBtn, setSwitch] = useState(true);

  const actionList =
    WFInstance === null
      ? []
      : WFInstance?.CurrentStatus?.Actions.filter(
        (action) =>
          action.ActionName !== 'Reject' &&
          action.ActionName !== 'Closed' &&
          action.ActionName !== 'Recall' &&
          action.ActionName !== 'Reject To Open'
      );

  const defaultValues = useMemo(
    () => ({
      ActionId: '',
      ToApproverId: '',
      Comment: '',
      LoginUserId: LoginUser?.UserId,
      // SSReportParams: RelatedDocGuid,
      ApproverList: [],
    }),
    [actionList, LoginUser]
  );

  useEffect(() => {
    // console.log(WFInstance);
    (async () => {
      await axios
        .get(`/api/WorkflowApi/GetToStatusDefault/${WFInstance.CurrentStatus.Id}/${LoginUser?.EmpId}`)
        .then(async (response) => {
          if (response.data) {
            let defaultActionId;
            if (response.data.data[0]?.WFStatusActionId) {
              defaultActionId = response.data.data[0]?.WFStatusActionId;
            } else {
              const approvalAction = WFInstance.CurrentStatus?.Actions.filter(
                (d) =>
                  d.ActionName !== 'Reject' &&
                  d.ActionName !== 'Recall' &&
                  d.ActionName !== 'Closed' &&
                  d.ActionName !== 'Reject To Open'
              );
              defaultActionId = approvalAction[0].Id;
            }
            // console.log(defaultActionId);

            setValue('ActionId', defaultActionId);
            await axios
              .get(`/api/WorkflowApi/GetToEmployee/${WFInstance.CurrentStatus.Id}/${defaultActionId}/${LoginUser?.EmpId}`)
              .then((response) => {
                // console.log(response);
                if (response.data) {
                  setValue('ApproverList', response.data.data);
                  setValue('ToApproverId', response.data.data[0]?.Id);
                }
              })
              .catch((err) => {
                console.error(err);
              });
          }
        })
        .catch((err) => {
          console.error(err);
        });
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
    try {
      const postData = {
        ActionId: values.ActionId,
        ToApproverId: values.ToApproverId,
        Comment: values.Comment,
        LoginUserId: values.LoginUserId,
        SSReportParams: values.SSReportParams,
      };
      // console.log(postData)

      //  handle custom api, if have custom api in selected action must call api before for validate WF
      const approvalAction = WFInstance.CurrentStatus?.Actions.find((d) => d.Id === values.ActionId);
      const CustomActionApi = approvalAction?.CustomActionApi || null;
      // console.log(approvalAction);
      // With custom API case
      if (CustomActionApi !== null) {
        const apiUrl = `${CustomActionApi}/${Guid}/true`;
        console.log(apiUrl);
        const responseCustomApi = await axios.get(apiUrl);
        if (responseCustomApi) {
          console.log('responseCustomApi', responseCustomApi);
          const responseJump = await axios.get(
            `/api/WorkflowApi/ExecuteAction?wfinstanceid=${WFInstance.Id}&actionid=${postData.ActionId}&toapprover=${postData.ToApproverId}&comment=${postData.Comment}&userlogin=${postData.LoginUserId}`
          );
          console.log('responseJump - with customapi case', responseJump);
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
        const responseJump = await axios.get(
          `/api/WorkflowApi/ExecuteAction?wfinstanceid=${WFInstance.Id}&actionid=${postData.ActionId}&toapprover=${postData.ToApproverId}&comment=${postData.Comment}&userlogin=${postData.LoginUserId}`
        );
        console.log('responseJump - no customapi case', responseJump);
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
      setConfirmModal(!confirmModal);
      setIsReject(false);
    }
  };

  const handleChangeType = (e) => {
    setSwitch(!switchBtn);
    if (e.target.value === 'true') {
      const rejectAction = WFInstance.CurrentStatus.Actions.find(
        (action) => action.ActionName === 'Reject' || action.ActionName === 'Reject To Open'
      );
      if (rejectAction) {
        setValue('ActionId', rejectAction.Id);
        setValue('ToApproverId', rejectAction.ToStatusId);
      }
    } else {
      axios
        .get(`/api/WorkflowApi/GetToStatusDefault/${WFInstance.CurrentStatus.Id}/${LoginUser?.EmpId}`)
        .then(async (response) => {
          // console.log(response);
          if (response.data) {
            let defaultActionId;
            if (response.data.data[0]?.WFStatusActionId) {
              defaultActionId = response.data.data[0]?.WFStatusActionId;
            } else {
              const approvalAction = WFInstance.CurrentStatus?.Actions.filter(
                (d) =>
                  d.ActionName !== 'Reject' &&
                  d.ActionName !== 'Recall' &&
                  d.ActionName !== 'Closed' &&
                  d.ActionName !== 'Reject To Open'
              );
              defaultActionId = approvalAction[0].Id;
            }
            setValue('ActionId', defaultActionId);
            axios
              .get(
                `/api/WorkflowApi/GetToEmployee/${WFInstance.CurrentStatus.Id}/${defaultActionId}/${LoginUser?.EmpId}`
              )
              .then((response) => {
                // console.log(response);
                if (response.data) {
                  setValue('ApproverList', response.data.data);
                  setValue('ToApproverId', response.data.data[0]?.Id);
                }
              })
              .catch((err) => {
                console.error(err);
              });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const handleSelectAction = async (e) => {
    // console.log(e.target.value);
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

  // const toApprovalList = values.ApproverList.length === 0 ? [] : values.ApproverList;
  const isStepBOD = LoginUser?.UserName?.toLowerCase().slice(0, 3).includes('bod') || false;

  return (
    <Stack>
      <Stack sx={{ mb: 3 }}>
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
            label={
              isStepBOD
                ? translate(switchBtn ? 'Approve' : 'button.reject')
                : translate(switchBtn ? 'button.submit' : 'button.reject')
            }
            value={switchBtn}
            onChange={(e) => handleChangeType(e)}
            disabled={WFInstance.CurrentStatus.StatusName === 'Open'}
          />
        </FormGroup>
      </Stack>

      <FormProvider methods={methods}>
        <Grid container rowSpacing={2} columnSpacing={2}>
          {switchBtn && (
            <>
              <Grid item xs={12} sm={12}>
                <RHFSelectMenuItem
                  name="ActionId"
                  size="medium"
                  // disabled
                  label={translate('chooseStep')}
                  onChange={(e) => handleSelectAction(e)}
                >
                  {actionList.length > 0 &&
                    actionList.map((action) => (
                      <MenuItem key={action.Id} value={action.Id}>
                        {action.ActionName}
                      </MenuItem>
                    ))}
                </RHFSelectMenuItem>
              </Grid>
              {WFInstance?.CurrentStatus?.StatusName !== 'Close' && WFInstance?.CurrentStatus?.StatusName !== 'Approved' ? (
                <Grid item xs={12} sm={12}>
                  <RHFSelectMenuItem name="ToApproverId" size="medium" displayEmpty label={translate('Gửi đến')}>
                    {values.ApproverList.length > 0 &&
                      values.ApproverList.map((approver) => (
                        <MenuItem key={approver.Id} value={approver.Id}>
                          {approver?.KnowAs}
                        </MenuItem>
                      ))}
                  </RHFSelectMenuItem>
                </Grid>
              ) : null}
            </>
          )}
          <Grid item xs={12} sm={12} md={12}>
            <RHFTextField name="Comment" size="medium" label={translate('remark')} multiline rows={4} />
          </Grid>
        </Grid>
        <Stack justifyContent="flex-end" direction="row" spacing={2} sx={{ mt: 3 }}>
          {switchBtn ? (
            <LoadingButton
              size="small"
              variant="contained"
              loading={isSubmitting}
              onClick={() => setConfirmModal(true)}
            >
              {translate('button.confirm')}
            </LoadingButton>
          ) : (
            <LoadingButton
              color="error"
              size="small"
              variant="contained"
              loading={isSubmitting}
              onClick={() => {
                setConfirmModal(true);
                setIsReject(true);
              }}
            >
              {translate('button.confirm')}
            </LoadingButton>
          )}
        </Stack>
        {confirmModal ? (
          <PopupConfirm
            title={confirmModal && isReject ? 'Reject Confirm' : 'Submit Confirm'}
            visible={confirmModal}
            onClose={() => {
              setConfirmModal(!confirmModal);
              setIsReject(false);
            }}
            onProcess={() =>
              confirmModal && isReject ? handleSubmit(handleSend('REJECT')) : handleSubmit(handleSend('SUBMIT'))
            }
            description={actionList[0]?.ConfirmMessage}
          />
        ) : null}
      </FormProvider>

      <Divider sx={{ mt: 5 }} />
    </Stack>
  );
};

export default SubmitForm;
