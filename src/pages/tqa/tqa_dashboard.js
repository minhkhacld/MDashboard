import { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ChartsText } from '@mui/x-charts/ChartsText';
import PropTypes from 'prop-types';
import LinearProgress from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import axios from '../../utils/axios';

const baseHosting = "https://test-dashboard-api.motivesfareast.com/";

const dataDashboarDesign = [
  { value: 10, label: 'Planning' },
  { value: 15, label: 'UnAssigned' },
  { value: 75, label: 'Assigned' },
];

const dataDashboard3D = [
  { value: 80, label: 'Finish' },
  { value: 67, label: 'Planning' },
  { value: 10, label: 'Making' },
];

const dataDashboardSampleProduction = [
  { value: 80, label: 'Finished' },
  { value: 10, label: 'Planning' },
  { value: 10, label: 'Making' },
];

const dataSmallChart = [
  { label: 'Planning', value: 20 },
  { label: 'UnAssigned', value: 50 },
  { label: 'Assigned', value: 30 }
];

const widthSmallChart = 170;

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  textAlign: 'center',
  display: 'flex',
  border: '1px',
  color: theme.palette.text.secondary,
}));

const commonBoxStyles = {
  m: 1,
  boxShadow: 2,
  borderRadius: '5px',
};

const commonLabelTop5Employee = {
  textAlign: "left",
  fontSize: "20px",
  color: "#5ba3e1",
  background: "#d3ebff",
  marginTop: "10px 0px",
  padding: "0px 10px"
}

const commonLabelSmallChart = (item) => {
  return item.value;
}

const commonSizeLabelSmallChart = () => {
  return {
    [`& .${pieArcLabelClasses.root}`]: {
      fontSize: 10,
      fill: 'white'
    },
  }
}

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} color="secondary" style={{ height: props.height, width: "75%", float: "left" }} maxValue={100} value={props?.value > 100 ? 100 : props?.value} />
        <Typography variant="body2" color="text.black" style={{ fontSize: "11px", width: "20%", float: "right", marginTop: "-3px" }}>{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>

    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired
};

function LinearProgressWithLabelHeader(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} color="secondary" style={{ height: props.height, width: "75%", float: "left" }} />
        <Typography variant="body2" color="text.black" style={{ fontSize: "11px", width: "20%", float: "right", marginTop: "3px" }}>{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>

    </Box>
  );
}

LinearProgressWithLabelHeader.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired
};

const setColorSeries = (label) => {
  if (label === "Planning")
    return "#7fd2e0";
  if (label === "Making" || label === "Assigned")
    return "#38afd1";
  if (label === "Finished" || label === "Unassigned")
    return "#2596be";
}

