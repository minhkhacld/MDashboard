import { Capacitor } from '@capacitor/core';
import { capitalCase } from 'change-case';
import { LoadPanel, Position } from 'devextreme-react/load-panel';
import _ from 'lodash';
import moment from 'moment';
import { useEffect, useState } from 'react';
// @mui
import { Box, Card, Container, Divider, Grid, Stack, TextField, Typography, useTheme } from '@mui/material';
// devextreme
import { List, SearchEditorOptions } from 'devextreme-react/list';
import fx from 'devextreme/animation/fx';
// Redux
import Page from '../../../components/Page';
import { useSelector } from '../../../redux/store';
// routes
import { PATH_APP } from '../../../routes/paths';
// hooks
import useFormatNumber from '../../../hooks/useFormatNumber';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import useSettings from '../../../hooks/useSettings';
// components
import HeaderBreadcrumbs from '../../../components/HeaderBreadcrumbs';
import Iconify from '../../../components/Iconify';
import LightboxModal from '../../../components/LightboxModal';
import Scrollbar from '../../../components/Scrollbar';
import { HEADER } from '../../../config';
import axios from '../../../utils/axios';
import IconName from '../../../utils/iconsName';
import Label from './Label';
import ProductDocument from './ProductDocuments';
// ENtityList

// ----------------------------------------------------------------------

