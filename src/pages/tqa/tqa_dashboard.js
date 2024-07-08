import * as React from 'react';
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

const dataDashboarDesign = [
  { value: 10, label: 'Planning' },
  { value: 15, label: 'UnAssigned' },
  { value: 75, label: 'Assigned' },
];

const dataDashboard3D= [
  { value: 80, label: 'Finish' },
  { value: 67, label: 'Planning' },
  { value: 10, label: 'Making' },
];

const dataDashboardSampleProduction= [
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
  display:'flex',
  border:'1px',
  color: theme.palette.text.secondary,
}));

const commonBoxStyles = {
  m: 1,
  boxShadow: 2,
  borderRadius: '5px',
};

const commonLabelTop5Employee = {
  textAlign:"left",
  fontSize:"20px",
  color:"#5ba3e1",
  background:"#d3ebff",
  marginTop:"10px 0px"
}

const commonLabelSmallChart = (item) => {
  return item.value;
}
const commonSizeLabelSmallChart = () => {
  return {
    [`& .${pieArcLabelClasses.root}`]: {
      fontSize: 10,
      fill:'white'
    },
  }
}


function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} color="secondary" style={{height:props.height}} />
      </Box>
      <Box sx={{ minWidth: 35}}>
        <Typography variant="body2" color="text.black" style={{marginTop:5}}>{`${Math.round(
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

const TQADasboardSampleProduction = () => {
  return (
    <Box  sx={{ ...commonBoxStyles}}>
    <Grid container>
        <Grid xs={7} style={{textAlign:"left" }}>
            <Box style={{ display:'flex'}}>
              <Typography style={{marginLeft:"5px",width:"200px",fontWeight:"bold",fontSize:"16px"}}>Sample Production</Typography>
              <Box sx={{ width: '50%' }}>
                <LinearProgressWithLabel value={80} height={20} />
              </Box>
            </Box>
        </Grid>
        <Grid xs={5}>
          <Box style={{ display:'flex',justifyContent:"right"}}>
            <Typography style={{marginRight:"5px",fontWeight:"bold",fontSize:"20px"}}>Total Qty:</Typography>
            <Typography style={{marginRight:"5px",fontWeight:"bold",fontSize:"20px",color:"#4AC34A"}}>100</Typography>
          </Box>
        </Grid>
    </Grid>
    <Item> 
        <PieChart
          series={[
            {
              arcLabel: (item) => `${item.value} %`,
              data:dataDashboardSampleProduction,
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: 'white',
              fontWeight: 'bold',
            },
          }}
          {...{ width: 600, height: 425}}
      />
    </Item>
  </Box>

  )
}

const TQADasboardDesign = () => {
  return(
    <Box  sx={{ ...commonBoxStyles }}>
      <Grid container>
          <Grid xs={6} style={{textAlign:"left" }}>
              <Box style={{ display:'flex'}}>
                <Typography style={{marginLeft:"5px",width:"90px",fontWeight:"bold",fontSize:"20px"}}>Design</Typography>
                <Box sx={{ width: '50%' }}>
                  <LinearProgressWithLabel value={90} height={20} />
                </Box>
              </Box>
          </Grid>
          <Grid xs={6}>
            <Box style={{ display:'flex',justifyContent:"right"}}>
              <Typography style={{marginRight:"5px",fontWeight:"bold",fontSize:"20px"}}>Total Qty</Typography>
              <Typography style={{marginRight:"5px",fontWeight:"bold",fontSize:"20px",color:"#4AC34A"}}>100</Typography>
            </Box>
          </Grid>
      </Grid>
      <Item> 
          <PieChart
            series={[
              {
                arcLabel: (item) => `${item.value}`,
                data:dataDashboarDesign,
              },
            ]}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: 'white',
                fontWeight: 'bold',
              },
            }}
            {...{ width: 500, height: 200}}
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
                    data:dataSmallChart,
                  },
                ]}
                margin={{ right: 2 }}
                width={widthSmallChart}
                height={200}
                sx={commonSizeLabelSmallChart}
                legend={{ hidden: true }}
              />
            </Item>
            <Typography style={{textAlign:"center"}}>Tech Pack</Typography>
          </Grid>
          <Grid md={4} xs={12}> 
            <Item>
            <PieChart
                series={[
                  {
                    arcLabel: commonLabelSmallChart,
                    innerRadius: 40,
                    outerRadius: 80,
                    data:dataSmallChart,
                  },
                ]}
                margin={{ right: 2 }}
                width={widthSmallChart}
                height={200}
                legend={{ hidden: true }}
                sx={commonSizeLabelSmallChart}
              />
            </Item> 
            <Typography style={{textAlign:"center"}}>Pattern</Typography>
          </Grid>
          <Grid md={4} xs={12}> 
            <Item>
            <PieChart
                series={[
                  {
                    arcLabel: commonLabelSmallChart,
                    innerRadius: 40,
                    outerRadius: 80,
                    data:dataSmallChart,
                  },
                ]}
                margin={{ right: 1 }}
                width={widthSmallChart}
                height={200}
                legend={{ hidden: true }}
                sx={commonSizeLabelSmallChart}
              />
            </Item> 
            <Typography style={{textAlign:"center"}}>Consumtion</Typography>
          </Grid>
      </Grid>
      <Grid container xs={{m:10}}>
          <Grid md={12} xs={12}> 
          <Typography style={commonLabelTop5Employee}>Top 5 Besst Employees</Typography>
            <Box>
              <Typography style={{textAlign:"left"}}>YTD-2024</Typography>
              <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
              <Card>
                <CardMedia
                    component="img"
                    height="194"
                    image="https://mui.com/static/images/avatar/1.jpg"
                    alt="Paella dish"
                  />
                <CardContent style={{padding:10}}>
                <Typography style={{fontSize:"10px"}}>Remy Sharp 1</Typography>
                <LinearProgressWithLabel value={90} height={10}/>
                </CardContent>
              </Card>
              <Card>
              <CardMedia
                    component="img"
                    height="194"
                    image="https://mui.com/static/images/avatar/1.jpg"
                    alt="Paella dish"
                  />
                <CardContent style={{padding:10}}>
                <Typography style={{fontSize:"10px"}}>Remy Sharp 2</Typography>
                <LinearProgressWithLabel value={90} height={10}/>
                </CardContent>
              </Card>
              <Card>
              <CardMedia
                    component="img"
                    height="194"
                    image="https://mui.com/static/images/avatar/1.jpg"
                    alt="Paella dish"
                  />
                <CardContent style={{padding:10}}>
                <Typography style={{fontSize:"10px"}}>Remy Sharp 3</Typography>
                <LinearProgressWithLabel value={90} height={10}/>
                </CardContent>
              </Card>
              <Card>
              <CardMedia
                    component="img"
                    height="194"
                    image="https://mui.com/static/images/avatar/1.jpg"
                    alt="Paella dish"
                  />
                <CardContent style={{padding:10}}>
                <Typography style={{fontSize:"10px"}}>Remy Sharp 4</Typography>
                <LinearProgressWithLabel value={90} height={10}/>
                </CardContent>
              </Card>
              <Card>
              <CardMedia
                    component="img"
                    height="194"
                    image="https://mui.com/static/images/avatar/1.jpg"
                    alt="Paella dish"
                  />
                <CardContent style={{padding:10}}>
                <Typography style={{fontSize:"10px"}}>Remy Sharp 5</Typography>
                <LinearProgressWithLabel value={90} height={10}/>
                </CardContent>
              </Card>
              </Stack>
            </Box>

          </Grid>
         
      </Grid>
    </Box>
  )
}

const TQADasboard3D = () => {

  return (
    <Box  sx={{ ...commonBoxStyles}}>
    <Grid container>
        <Grid xs={6} style={{textAlign:"left" }}>
            <Box style={{ display:'flex'}}>
              <Typography style={{marginLeft:"5px",width:"90px",fontWeight:"bold",fontSize:"20px"}}>3D</Typography>
              <Box sx={{ width: '50%' }}>
                <LinearProgressWithLabel value={50.9} height={20} />
              </Box>
            </Box>
        </Grid>
        <Grid xs={6}>
          <Box style={{ display:'flex',justifyContent:"right"}}>
            <Typography style={{marginRight:"5px",fontWeight:"bold",fontSize:"20px"}}>Total Qty</Typography>
            <Typography style={{marginRight:"5px",fontWeight:"bold",fontSize:"20px",color:"#4AC34A"}}>157</Typography>
          </Box>
        </Grid>
    </Grid>
    <Item> 
        <PieChart
          series={[
            {
              arcLabel: (item) => `${item.value}`,
              data:dataDashboard3D,
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: 'white',
              fontWeight: 'bold',
            },
          }}
          {...{ width: 600, height: 425}}
      />
    </Item>
  </Box>

  )
}

const TQADashboard = () => {
  return (
    <Grid container p={1} spacing={2}>
      <Grid xs={12} md={4}>
        <TQADasboardDesign/>
      </Grid>
    
      <Grid xs={12}  md={4}>
        <TQADasboard3D/>
      </Grid>
      <Grid xs={12}  md={4}>
        <TQADasboardSampleProduction/>
      </Grid>
    </Grid>
   
  );
};

export default TQADashboard;
