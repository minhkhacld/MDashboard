import { Box, Stack, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
// Components
import Iconify from '../../../../components/Iconify';
import Label from '../../../../components/Label';
import Scrollbar from '../../../../components/Scrollbar';
import IconName from '../../../../utils/iconsName';
// Hooks
import useIsOnline from '../../../../hooks/useIsOnline';
import useLocales from '../../../../hooks/useLocales';
// Config
import { PATH_APP } from '../../../../routes/paths';

const AuditLines = ({ isViewOnly, currentTodoItem, height }) => {
  // Hooks
  const { translate } = useLocales();
  const theme = useTheme();


  const ItemTemplate = ({ data, index }) => {
    return (
      <Box
        component={Link}
        to={PATH_APP.compliance.audit.section(currentTodoItem.id)}
        state={{ item: data, isViewOnly }}
        replace={false}
        sx={{
          padding: '8px 4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          ...(index !== 0 && {
            borderTopWidth: 0.1,
            borderColor: (theme) => theme.palette.grey[300],
          })
        }}
      >
        <Stack
          direction="row"
          justifyContent="flex-start"
          alignItems={'center'}
          width="100%"
          height={'100%'}
          spacing={2}
          id={`list-item-link-${data?.Id}`}
          sx={{
            draggable: false,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <Stack
            direction="column"
            justifyContent="center"
            alignItems={'center'}
            height={'100%'}
            bgcolor="AppWorkspace"
          >
            <CustomIcon data={data} icon={IconName.checked} />
          </Stack>
          <Stack direction="row" justifyContent="center" alignItems={'center'} height="100%" textAlign={'left'}>
            <Typography variant="subtitle" paragraph fontWeight={'bold'} whiteSpace={'normal'} sx={{ margin: 'auto' }}>
              {data?.Section}
            </Typography>
          </Stack>
        </Stack>

        {
          data?.Items.length > 0 &&
          <Box>
            <Label variant='filled' color='info'>{data?.Items.length}</Label>
          </Box>
        }

      </Box>
    );
  };

  const dataSource = currentTodoItem?.Sections || [];

  // console.log(dataSource);

  return (
    // <List
    //   dataSource={currentTodoItem?.Sections || []}
    //   itemComponent={(data) => <ItemTemplate data={data.data} index={data.index} />}
    //   // {...(theme.breakpoints.only('lg') && {
    //   //   height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
    //   //     SPACING +
    //   //     ANDROID_KEYBOARD +
    //   //     TAB_HEIGHT +
    //   //     TAB_HEIGHT
    //   //     }px)`,
    //   // })}
    //   // {...(theme.breakpoints.only('md') && {
    //   //   height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BUTTON_GROUP}px)`,
    //   // })}
    //   // {...(theme.breakpoints.only('xs') && {
    //   //   height: `calc(100vh - ${HEADER.MOBILE_HEIGHT + SPACING + ANDROID_KEYBOARD + TAB_HEIGHT + BUTTON_GROUP}px)`,
    //   // })}
    //   {...(theme.breakpoints.only('lg') && {
    //     height: height.lg
    //   })}
    //   {...(theme.breakpoints.only('sm') && {
    //     height: height.sm,
    //   })}
    //   {...(theme.breakpoints.only('xs') && {
    //     height: height.xs,
    //   })}
    //   scrollingEnabled
    //   noDataText={translate('noDataText')}
    //   className="compliance-audit-section-list"
    //   showScrollbar={'onScroll'}
    // />
    <Box p={1}>
      <Scrollbar>
        <Stack
          sx={{
            draggable: false,
            overflowX: 'hidden',
            paddingBottom: 15,
            height: {
              lg: height.lg,
              md: height.md,
              xs: height.xs,
            },
          }}
        >
          {dataSource.length > 0 && dataSource !== undefined &&
            [...dataSource]?.sort((a, b) => Number(a?.IsFinished) - Number(b?.IsFinished)).map((item, index) => {
              return (
                <ItemTemplate
                  key={index}
                  data={item}
                  index={index}
                />
              );
            })}

          {dataSource.length === 0 && (
            <Box mt={1}>
              <Typography variant="subtitle2">{translate('noDataText')}</Typography>
            </Box>
          )}

        </Stack>
      </Scrollbar >
    </Box>
  );
};

export default AuditLines;

// Custom icon for offline mode
const CustomIcon = ({ icon, data }) => {
  const { online } = useIsOnline();
  const theme = useTheme();
  if (online) {
    return (
      <Iconify
        icon={IconName.checked}
        sx={{
          fontSize: 20,
          color: data?.IsFinished ? theme.palette.compliance.success : theme.palette.grey[500],
        }}
      />
    );
  }

  if (icon === IconName.checked) {
    return (
      <Box
        sx={{
          width: 20,
          height: 20,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path
            fill={data?.IsFinished ? theme.palette.compliance.success : theme.palette.grey[500]}
            fillRule="evenodd"
            d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11s11-4.925 11-11S18.075 1 12 1Zm4.768 9.14a1 1 0 1 0-1.536-1.28l-4.3 5.159l-2.225-2.226a1 1 0 0 0-1.414 1.414l3 3a1 1 0 0 0 1.475-.067l5-6Z"
            clipRule="evenodd"
          />
        </svg>
      </Box>
    );
  }
};