export default function FactoryCertificate() {
  // Hooks
  const { fShortenNumber } = useFormatNumber();
  const { translate } = useLocales();
  const { themeStretch } = useSettings();
  const mdUp = useResponsive('up', 'md');
  const smUp = useResponsive('up', 'sm');
  const lgUp = useResponsive('up', 'lg');
  // redux
  const reduxData = useSelector((store) => store.compliance);
  const theme = useTheme();

  // components state
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  // Devextreme store;
  const getDataSource = () => {
    setLoading(true);
    return axios.get('/api/FactoryCertificateMobileApi/GetFactoryCertificateList', {});
  };

  useEffect(() => {
    getDataSource()
      .then((result) => {
        // console.log(result.data.data);
        const factory = _.chain(result.data.data)
          .groupBy((factory) => factory.Factory)
          .map((items, key) => ({ items, key }))
          .filter((item) => item.items[0].Lines.length > 0)
          .value();
        setSource(factory);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      })
      .finally(() => {
        // setIsViewAll(false);
        setLoading(false);
      });
  }, []);

  // useEffect(() => {
  //   const listPlanning = document.getElementById('list-planing');
  //   const btnGroup = document.getElementById('custom-button-group');
  //   const breacrumb = document.getElementById('header-breacrumb');
  //   if (listPlanning !== null && listPlanning !== undefined) {
  //     listPlanning.style.height = `${
  //       window.screen.height -
  //       (lgUp ? 280 : HEADER.MOBILE_HEIGHT) -
  //       breacrumb.getBoundingClientRect().height -
  //       50 -
  //       btnGroup.getBoundingClientRect().height - ANDROID_KEYBOARD - SPACING
  //     }px`;
  //   }
  // }, []);

  const filterDataSource = () => {
    let result = [];
    const newDataSource = JSON.parse(JSON.stringify([...source]));
    if (searchValue === '') {
      result = newDataSource;
      return result;
    }
    newDataSource.forEach((fty) => {
      if (fty.key.toLowerCase().includes(searchValue.toLowerCase())) {
        result = [...result, fty];
      } else {
        const newItems = [...fty.items];
        const foundItem = newItems[0].Lines.filter((d) => d.Name.toLowerCase().includes(searchValue.toLowerCase()));
        if (foundItem.length > 0) {
          newItems[0].Lines = foundItem;
          result = [
            ...result,
            {
              ...fty,
              items: newItems,
            },
          ];
        }
      }
    });
    return result;
  };

  const listSource = filterDataSource();

  // RENDER LIST
  const ItemTemplate = ({ data }) => {
    const [openLightbox, setOpenLightbox] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [currentCertificate, setCurrentCertificate] = useState();
    const handleShowAttachment = (line) => {
      setCurrentCertificate(currentCertificate === line?.Id ? null : line?.Id);
    };
    return (
      <>
        <Scrollbar sx={{ height: 200 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            sx={{ position: 'relative', padding: 0 }}
            pl={smUp ? 1 : 0}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
                <Typography variant="subtitle" paragraph color="black" fontWeight={'bold'} mb={0}>
                  Certificate List
                </Typography>
              </Grid>
              <Grid item xs={8} md={10}>
                <Typography variant="caption" paragraph color="green" mb={0}>
                  Name
                </Typography>
              </Grid>
              <Grid item xs={4} md={2}>
                <Typography variant="caption" paragraph color="green" mb={0}>
                  Expired Date
                </Typography>
              </Grid>
              {data?.Lines.sort((a, b) => new Date(b.ExpiredDate) - new Date(a.ExpiredDate)).map((line) => {
                const imagesLightbox =
                  line?.Attachments === []
                    ? []
                    : line?.Attachments.filter((d) => {
                      function extension(filename) {
                        const r = /.+\.(.+)$/.exec(filename);
                        return r ? r[1] : null;
                      }
                      const fileExtension = extension(d.Name);
                      const isImage =
                        fileExtension === null
                          ? false
                          : ['jpeg', 'png', 'jpg', 'gif'].includes(fileExtension.toLowerCase());
                      return isImage;
                    }).map((_image) => `${_image.URL}`);
                return (
                  <Grid container spacing={2} sx={{ paddingLeft: 2, mt: 0.75 }} key={line?.Id}>
                    <Grid
                      container
                      spacing={2}
                      sx={{ paddingLeft: 2, mt: 0.75 }}
                      onClick={() => handleShowAttachment(line)}
                    >
                      <Grid item xs={8} md={10}>
                        <Typography variant="caption" paragraph color="black" fontWeight={'bold'} mb={0}>
                          {line?.Name}
                        </Typography>
                      </Grid>
                      <Grid item xs={4} md={2}>
                        <Typography
                          variant="caption"
                          paragraph
                          color={() => {
                            if (new Date(line?.ExpiredDate) < new Date()) {
                              return '#FF0000';
                            }
                            if (
                              (new Date(line?.ExpiredDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24) >
                              30
                            ) {
                              return '#00AB55';
                            }
                            return '#FF980E';
                          }}
                          fontWeight={'bold'}
                          mb={0}
                        >
                          {moment(line?.ExpiredDate).format('DD MMM YYYY')}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={12}>
                        <Divider />
                      </Grid>
                    </Grid>
                    <Grid container sx={{ paddingLeft: 3 }}>
                      {currentCertificate === line?.Id ? (
                        <>
                          <Grid item xs={12} md={12}>
                            <ProductDocument
                              WFInstanceDocument={line?.Attachments}
                              setOpenLightbox={setOpenLightbox}
                              setSelectedImage={setSelectedImage}
                              imagesLightbox={imagesLightbox}
                            />
                          </Grid>
                        </>
                      ) : null}
                      <LightboxModal
                        images={imagesLightbox}
                        mainSrc={imagesLightbox[selectedImage]}
                        photoIndex={selectedImage}
                        setPhotoIndex={setSelectedImage}
                        isOpen={currentCertificate === line?.Id && openLightbox}
                        onCloseRequest={() => setOpenLightbox(false)}
                      />
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Stack>
        </Scrollbar>
      </>
    );
  };

  const GroupRender = (data) => {
    return (
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems={'center'} pl={smUp ? 1 : 0} spacing={2}>
          <Stack direction="column" justifyContent="flex-start">
            <Typography variant="subtext2">{`${capitalCase(data?.key)}`}</Typography>
          </Stack>
          <Stack direction="column" sx={{ width: mdUp ? 200 : 100 }} justifyContent="flex-start">
            <Box>
              <Label color={'#00AB5580'}>{data.items[0].CountValidOver30d}</Label>
              <Label color={'#FF980E80'} sx={{ m: 0.25 }}>
                {data.items[0].CountValidIn30d}
              </Label>
              <Label color={'#FF000080'}>{data.items[0].CountExpired}</Label>
            </Box>
          </Stack>
        </Stack>
      </Box>
    );
  };

  const BREAKCRUM_HEIGHT = 78;
  const SPACING = 30;
  const ANDROID_KEYBOARD = Capacitor.getPlatform() === 'android' ? 0 : 0;
  const TAB_HEIGHT = 48;
  const IOS_KEYBOARD = Capacitor.getPlatform() === 'ios' ? 16 : 0;
  const checkNotch = () => {
    const iPhone = /iPhone/.test(navigator.userAgent) && !window.MSStream;
    const aspect = window.screen.width / window.screen.height;
    if (iPhone && aspect.toFixed(3) === '0.462') {
      // I'm an iPhone X or 11...
      return 55;
    }
    return 0;
  };
  const NOTCH_HEIGHT = checkNotch();

  return (
    <Page title={'Factory Certificate'}>
      <Container maxWidth={themeStretch ? false : 'lg'} sx={{ p: 1, pt: 0, position: mdUp ? 'relative' : 'fixed' }}>
        <HeaderBreadcrumbs
          heading={'Factory Certificate'}
          links={[{ name: translate('home'), href: PATH_APP.general.app }, { name: 'Factory Certificate' }]}
        />
        <Box flex={1} id="aprroval-card">
          <Card
            sx={{
              // height: 'auto',
              height: {
                xs: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD
                  }px)`,
                sm: `calc(100vh - ${HEADER.MOBILE_HEIGHT + BREAKCRUM_HEIGHT + ANDROID_KEYBOARD + NOTCH_HEIGHT + IOS_KEYBOARD
                  }px)`,
                lg: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
                  // HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT +
                  BREAKCRUM_HEIGHT +
                  // SPACING +
                  ANDROID_KEYBOARD
                  }px)`,
              },
              minHeight: '65vh',
            }}
          >
            <Divider />
            <Box sx={{ p: 1 }}>
              <Stack
                direction={'row'}
                alignItems={'center'}
                spacing={2}
                mb={1}
                paddingLeft={smUp ? 3 : 0}
                id="custom-button-group"
              >
                <Grid container spacing={1}>
                  <Grid item xs={4} md={5}>
                    <Label color={'#00AB5580'} />
                    <Typography
                      variant="caption"
                      sx={{
                        paddingLeft: 1,
                      }}
                    >
                      Valid over 30d
                    </Typography>
                  </Grid>
                  <Grid item xs={5} md={5}>
                    <Label color={'#FF980E80'} />
                    <Typography
                      variant="caption"
                      sx={{
                        paddingLeft: 1,
                      }}
                    >
                      Expire within 30d
                    </Typography>
                  </Grid>
                  <Grid item xs={3} md={2}>
                    <Label color={'#FF000080'} />
                    <Typography
                      variant="caption"
                      sx={{
                        paddingLeft: 1,
                      }}
                    >
                      Expired
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>

              {/* // Custom textfield */}

              <List
                // dataSource={source !== undefined ? source : []}
                dataSource={listSource}
                itemComponent={ItemTemplate}
                // searchExpr={['Factory', 'CertificateName']}
                {...(theme.breakpoints.only('lg') && {
                  height: `calc(100vh - ${HEADER.DASHBOARD_DESKTOP_HEIGHT +
                    HEADER.DASHBOARD_DESKTOP_OFFSET_HEIGHT +
                    BREAKCRUM_HEIGHT +
                    SPACING +
                    ANDROID_KEYBOARD
                    }px)`,
                })}
                {...(theme.breakpoints.only('md') && {
                  height: `calc(100vh - ${HEADER.MOBILE_HEIGHT +
                    BREAKCRUM_HEIGHT +
                    SPACING +
                    ANDROID_KEYBOARD +
                    TAB_HEIGHT +
                    NOTCH_HEIGHT +
                    IOS_KEYBOARD
                    }px)`,
                })}
                {...(theme.breakpoints.only('xs') && {
                  height: `calc(100vh - ${HEADER.MOBILE_HEIGHT +
                    BREAKCRUM_HEIGHT +
                    SPACING +
                    ANDROID_KEYBOARD +
                    TAB_HEIGHT +
                    NOTCH_HEIGHT +
                    IOS_KEYBOARD
                    }px)`,
                })}
                grouped
                searchEnabled
                // height={smUp ? '62vh' : '68vh'}
                id="list-planing"
                scrollingEnabled
                style={{ paddingBottom: 20 }}
                searchMode={'contains'}
                noDataText={translate('noDataText')}
                focusStateEnabled={false}
                collapsibleGroups
                groupRender={GroupRender}
                onInitialized={(e) => {
                  fx.off = true;
                }}
                onContentReady={(e) => {
                  setTimeout(() => {
                    fx.off = false;
                  }, 2000);
                }}
                onGroupRendered={(e) => {
                  if (searchValue !== '') {
                    listSource.forEach((_, index) => {
                      e.component.expandGroup(index);
                    });
                  }
                  if (listSource?.length > 1 && searchValue === '') {
                    e.component.collapseGroup(e.groupIndex);
                  }
                }}
              >
                <SearchEditorOptions
                  placeholder={`${translate('search')}  FactoryName, CertificateName`}
                  showClearButton
                  value={searchValue}
                  onValueChanged={(e) => {
                    setSearchValue(e.value);
                  }}
                />
              </List>
            </Box>
          </Card>

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
        </Box>
      </Container>
    </Page>
  );
}

// Render Input
const RenderInput = ({ params, label }) => {
  return (
    <TextField
      {...params}
      fullWidth
      onFocus={(event) => {
        event.target.select();
      }}
      size="small"
      label={
        <Stack direction="row" justifyContent="center" alignItems="center">
          <Iconify icon={IconName.search} />
          <p className="ml-1">{label}</p>
        </Stack>
      }
      InputLabelProps={{
        style: { color: 'var(--label)' },
        shrink: true,
      }}
    />
  );
};
