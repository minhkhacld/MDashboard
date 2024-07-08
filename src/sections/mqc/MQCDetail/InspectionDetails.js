import { Capacitor } from '@capacitor/core';
import { Grid, Stack, Typography, useTheme } from '@mui/material';
import { List } from 'devextreme-react/list';
import PropTypes from 'prop-types';
import { HEADER, NOTCH_HEIGHT } from '../../../config';

InspectionDetails.propTypes = {
  data: PropTypes.array,
  setModalContent: PropTypes.func,
};

// Variable for responsive
const BREAKCRUM_HEIGHT = 40;
const SPACING = 40;
const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
const TAB_HEIGHT = 48;

function InspectionDetails({ data, setModalContent, translate }) {
  // theme
  const theme = useTheme();

  const itemTemplate = (data) => {
    return (
      <Stack
        onClick={() => {
          setModalContent({ visible: true, item: data, isAddNew: false });
        }}
        sx={{ position: 'relative', padding: 0 }}
      >
        <Grid container spacing={2} sx={{ p: 1 }}>
          <Grid item xs={6} md={6}>
            <Typography
              variant="caption"
              component={'p'}
              paragraph
              fontWeight={'bold'}
              display={'inline'}
            >{`Roll No:`}</Typography>
            <Typography variant="caption" component={'p'} paragraph display={'inline'}>
              {data?.RollNo !== null ? ` ${data?.RollNo}` : ` N/A`}
            </Typography>
          </Grid>
          <Grid item xs={6} md={6}>
            <Typography
              variant="caption"
              paragraph
              fontWeight={'bold'}
              display={'inline'}
            >{`Roll Penalty Point:`}</Typography>
            <Typography variant="caption" paragraph display={'inline'}>
              {data?.RollPenaltyPoint !== null ? ` ${data?.RollPenaltyPoint}` : ` N/A`}
            </Typography>
          </Grid>
          <Grid item xs={6} md={6}>
            <Typography
              variant="caption"
              paragraph
              fontWeight={'bold'}
              display={'inline'}
            >{`Actual Quantity:`}</Typography>
            <Typography variant="caption" paragraph display={'inline'}>
              {data?.ActQuantity !== null ? ` ${data?.ActQuantity}` : ` N/A`}
            </Typography>
          </Grid>
          <Grid item xs={6} md={6}>
            <Typography
              variant="caption"
              paragraph
              fontWeight={'bold'}
              display={'inline'}
            >{`Actual Witdth:`}</Typography>
            <Typography variant="caption" paragraph display={'inline'}>
              {data?.ActualWidth !== null ? ` ${data?.ActualWidth}` : ` N/A`}
            </Typography>
          </Grid>
        </Grid>
      </Stack>
    );
  };

  return (
    <>
      <List
        dataSource={data}
        itemRender={itemTemplate}
        height={'65vh'}
        noDataText={translate('noDataText')}
        // searchExpr={['SysNo']}
        {...(theme.breakpoints.only('lg') && {
          height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
            HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT +
            BREAKCRUM_HEIGHT +
            SPACING +
            ANDROID_KEYBOARD +
            TAB_HEIGHT +
            TAB_HEIGHT +
            NOTCH_HEIGHT +
            SPACING
            }px)`,
        })}
        {...(theme.breakpoints.only('md') && {
          height: `calc(100vh - ${HEADER.MOBILE_HEIGHT +
            BREAKCRUM_HEIGHT +
            SPACING +
            ANDROID_KEYBOARD +
            TAB_HEIGHT +
            TAB_HEIGHT +
            NOTCH_HEIGHT +
            SPACING
            }px)`,
        })}
        {...(theme.breakpoints.only('xs') && {
          height: `calc(100vh - ${HEADER.MOBILE_HEIGHT +
            BREAKCRUM_HEIGHT +
            SPACING +
            ANDROID_KEYBOARD +
            TAB_HEIGHT +
            TAB_HEIGHT +
            NOTCH_HEIGHT +
            SPACING
            }px)`,
        })}
      />
    </>
  );
}

export default InspectionDetails;
