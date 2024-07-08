import { Capacitor } from '@capacitor/core';
import { Box, Grid, Stack, Typography, useTheme } from '@mui/material';
import { List } from 'devextreme-react/list';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// components
import Image from './Image';
// redux
import { useSelector } from '../../../redux/store';
// redux
import { HEADER, NOTCH_HEIGHT, QC_ATTACHEMENTS_HOST_API } from '../../../config';

DefectList.propTypes = {
  data: PropTypes.array,
  setModalContent: PropTypes.func,
  translate: PropTypes.func,
  AttachmentsData: PropTypes.array,
  isViewOnly: PropTypes.bool,
};

// Variable for responsive
const BREAKCRUM_HEIGHT = 40;
const SPACING = 24;
const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 16 : 0;
const TAB_HEIGHT = 48;

function DefectList({ data, setModalContent, translate, AttachmentsData, isViewOnly }) {
  // hook
  const [dataSource, setDataSource] = useState();
  // theme
  const theme = useTheme();
  // redux
  const { currentRootId } = useSelector((store) => store.mqc);

  useEffect(() => {
    setDataSource(data);
  }, [data]);

  const itemTemplate = (data) => {
    // data
    const attachments = isViewOnly
      ? data?.Images
      : AttachmentsData?.filter(
          (attachment) =>
            data?.Images?.map((img) => img?.id)?.indexOf(attachment?.id) >= 0 && attachment?.Action !== 'Delete'
        );

    return (
      <Stack
        onClick={() => {
          setModalContent({ visible: true, item: data, isAddNew: false });
        }}
        sx={{ position: 'relative', padding: 0 }}
      >
        <Grid container spacing={2} sx={{ p: 1 }} justifyContent={'center'} alignItems={'center'}>
          <Grid item xs={6} md={6}>
            <Typography
              variant="caption"
              paragraph
              sx={{ wordBreak: 'break-word' }}
              display={'inline'}
              whiteSpace={'normal'}
            >
              {`${data?.DefectDataName}`}
            </Typography>
          </Grid>
          <Grid sx={{ alignItems: 'center' }} item xs={6} md={6}>
            {attachments?.length === 0 ||
            attachments?.filter((value) => value?.Action === 'Delete').length === attachments?.length ? (
              <>
                <Typography variant="caption" paragraph display={'inline'} sx={{ textDecoration: 'underline' }}>
                  {translate('mqc.error.noImage2')}
                </Typography>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    p: 0,
                    ml: 4,
                    width: 80,
                    height: 80,
                    borderRadius: 1.25,
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'inline-flex',
                    border: (theme) => `solid 1px ${theme.palette.divider}`,
                  }}
                >
                  <Image
                    alt="preview"
                    src={
                      attachments?.find((value) => value?.Action !== 'Delete')?.Data
                        ? `${attachments?.find((value) => value?.Action !== 'Delete')?.Data}`
                        : `${QC_ATTACHEMENTS_HOST_API}/${
                            attachments?.find((value) => value?.Action !== 'Delete')?.Guid
                          }`
                    }
                    numberImage={attachments?.filter((value) => value?.Action !== 'Delete')?.length - 1}
                    ratio="1/1"
                  />
                </Box>
              </>
            )}
          </Grid>
        </Grid>
      </Stack>
    );
  };

  return (
    <>
      <List
        dataSource={dataSource}
        itemRender={itemTemplate}
        height={'65vh'}
        noDataText={translate('noDataText')}
        {...(theme.breakpoints.only('lg') && {
          height: `calc(100vh - ${
            HEADER.DASHBOARD_DESKTOP_HEIGHT +
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
          height: `calc(100vh - ${
            HEADER.MOBILE_HEIGHT +
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
          height: `calc(100vh - ${
            HEADER.MOBILE_HEIGHT +
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

export default DefectList;
