import { LoadingButton } from '@mui/lab';
import {
  Box,
  Divider,
  Stack
} from '@mui/material';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useDetectKeyboardOpen from 'use-detect-keyboard-open';
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import DetailSummary from './DetailSummary';
// COMPONENTS
import { db } from '../../../Db';
// compoents
import CustomList from './packing-and-labeling-items/CustomList';


const options = ['Required', 'Have Image', 'No Image'];

PackingAndLabel.propTypes = {
  theme: PropTypes.any,
  currentInspection: PropTypes.object,
  isViewOnly: PropTypes.bool,
  handleNext: PropTypes.func,
  packingMethodEnum: PropTypes.any,
};

function PackingAndLabel({
  theme,
  currentInspection,
  isViewOnly,
  handleNext,
  packingMethodEnum,
}) {

  // Hooks
  const { translate } = useLocales();
  const smUp = useResponsive('up', 'sm');
  const { enqueueSnackbar } = useSnackbar();
  const isKeyboardOpen = useDetectKeyboardOpen();


  const [filter, setFilter] = useState({
    required: false,
    haveImage: false,
    noImage: false,
  });
  const [btnVisible, setBtnVisible] = useState(false);


  useEffect(() => {
    (async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBtnVisible(true)
    })()
  }, []);


  // SET STEP COMPLETE
  const setCompleteStep = async () => {
    try {
      // CHECK STEP PACKING MUST COMPLETE BEFORE ANY PROCCESSING

      if (!currentInspection?.Status.Packing && !currentInspection?.Status.PackingAndLabeling) {
        return enqueueSnackbar(translate('qcs.packing.required'), {
          variant: 'error',
          autoHideDuration: 5000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
      };

      const filterByPackingMethod = [...currentInspection?.PackingAndLabelings].filter(d => {
        if (currentInspection.Packing.PackingMethod !== null && currentInspection.Status.Packing) {
          return d?.PackingMethodParentId === currentInspection.Packing?.ParentId
        } return false;
      });
      const checkRequiredLinesEmtyImages = filterByPackingMethod.filter(d => {
        const filterEmtyImage = d.Images.filter(v => v.Action !== "Delete");
        return d.IsRequired && filterEmtyImage.length > 0
      });
      const requiredList = filterByPackingMethod.filter(d => d.IsRequired);
      // console.log(requiredList, checkRequiredLinesEmtyImages);
      const hasError = requiredList.length - checkRequiredLinesEmtyImages.length > 0;
      if (hasError && !currentInspection?.Status?.PackingAndLabeling) {
        enqueueSnackbar(translate('qcs.packingAndLabeling.required'), {
          variant: 'error',
          autoHideDuration: 5000,
          anchorOrigin: {
            vertical: 'top',
            horizontal: 'center',
          },
        });
        return;
      }
      if (!currentInspection?.Status.PackingAndLabeling && !hasError) {
        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            // console.log('default', x, ref);
            // Set Step complete
            ref.value.Status.PackingAndLabeling = !currentInspection?.Status?.PackingAndLabeling;

          });
        // carouselRef.current?.slickNext();
        handleNext();
      } else {
        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            // console.log('default', x, ref);
            // Set Step complete
            ref.value.Status.PackingAndLabeling = !currentInspection?.Status?.PackingAndLabeling;
          });
      }
    } catch (error) {
      console.error(error);
      // enqueueSnackbar(JSON.stringify(error), {
      //   variant: 'error',
      //   autoHideDuration: 8000,
      //   anchorOrigin: {
      //     vertical: 'top',
      //     horizontal: 'center',
      //   },
      // });
    }
  };

  const handleChangeFilter = useCallback(
    (e) => {
      if (e.target.value === options[0]) setFilter({ ...filter, required: !filter?.required });
      if (e.target.value === options[1]) setFilter({ ...filter, haveImage: !filter?.haveImage });
      if (e.target.value === options[2]) setFilter({ ...filter, noImage: !filter?.noImage });
    },
    [filter]
  );


  const dataFiltered = useMemo(() => {

    const filterOptions = [
      {
        label: 'required',
        value: filter?.required
      },
      {
        label: 'haveImage',
        value: filter?.haveImage
      },
      {
        label: 'noImage',
        value: filter?.noImage
      },
    ].filter(d => d.value);

    const filterByPackingMethod = currentInspection?.PackingAndLabelings.filter(d => {
      if (currentInspection.Packing.PackingMethod !== null
      ) {

        const parentId = packingMethodEnum.find(d => d.Value === currentInspection.Packing.PackingMethodId)?.ParentId;
        return d.PackingMethodParentId === parentId
      } return false;
    });

    const requiredList = filter?.required
      ? filterByPackingMethod?.filter((item) => item?.IsRequired)
      : [];

    const haveImageList = filter?.haveImage
      // ? filterByPackingMethod?.filter((item) => item?.Images?.length > 0)
      ? filterByPackingMethod?.filter((item) => item?.Images?.filter(v => v.Action !== 'Delete').length > 0)
      : [];

    const noImageList = filter?.noImage
      // ? filterByPackingMethod?.filter((item) => item?.Images?.length === 0)
      ? filterByPackingMethod?.filter((item) => {
        if (item?.Images?.length === 0) {
          return true;
        }
        if (item?.Images?.filter(v => v.Action === 'Delete').length === item?.Images.length) {
          return true;
        }
        return false;
      })
      : [];

    if (filterOptions.length === 0) {
      return filterByPackingMethod?.sort((a, b) => a?.No - b?.No) || [];
    }

    if (filterOptions.length <= 1) {
      return [...new Set([...requiredList, ...haveImageList, ...noImageList])].sort((a, b) => a?.No - b?.No) || [];
    };

    if (filterOptions.length > 1) {

      return filterByPackingMethod?.filter(item => {

        if (filter.required && filter.haveImage) {
          return item.IsRequired && item.Images.length > 0
        }

        return item.IsRequired && item.Images.length === 0

      }).sort((a, b) => a?.No - b?.No) || [];
    }

  }, [currentInspection.PackingAndLabelings, filter, packingMethodEnum]);

  // console.log(dataFiltered);
  const isApplyFilter = filter.required || filter.haveImage || filter.noImage;

  const buttonContainerStyles = useMemo(() => ({
    position: {
      xs: 'fixed',
      sm: 'fixed',
      md: 'absolute',
      lg: 'absolute',
    },
    bottom: {
      xs: 3,
      sm: 3,
      md: 0,
      lg: 0,
    },
    left: 1,
    right: 1,
    p: 1,
    backgroundColor: 'transparent',
    display: {
      xs: !isKeyboardOpen ? 'flex' : 'none',
      sm: 'flex',
    },
  }), [currentInspection, isKeyboardOpen]);

  const loadingButtonStyles = useMemo(() => ({
    backgroundColor: currentInspection?.Status?.PackingAndLabeling
      ? theme.palette.primary.main
      : theme.palette.info.main,
    minWidth: 200,
    '&:hover': {
      backgroundColor: currentInspection?.Status?.PackingAndLabeling ? theme.palette.primary.main : theme.palette.info.main,
    },
  }), [currentInspection]);


  return (
    <Stack spacing={1} height="100%">

      <DetailSummary currentInspection={currentInspection} />
      <Divider />
      <Box>
        <CustomList
          dataSource={dataFiltered}
          isViewOnly={isViewOnly}
          currentInspection={currentInspection}
          handleChangeFilter={handleChangeFilter}
          packingMethodEnum={packingMethodEnum}
          isApplyFilter={isApplyFilter}
        />
      </Box>

      {
        btnVisible &&
        <Stack
          justifyContent={'flex-end'}
          width={'100%'}
          alignItems="flex-end"
          id="button-group"
          sx={buttonContainerStyles}
        >
          <Stack
            width={{
              xs: '100%',
              sm: '100%',
              md: '25%',
            }}
          >
            <LoadingButton
              variant={'contained'}
              sx={loadingButtonStyles}
              fullWidth={!smUp}
              onClick={setCompleteStep}
              disabled={currentInspection.IsFinished || isViewOnly}
            >
              {!currentInspection?.Status?.PackingAndLabeling ? 'Complete' : 'Completed'}
            </LoadingButton>
          </Stack>
        </Stack>
      }


    </Stack >
  );
};

export default PackingAndLabel;
