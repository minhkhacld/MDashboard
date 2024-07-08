import { Button } from '@mui/material';
import Propstype from 'prop-types';
import useLocales from '../hooks/useLocales';
import IconName from '../utils/iconsName';
import Iconify from './Iconify';

const HeaderGobackButton = ({ onClick }) => {
  HeaderGobackButton.propTypes = {
    onClick: Propstype.func,
  };
  const { translate } = useLocales();

  return (
    <div className="w-full flex flex-row justify-start items-center mb-2 ml-1">
      <Button
        startIcon={<Iconify icon={IconName.chevronLeft}
          sx={{
            fontSize: '30px !important'
          }} />}
        color='primary'
        onClick={onClick}
      >
        {translate('button.goBack')}
      </Button>
    </div>
  );
};

export default HeaderGobackButton;
