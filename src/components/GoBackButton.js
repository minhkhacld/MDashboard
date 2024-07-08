import { IconButton, Stack, Typography } from '@mui/material';
import useLocales from '../hooks/useLocales';
import IconName from '../utils/iconsName';
import Iconify from './Iconify';

const GoBackButton = ({ onClick, rightButton, sx }) => {
  const { translate } = useLocales()
  return (
    <Stack p={0} direction="row" justifyContent="space-between" alignItems={'center'} {...sx} id="go-back-button">
      <IconButton onClick={onClick} sx={{ p: 0, height: 'auto', width: 'auto', borderRadius: 1, padding: 1 }}>
        <Stack spacing={0.5} direction="row">
          <Iconify icon={IconName.chevronLeft} sx={{ fontSize: 25, color: 'primary.main' }} />
          <Typography variant="button" color={'primary.main'}>{translate('button.goBack')}</Typography>
        </Stack>
      </IconButton>
      {rightButton}
    </Stack>
  );
};

export default GoBackButton;
