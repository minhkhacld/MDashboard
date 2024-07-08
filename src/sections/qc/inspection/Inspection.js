import { LoadingButton } from '@mui/lab';
import {
  Box,
  Divider,
  Stack,
  TextField
} from '@mui/material';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import { memo } from 'react';
import useDetectKeyboardOpen from "use-detect-keyboard-open";
import useLocales from '../../../hooks/useLocales';
import useResponsive from '../../../hooks/useResponsive';
import DetailSummary from './DetailSummary';
// COMPONENTS
import { db } from '../../../Db';
import Iconify from '../../../components/Iconify';
import useIsOnline from '../../../hooks/useIsOnline';
import IconName from '../../../utils/iconsName';
import CustomListWithSearch from './components/CustomListWithSearch';


const requiredField = [
  {
    field: 'DefectCategoryId',
    label: 'Category',
  },
  {
    field: 'DefectAreaId',
    label: 'Area',
  },
  {
    field: 'DefectDataId',
    label: 'Defect',
  },
  {
    field: 'Major',
    label: 'Major',
  },
  {
    field: 'Minor',
    label: 'Minor',
  },
  {
    field: 'Critical',
    label: 'Critical',
  },
];

Inspection.propTypes = {
  theme: PropTypes.any,
  currentInspection: PropTypes.object,
  EnumDefect: PropTypes.array,
  isViewOnly: PropTypes.bool,
  handleNext: PropTypes.func,
};


function Inspection({
  theme,
  currentInspection,
  EnumDefect,
  isViewOnly,
  handleNext,
}) {

  // Hooks
  const { translate } = useLocales();
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const { online } = useIsOnline();
  const isKeyboardOpen = useDetectKeyboardOpen();

  // COMPONENT STATES

  // const [search, setSearch] = useState('');
  // const [userQuery, setUserQuery] = useState("");
  // const [listItems, setListItem] = useState([])

  // const updateQuery = () => {
  //   setUserQuery(search)
  // };

  // const delayedQuery = useCallback(debounce(updateQuery, 500), [search]);

  // const handleChangeSerachValue = e => {
  //   setSearch(e.target.value)
  // };

  // useEffect(() => {
  //   delayedQuery();
  //   // Cancel the debounce on useEffect cleanup.
  //   return delayedQuery.cancel;
  // }, [search, delayedQuery]);

  // useEffect(() => {
  //   const Items = currentInspection?.Inspections.filter(d => (d.Remark.toLowerCase().includes(userQuery.toLowerCase())
  //     || d.DefectData.toLowerCase().includes(userQuery.toLowerCase())) && !d.IsDeleted
  //   ) || [];
  //   setListItem(Items)
  // }, [userQuery,])



  // SET STEP COMPLETE
  const setCompleteStep = async () => {
    try {
      const inspectArr = currentInspection.Inspections.map((d) => ({
        Major: d.Major,
        Minor: d.Minor,
        Critical: d.Critical,
      }));

      const MajorDefectNumber = inspectArr.reduce((a, b) => Number(a) + Number(b.Major), 0);
      const MinorDefectNumber = inspectArr.reduce((a, b) => Number(a) + Number(b.Minor), 0);
      const CriticalDefectNumber = inspectArr.reduce((a, b) => Number(a) + Number(b.Critical), 0);

      if (!currentInspection.Status.Inspections) {
        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            // console.log('default', x, ref);
            // Set Step complete
            ref.value.Status = {
              ...ref.value.Status,
              Inspections: !currentInspection?.Status?.Inspections,
            };
            ref.value.Summary = {
              ...currentInspection.Summary,
              MajorDefectNumber,
              MinorDefectNumber,
              CriticalDefectNumber,
            };
          });
        // carouselRef.current?.slickNext();
        handleNext();
      } else {
        await db.MqcInspection.where('Id')
          .equals(currentInspection.Id)
          .modify((x, ref) => {
            // console.log('default', x, ref);
            // Set Step complete
            ref.value.Status.Inspections = !currentInspection?.Status?.Inspections;
          });
      }
    } catch (error) {
      console.error(error);
      enqueueSnackbar(JSON.stringify(error), {
        variant: 'error',
        autoHideDuration: 8000,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
      });
    }
  };

  // console.log(currentInspection);

  return (
    <Stack spacing={1} height="100%">
      <DetailSummary currentInspection={currentInspection} />
      <Divider />
      <Box pb={3}>
        <CustomListWithSearch
          isViewOnly={isViewOnly}
          currentInspection={currentInspection}
          EnumDefect={EnumDefect}
        />
      </Box>


      <Stack
        justifyContent={'flex-end'}
        width={'100%'}
        alignItems="flex-end"
        id="button-group"
        sx={{
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
            lg: 0
          },
          left: 1,
          right: 1,
          p: 1,
          backgroundColor: 'transparent',
          display: {
            xs: !isKeyboardOpen ? 'flex' : 'none',
            sm: 'flex',
          },
        }}
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
            sx={{
              backgroundColor: currentInspection.Status.Inspections
                ? theme.palette.primary.main
                : theme.palette.info.main,
              minWidth: 200,
              '&:hover': {
                backgroundColor: currentInspection.Status.Inspections
                  ? theme.palette.primary.main
                  : theme.palette.info.main,
              },
            }}
            fullWidth={!smUp}
            onClick={setCompleteStep}
            disabled={(currentInspection.IsFinished || isViewOnly) && !currentInspection?.IsImproved}
          >
            {!currentInspection.Status.Inspections ? 'Complete' : 'Completed'}
          </LoadingButton>

        </Stack>
      </Stack>
    </Stack>
  );
};

export default memo(Inspection);


RenderInput.propTypes = {
  params: PropTypes.any,
  label: PropTypes.any,
  error: PropTypes.any,
  isRequired: PropTypes.bool,
  errorMessage: PropTypes.string,
};


// Render Input
function RenderInput({ params = {}, label = "", error = null, isRequired = false, errorMessage = null }) {
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
          <p className="ml-1 mr-1">{label}</p>
          {isRequired && (
            <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 16 16">
              <path
                fill="red"
                d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8L1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"
              />
            </svg>
          )}
        </Stack>
      }
      InputLabelProps={{
        style: { color: 'var(--label)' },
        shrink: true,
      }}
      error={error}
      helperText={errorMessage?.message}
    />
  );
};

