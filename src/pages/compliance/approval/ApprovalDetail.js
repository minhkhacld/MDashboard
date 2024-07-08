// @mui
import { Container } from '@mui/material';
import _ from 'lodash';
// yup
// devextreme
import { LoadPanel, Position } from 'devextreme-react/load-panel';
// React hooks
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
// section
import ComplianceAuditDetail from '../../../sections/compliance/approval/audit/AuditDetail';
import Detail from '../../../sections/compliance/approval/request/Detail';
// redux
import {
  getAuditors,
  getCompanyList,
  getComplianceEnums,
  getCustomerList,
  // getEnumAuditTime,
  // getEnumAuditingResult,
  // getEnumAuditType,
  // getEnumBrand,
  // getEnumProductGroup,
  // getEnumProductLine,
  getFactoryList,
  getSubFactoryList,
  setViewOnlyTodo
} from '../../../redux/slices/compliance';
import { dispatch, useSelector } from '../../../redux/store';
// components
import HeaderGobackButton from '../../../components/HeaderGobackButton';
import Page from '../../../components/Page';
import axios from '../../../utils/axios';
import uuidv4 from '../../../utils/uuidv4';

export default function ApprovalDetail() {
  // components state
  const [source, setSource] = useState();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [WFInstance, setWFInstance] = useState();
  const [currentState, setCurrentState] = useState();
  // hooks
  const { name } = useParams();
  const mdUp = useResponsive('up', 'md');
  const { state } = useLocation();
  const { translate } = useLocales();
  const navigate = useNavigate();
  // redux
  const { LoginUser } = useSelector((store) => store.workflow);
  const Audit = state?.EntityTypeName === 'Compliance Audit';

  const getDataSource = () => {
    setLoading(true);
    setSubmitted(false);
    // dispatch(getEnumAuditType());
    // dispatch(getEnumAuditTime());
    // dispatch(getEnumProductLine());
    // dispatch(getEnumProductGroup());
    // dispatch(getEnumBrand());
    // dispatch(getEnumAuditingResult());
    dispatch(getComplianceEnums())
    dispatch(getFactoryList());
    dispatch(getCustomerList());
    dispatch(getAuditors());
    dispatch(getSubFactoryList());
    dispatch(getCompanyList());

    if (!Audit) {
      axios
        .get('/api/ComplianceRequestMobileApi/GetList', {
          params: { filter: JSON.stringify(['Id', '=', name, 'and', 'CurrentEmplId', '=', LoginUser?.EmpId]) },
        })
        .then((response) => {
          // console.log(response.data.data);
          setCurrentState({
            WFStatusName: response?.data?.data[0]?.WFStatusName,
            AuditTime: response?.data?.data[0]?.AuditTime,
          });
        })
        .catch((err) => {
          console.log(err);
        });
      axios.get(`/api/ComplianceRequestMobileApi/GetWFInstance/${name}`).then((result) => {
        // console.log(result);
        const WFStatuses = result.data.WFStatuses;
        setWFInstance(result.data);
      });
      return axios.get(`/api/ComplianceRequestMobileApi/GetByKey/${name}`, {
        //   params: {
        //   },
      });
    }
    axios.get(`/api/ComplianceAuditMobileApi/GetWFInstance/${name}`).then((result) => {
      // console.log(result);
      const WFStatuses = result.data.WFStatuses;
      setWFInstance(result.data);
    });
    return axios.get(`/api/ComplianceAuditMobileApi/GetByAuditId/${name}`);
  };
  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    getDataSource()
      .then((result) => {
        if (!Audit) {
          // console.log(result.data);
          setSource(result.data);
        } else {
          // console.log('/api/ComplianceAuditMobileApi/GetByAuditId', response);
          const currentTodoItem = result.data[0];
          const IsFinished = currentTodoItem?.AuditingResultId !== null;
          const Sections = _.chain(currentTodoItem?.Lines)
            .groupBy((data) => data.SectionName)
            .map((Items, Section) => ({ Items, Section, IsFinished, Id: uuidv4() }))
            .value();
          const FactoryInfoLines = _.chain(currentTodoItem?.FactoryInfoLines)
            .groupBy((data) => data.Section)
            .map((Items, Section, index) => ({ Items, Section, IsFinished, Id: uuidv4() }))
            .value();

          currentTodoItem.Sections = Sections;
          currentTodoItem.id = result.data[0].Id;
          currentTodoItem.FactoryInfoLines = FactoryInfoLines;
          delete currentTodoItem.Id;
          dispatch(setViewOnlyTodo(currentTodoItem));
          setCurrentState({ item: currentTodoItem, isViewOnly: true, Audit: true, Guid: state?.Guid });
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [submitted]);

  // console.log(state);

  return (
    <Page title={'Compliance Approval Detail'}>
      <Container sx={{ p: 0, pt: 0 }}>
        <HeaderGobackButton onClick={() => handleGoBack()} />
        {!loading && WFInstance && !Audit ? (
          <Detail
            currentRequest={source}
            state={currentState}
            name={name}
            navigate={navigate}
            setSubmitted={setSubmitted}
            WFInstance={WFInstance}
          />
        ) : null}
        {!loading && WFInstance && Audit ? (
          <ComplianceAuditDetail WFInstance={WFInstance} state={currentState} />
        ) : null}
        {loading && (
          <LoadPanel
            hideOnOutsideClick
            message="Please, wait..."
            visible={loading}
            onHidden={() => setLoading(false)}
            showPane={false}
          // position='center'
          >
            <Position my="center" at="center" of="#aprroval-card" />
          </LoadPanel>
        )}
      </Container>
    </Page>
  );
}
