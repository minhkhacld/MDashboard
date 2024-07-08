// @mui
import { CardActionArea, Grid, RadioGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
// hooks
import useIsOnline from '../../../hooks/useIsOnline';
import useSettings from '../../../hooks/useSettings';
//
import Iconify from '../../Iconify';
import BoxMask from './BoxMask';

// ----------------------------------------------------------------------

const BoxStyle = styled(CardActionArea)(({ theme }) => ({
  height: 72,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.disabled,
  border: `solid 1px ${theme.palette.grey[500_12]}`,
  borderRadius: Number(theme.shape.borderRadius) * 1.25,
}));

// ----------------------------------------------------------------------

export default function SettingContrast() {
  const { themeContrast, onChangeContrast } = useSettings();

  return (
    <RadioGroup name="themeContrast" value={themeContrast} onChange={onChangeContrast}>
      <Grid dir="ltr" container spacing={2.5}>
        {['default', 'bold'].map((contrast, index) => {
          const isSelected = themeContrast === contrast;

          return (
            <Grid key={contrast} item xs={6}>
              <BoxStyle
                sx={{
                  ...(isSelected && {
                    color: 'primary.main',
                    boxShadow: (theme) => theme.customShadows.z20,
                  }),
                }}
              >
                {/* <Iconify icon={index === 0 ? 'cil:contrast' : 'ion:contrast-outline'} width={28} height={28} /> */}
                <CustomIcon icon={index === 0 ? 'cil:contrast' : 'ion:contrast-outline'} />
                <BoxMask value={contrast} />
              </BoxStyle>
            </Grid>
          );
        })}
      </Grid>
    </RadioGroup>
  );
}

// Custom icon for offline mode
const CustomIcon = ({ icon }) => {
  const { online } = useIsOnline();
  if (online) {
    return <Iconify icon={icon} width={28} height={28} />;
  }
  if (icon === 'cil:contrast') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 512 512">
        <path
          fill="currentColor"
          d="M256 16C123.452 16 16 123.452 16 256s107.452 240 240 240s240-107.452 240-240S388.548 16 256 16Zm-22 446.849a208.346 208.346 0 0 1-169.667-125.9c-.364-.859-.706-1.724-1.057-2.587L234 429.939Zm0-69.582L50.889 290.76A209.848 209.848 0 0 1 48 256q0-9.912.922-19.67L234 339.939Zm0-90L54.819 202.96a206.385 206.385 0 0 1 9.514-27.913Q67.1 168.5 70.3 162.191L234 253.934Zm0-86.015L86.914 134.819a209.42 209.42 0 0 1 22.008-25.9q3.72-3.72 7.6-7.228L234 166.027Zm0-87.708l-89.648-49.093A206.951 206.951 0 0 1 234 49.151ZM464 256a207.775 207.775 0 0 1-198 207.761V48.239A207.791 207.791 0 0 1 464 256Z"
        />
      </svg>
    );
  }
  if (icon === 'ion:contrast-outline') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 512 512">
        <circle cx="256" cy="256" r="208" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32" />
        <path fill="currentColor" d="M256 464c-114.88 0-208-93.12-208-208S141.12 48 256 48Z" />
      </svg>
    );
  }
};
