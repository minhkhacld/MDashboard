// @mui
import { Container } from '@mui/material';
// yup
// devextreme
// React hooks
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PATH_APP } from '../../../routes/paths';
import axios from '../../../utils/axios';
// section
import Detail from '../../../sections/compliance/request/Detail';
// redux
import {
  getAuditors,
  getComplianceEnums,
  getCustomerList,
  // getEnumAuditTime,
  // getEnumAuditType,
  // getEnumBrand,
  // getEnumProductGroup,
  // getEnumProductLine,
  getFactoryList,
  getSubFactoryList,
} from '../../../redux/slices/compliance';
import { dispatch, useSelector } from '../../../redux/store';
// components
import HeaderGobackButton from '../../../components/HeaderGobackButton';
import Page from '../../../components/Page';

export default function ComplianceDetail() {
  // components state
  const [loading, setLoading] = useState(false);
  const [currentItem, setCurrentItem] = useState();
  // hooks
  const { name } = useParams();
  const { LoginUser } = useSelector((store) => store.workflow);
  const navigate = useNavigate();

  // get Request List
  const getCurrentItem = () => {
    axios
      .get('/api/ComplianceRequestMobileApi/GetList', {
        params: { filter: JSON.stringify(['Id', '=', name, 'and', 'CurrentEmplId', '=', LoginUser?.EmpId]) },
      })
      .then((response) => {
        // console.log(response.data.data);
        setCurrentItem({
          WFStatusName: response?.data?.data[0]?.WFStatusName,
          AuditTime: response?.data?.data[0]?.AuditTime,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getEnums = () => {
    // dispatch(getEnumAuditType());
    // dispatch(getEnumAuditTime());
    // dispatch(getEnumProductLine());
    // dispatch(getEnumProductGroup());
    // dispatch(getEnumBrand());
    dispatch(getFactoryList());
    dispatch(getCustomerList());
    dispatch(getAuditors());
    dispatch(getSubFactoryList());
    dispatch(getComplianceEnums());
  };

  const handleGoBack = () => {
    navigate(PATH_APP.compliance.request.root);
  };

  // Get Current Item
  useEffect(() => {
    getCurrentItem();
  }, [name]);

  // get Enums
  useEffect(() => {
    setLoading(true);
    getEnums();
    setLoading(false);
  }, []);

  // console.log(state);

  return (
    <Page title={'Compliance Request Info'}>
      <Container sx={{ p: 1, pt: 0 }}>
        <HeaderGobackButton onClick={() => handleGoBack()} />
        {!loading ? <Detail state={currentItem} name={name} navigate={navigate} /> : null}
      </Container>
    </Page>
  );
}