const TQADasboardSampleProduction = () => {
  const [dataSampleProduction, setDataSampleProduction] = useState([]);
  const getDataChart = useCallback(async () => {
    try {
      const postData = {
        "module": "SAMPLE_PRODUCT_PLAINNING",
        "start_date": "2023/01/01",
        "end_date": "2024/01/01",
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-pie-chart-data`, postData)
      const total = response.data.reply.total_sum;
      const newData = response.data.reply.items.map((val, i) => {
        return { value: Math.round(val.value / total * 100, 2), label: val.name, color: setColorSeries(val.name) }
      })
      const newDataDesign = {
        total: response.data.reply.total_sum,
        percent: response.data.reply.percentage,
        data: newData
      }
      setDataSampleProduction(newDataDesign);
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop5SampleProductionBestWeek, setDataTop5SampleProductionBestWeek] = useState([]);
  const getDataTop5SampleProductionBestWeek = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "BEST",
        "module": "SAMPLE_PRODUCT_PLAINNING"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-week`, postData);

      if (response && response.data.result === "success") {
        setDataTop5SampleProductionBestWeek(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop5SampleProductionBestYTD, setDataTop5SampleProductionBestYTD] = useState([]);
  const getDataTop5SampleProductionBestYTD = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "BEST",
        "module": "SAMPLE_PRODUCT_PLAINNING"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-year`, postData);

      if (response && response.data.result === "success") {
        setDataTop5SampleProductionBestYTD(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop5SampleProductionWorstWeek, setDataTop5SampleProductionWorstWeek] = useState([]);
  const getDataTop5SampleProductionWorstWeek = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "WORST",
        "module": "SAMPLE_PRODUCT_PLAINNING"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-week`, postData);

      if (response && response.data.result === "success") {
        setDataTop5SampleProductionWorstWeek(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop5SampleProductionWorstYTD, setDataTop5SampleProductionWorstYTD] = useState([]);
  const getDataTop5SampleProductionWorstYTD = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "WORST",
        "module": "SAMPLE_PRODUCT_PLAINNING"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-year`, postData);

      if (response && response.data.result === "success") {
        setDataTop5SampleProductionWorstYTD(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getDataChart();
    getDataTop5SampleProductionBestWeek();
    getDataTop5SampleProductionBestYTD();
    getDataTop5SampleProductionWorstWeek();
    getDataTop5SampleProductionWorstYTD();
  }, [])

  return (
    <Box sx={{ ...commonBoxStyles }}>
      <Grid container>
        <Grid xs={7} style={{ textAlign: "left" }}>
          <Box style={{ display: 'flex' }}>
            <Typography style={{ marginLeft: "5px", width: "200px", fontWeight: "bold", fontSize: "13px" }}>Sample Production</Typography>
            <Box sx={{ width: '50%' }}>
              <LinearProgressWithLabelHeader value={dataSampleProduction.percent} height={20} />
            </Box>
          </Box>
        </Grid>
        <Grid xs={5}>
          <Box style={{ display: 'flex', justifyContent: "right" }}>
            <Typography style={{ marginRight: "5px", fontWeight: "bold", fontSize: "20px" }}>Total Qty:</Typography>
            <Typography style={{ marginRight: "5px", fontWeight: "bold", fontSize: "20px", color: "#4AC34A" }}>{dataSampleProduction?.total}</Typography>
          </Box>
        </Grid>
      </Grid>
      <Item>
        <PieChart
          series={[
            {
              arcLabel: (item) => `${item.value} %`,
              data: dataSampleProduction?.data || []
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: 'white',
              fontWeight: 'bold',
            },
          }}
          {...{ width: 600, height: 425 }}
        />
      </Item>
      <Grid container xs={{ m: 10, p: 10 }}>
        <Grid md={12} xs={12}>
          <Typography style={commonLabelTop5Employee}>Top 5 Best Employees</Typography>
          <TQADasboardSampleProductionTop5BestEmployeeYTD dataTop5SampleProductionBestWeek={dataTop5SampleProductionBestWeek} />
          <TQADasboardSampleProductionTop5BestEmployeeWeek dataTop5SampleProductionBestYTD={dataTop5SampleProductionBestYTD} />
        </Grid>
      </Grid>
      <Grid container xs={{ m: 10, p: 10 }}>
        <Grid md={12} xs={12}>
          <Typography style={commonLabelTop5Employee}>Top 5 Worst Employees</Typography>
          <TQADasboardSampleProductionTop5WorstEmployeeYTD dataTop5SampleProductionWorstYTD={dataTop5SampleProductionWorstYTD} />
          <TQADasboardSampleProductionTop5WorstEmployeeWeek dataTop5SampleProductionWorstWeek={dataTop5SampleProductionWorstWeek} />
        </Grid>
      </Grid>
    </Box>

  )
}

const TQADasboardSampleProductionTop5BestEmployeeYTD = ({ dataTop5SampleProductionBestYTD = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Year - 2024</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop5SampleProductionBestYTD.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}

const TQADasboardSampleProductionTop5BestEmployeeWeek = ({ dataTop5SampleProductionBestWeek = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Week - 2024</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop5SampleProductionBestWeek.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}

const TQADasboardSampleProductionTop5WorstEmployeeYTD = ({ dataTop5SampleProductionWorstWeek = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Year - 2024</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop5SampleProductionWorstWeek.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}

const TQADasboardSampleProductionTop5WorstEmployeeWeek = ({ dataTop5SampleProductionWorstWeek = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Week - 30</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop5SampleProductionWorstWeek.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}

const TQADasboardDesign = () => {
  const [dataDesign, setDataDesign] = useState([]);
  const getDataChart = useCallback(async () => {
    try {
      const postData = {
        "module": "DESIGN_PLANNING",
        "start_date": "2023/01/01",
        "end_date": "2024/01/01",
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-pie-chart-data`, postData)
      // console.log(response);
      if (response && response.data.result === "success") {
        const newData = response.data.reply.items.map((val, i) => {
          return { value: val.value, label: val.name, color: setColorSeries(val.name) }
        });

        const newDataDesign = {
          total: response.data.reply.total_sum,
          percent: response.data.reply.percentage,
          data: newData
        }

        setDataDesign(newDataDesign);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataChartTechPack, setDataChartTechPack] = useState([]);
  const getDataChartTechPack = useCallback(async () => {
    try {
      const postData = {
        "design_document": "PATTERN",
        "start_date": "2023/01/01",
        "end_date": "2024/01/01",
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-design-planning-chart-info`, postData)
      if (response && response.data.result === "success") {
        const items = response.data.reply.map((val, i) => {
          return { value: val.value, label: val.name, color: setColorSeries(val.name) }
        });

        setDataChartTechPack(items);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataChartConsumtion, setDataChartConsumtion] = useState([]);
  const getDataChartConsumtion = useCallback(async () => {
    try {
      const postData = {
        "design_document": "CONSUMPTION",
        "start_date": "2023/01/01",
        "end_date": "2024/01/01",
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-design-planning-chart-info`, postData)
      if (response && response.data.result === "success") {
        const items = response.data.reply.map((val, i) => {
          return { value: val.value, label: val.name, color: setColorSeries(val.name) }
        });
        setDataChartConsumtion(items);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataChartPattern, setDataChartPattern] = useState([]);
  const getDataChartPattern = useCallback(async () => {
    try {
      const postData = {
        "design_document": "PATTERN",
        "start_date": "2023/01/01",
        "end_date": "2024/01/01",
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-design-planning-chart-info`, postData)
      if (response && response.data.result === "success") {
        const items = response.data.reply.map((val, i) => {
          return { value: val.value, label: val.name, color: setColorSeries(val.name) }
        });
        setDataChartPattern(items);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop5DesignBestWeek, setDataTop5DesignBestWeek] = useState([]);
  const getDataTop5DesignBestWeek = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "BEST",
        "module": "DESIGN_PLANNING"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-week`, postData);

      if (response && response.data.result === "success") {
        setDataTop5DesignBestWeek(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop5DesignBestYTD, setDataTop5DesignBestYTD] = useState([]);
  const getDataTop5DesignBestYTD = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "BEST",
        "module": "DESIGN_PLANNING"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-year`, postData);

      if (response && response.data.result === "success") {
        setDataTop5DesignBestYTD(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop5DesignWorstWeek, setDataTop5DesignWorstWeek] = useState([]);
  const getDataTop5DesignWorstWeek = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "WORST",
        "module": "DESIGN_PLANNING"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-week`, postData);

      if (response && response.data.result === "success") {
        setDataTop5DesignWorstWeek(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop5DesignWorstYTD, setDataTop5DesignWorstYTD] = useState([]);
  const getDataTop5DesignWorstYTD = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "WORST",
        "module": "DESIGN_PLANNING"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-year`, postData);

      if (response && response.data.result === "success") {
        setDataTop5DesignWorstYTD(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getDataChart();
    getDataChartTechPack();
    getDataChartPattern();
    getDataChartConsumtion();
    getDataTop5DesignBestWeek();
    getDataTop5DesignBestYTD();
    getDataTop5DesignWorstWeek();
    getDataTop5DesignWorstYTD();
  }, [])

  return (
    <Box sx={{ ...commonBoxStyles }}>
      <Grid container>
        <Grid xs={6} style={{ textAlign: "left" }}>
          <Box style={{ display: 'flex' }}>
            <Typography style={{ marginLeft: "5px", width: "90px", fontWeight: "bold", fontSize: "20px" }}>Design</Typography>
            <Box sx={{ width: '50%' }}>
              <LinearProgressWithLabelHeader value={dataDesign.percent} height={20} />
            </Box>
          </Box>
        </Grid>
        <Grid xs={6}>
          <Box style={{ display: 'flex', justifyContent: "right" }}>
            <Typography style={{ marginRight: "5px", fontWeight: "bold", fontSize: "20px" }}>Total Qty</Typography>
            <Typography style={{ marginRight: "5px", fontWeight: "bold", fontSize: "20px", color: "#4AC34A" }}>{dataDesign.total}</Typography>
          </Box>
        </Grid>
      </Grid>
      <Item>
        <PieChart
          series={[
            {
              arcLabel: (item) => `${item.value}`,
              data: dataDesign?.data || [],
              innerRadius: 10,

            }
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: 'white',
              fontWeight: 'bold',
            },
          }}
          {...{ width: 500, height: 200 }}
          slotProps={{
            legend: {
              direction: 'column',
              position: { vertical: 'right', horizontal: 'right' },
              padding: {
                left: 10
              },
            },
          }}
        />
      </Item>
      <Grid container>
        <Grid md={4} xs={12}>
          <Item>
            <PieChart
              series={[
                {
                  arcLabel: commonLabelSmallChart,
                  innerRadius: 40,
                  outerRadius: 80,
                  data: dataChartTechPack || [],
                },
              ]}
              margin={{ right: 2 }}
              width={widthSmallChart}
              height={200}
              sx={commonSizeLabelSmallChart}
              legend={{ hidden: true }}
            />
          </Item>
          <Typography style={{ textAlign: "center" }}>Tech Pack</Typography>
        </Grid>
        <Grid md={4} xs={12}>
          <Item>
            <PieChart
              series={[
                {
                  arcLabel: commonLabelSmallChart,
                  innerRadius: 40,
                  outerRadius: 80,
                  data: dataChartPattern || [],
                },
              ]}
              margin={{ right: 2 }}
              width={widthSmallChart}
              height={200}
              legend={{ hidden: true }}
              sx={commonSizeLabelSmallChart}
            />
          </Item>
          <Typography style={{ textAlign: "center" }}>Pattern</Typography>
        </Grid>
        <Grid md={4} xs={12}>
          <Item>
            <PieChart
              series={[
                {
                  arcLabel: commonLabelSmallChart,
                  innerRadius: 40,
                  outerRadius: 80,
                  data: dataChartConsumtion || [],
                },
              ]}
              margin={{ right: 1 }}
              width={widthSmallChart}
              height={200}
              legend={{ hidden: true }}
              sx={commonSizeLabelSmallChart}
            />
          </Item>
          <Typography style={{ textAlign: "center" }}>Consumtion</Typography>
        </Grid>
      </Grid>
      <Grid container xs={{ m: 10, p: 10 }}>
        <Grid md={12} xs={12}>
          <Typography style={commonLabelTop5Employee}>Top 5 Best Employees</Typography>
          <TQADasboardDesignTop5BestEmployeeYTD dataTop5DesignBestYTD={dataTop5DesignBestYTD} />
          <TQADasboardDesignTop5BestEmployeeWeek dataTop5DesignBestWeek={dataTop5DesignBestWeek} />
        </Grid>
      </Grid>
      <Grid container xs={{ m: 10, p: 10 }}>
        <Grid md={12} xs={12}>
          <Typography style={commonLabelTop5Employee}>Top 5 Worst Employees</Typography>
          <TQADasboardDesignTop5WorstEmployeeYTD dataTop5DesignWorstYTD={dataTop5DesignWorstYTD} />
          <TQADasboardDesignTop5WorstEmployeeWeek dataTop5DesignWorstWeek={dataTop5DesignWorstWeek} />
        </Grid>
      </Grid>
    </Box>
  )
}

const TQADasboardDesignTop5BestEmployeeYTD = ({ dataTop5DesignBestYTD = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Year - 2024</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop5DesignBestYTD.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}

const TQADasboardDesignTop5BestEmployeeWeek = ({ dataTop5DesignBestWeek = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Week-30</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop5DesignBestWeek.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}

const TQADasboardDesignTop5WorstEmployeeYTD = ({ dataTop5DesignBestYTD = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Year - 2024</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop5DesignBestYTD.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}

const TQADasboardDesignTop5WorstEmployeeWeek = ({ dataTop5DesignWorstWeek = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Week-30</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop5DesignWorstWeek.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}

const TQADasboard3D = () => {
  const [data3D, setData3D] = useState([]);
  const getDataChart = useCallback(async () => {
    try {
      const postData = {
        "module": "PROCESS_3D",
        "start_date": "2021/01/01",
        "end_date": "2025/01/01",
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-pie-chart-data`, postData)
      // console.log(response);
      if (response && response.data.result === "success") {
        const newData = response.data.reply.items.map((val, i) => {
          return { value: val.value, label: val.name, color: setColorSeries(val.name) }
        })
        const newDataDesign = {
          total: response.data.reply.total_sum,
          percent: response.data.reply.percentage,
          data: newData
        }
        setData3D(newDataDesign);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop53DBestWeek, setdataTop53DBestWeek] = useState([]);
  const getDataTop53DBestWeek = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "BEST",
        "module": "PROCESS_3D"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-week`, postData);

      if (response && response.data.result === "success") {
        setdataTop53DBestWeek(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop53DBestYTD, setDataTop53DBestYTD] = useState([]);
  const getDataTop53DBestYTD = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "BEST",
        "module": "PROCESS_3D"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-year`, postData);

      if (response && response.data.result === "success") {
        setDataTop53DBestYTD(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop53DWorstWeek, setDataTop53DWorstWeek] = useState([]);
  const getDataTop53DWorstWeek = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "WORST",
        "module": "PROCESS_3D"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-week`, postData);

      if (response && response.data.result === "success") {
        setDataTop53DWorstWeek(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  const [dataTop53DWorstYTD, setDataTop53DWorstYTD] = useState([]);
  const getDataTop53DWorstYTD = useCallback(async () => {
    try {
      const postData = {
        "start_date": "2020/01/01",
        "end_date": "2024/01/01",
        "top_number": 5,
        "employee_list_type": "WORST",
        "module": "PROCESS_3D"
      };

      const response = await axios.post(`${baseHosting}api/dashboard/get-top-best-worst-sample-production-performance-by-year`, postData);

      if (response && response.data.result === "success") {
        setDataTop53DWorstYTD(response.data.reply || []);
      }
    }
    catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    getDataChart();
    getDataTop53DBestWeek();
    getDataTop53DBestYTD();
    getDataTop53DWorstWeek();
    getDataTop53DWorstYTD();
  }, [])

  return (
    <Box sx={{ ...commonBoxStyles }}>
      <Grid container>
        <Grid xs={6} style={{ textAlign: "left" }}>
          <Box style={{ display: 'flex' }}>
            <Typography style={{ marginLeft: "5px", width: "90px", fontWeight: "bold", fontSize: "20px" }}>3D</Typography>
            <Box sx={{ width: '50%' }}>
              <LinearProgressWithLabelHeader value={data3D.percent} height={20} />
            </Box>
          </Box>
        </Grid>
        <Grid xs={6}>
          <Box style={{ display: 'flex', justifyContent: "right" }}>
            <Typography style={{ marginRight: "5px", fontWeight: "bold", fontSize: "20px" }}>Total Qty</Typography>
            <Typography style={{ marginRight: "5px", fontWeight: "bold", fontSize: "20px", color: "#4AC34A" }}>{data3D.total}</Typography>
          </Box>
        </Grid>
      </Grid>
      <Item>
        <PieChart
          series={[
            {
              arcLabel: (item) => `${item.value}`,
              data: data3D?.data || [],
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: 'white',
              fontWeight: 'bold',
            },
          }}
          {...{ width: 600, height: 425 }}
        />
      </Item>
      <Grid container xs={{ m: 10, p: 10 }}>
        <Grid md={12} xs={12}>
          <Typography style={commonLabelTop5Employee}>Top 5 Best Employees</Typography>
          <TQADasboard3DTop5BestEmployeeYTD dataTop53DBestYTD={dataTop53DBestYTD} />
          <TQADasboard3DTop5BestEmployeeWeek dataTop53DBestWeek={dataTop53DBestWeek} />
        </Grid>
      </Grid>
      <Grid container xs={{ m: 10, p: 10 }}>
        <Grid md={12} xs={12}>
          <Typography style={commonLabelTop5Employee}>Top 5 Worst Employees</Typography>
          <TQADasboard3DTop5WorstEmployeeYTD dataTop53DWorstYTD={dataTop53DWorstYTD} />
          <TQADasboard3DTop5WorstEmployeeWeek dataTop53DWorstWeek={dataTop53DWorstWeek} />
        </Grid>
      </Grid>
    </Box>

  )
}

const TQADasboard3DTop5BestEmployeeYTD = ({ dataTop53DBestYTD = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Year - 2024</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop53DBestYTD.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}

const TQADasboard3DTop5BestEmployeeWeek = ({ dataTop53DBestWeek = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Week-30</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop53DBestWeek.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}

const TQADasboard3DTop5WorstEmployeeYTD = ({ dataTop53DWorstYTD = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Year - 2024</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop53DWorstYTD.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}

const TQADasboard3DTop5WorstEmployeeWeek = ({ dataTop53DWorstWeek = [] }) => {
  return (
    <Box style={{ padding: "10px" }}>
      <Typography style={{ textAlign: "left" }}>By Week-30</Typography>
      <Stack direction="row" spacing={1} justifyContent="flex-start" alignItems="center">
        {
          dataTop53DWorstWeek.map((item) => (<Card>
            <CardMedia
              component="img"
              height="194"
              image="https://mui.com/static/images/avatar/1.jpg"
              alt="Paella dish"
            />
            <CardContent style={{ padding: 3 }}>
              <Typography style={{ fontSize: "11px" }}>{item?.nick_name}</Typography>
              <LinearProgressWithLabel value={item?.performance_avg} height={10} />
            </CardContent>
          </Card>))

        }
      </Stack>
    </Box>
  )
}


const TQADashboard = () => {
  return (
    <Grid container p={1} spacing={2}>
      <Grid xs={12} md={12}>
        <Grid xs={4}>
          <Typography>SAMPLE STATISTICS</Typography>
        </Grid>
        <Grid xs={6}>
          Report Date:

        </Grid>
      </Grid>
      <Grid xs={12} md={4}>
        <TQADasboardDesign />
      </Grid>
      <Grid xs={12} md={4}>
        <TQADasboard3D />
      </Grid>
      <Grid xs={12} md={4}>
        <TQADasboardSampleProduction />
      </Grid>
    </Grid>

  );
};


export default TQADashboard;
