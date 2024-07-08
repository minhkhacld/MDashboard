import { Stack, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import Scrollbar from '../../../components/Scrollbar';
import useLocales from '../../../hooks/useLocales';
// Redux

const History = (props) => {
  History.propTypes = {
    WFInstance: PropTypes.object,
  };

  const { WFInstance } = props;
  const { translate } = useLocales();

  if (WFInstance === null) {
    return null;
  }

  return (
    <Stack>
      <Typography paragraph variant="overline">
        {translate('history')}
      </Typography>
      <Scrollbar sx={{
        flexGrow: 1, height: {
          xs: 300,
          md: 400,
        }
      }}>
        <Stack spacing={1} sx={{ py: 1 }}>
          <Typography dangerouslySetInnerHTML={{ __html: WFInstance?.History }} />
        </Stack>
      </Scrollbar>
    </Stack>
  );
};

export default History;
