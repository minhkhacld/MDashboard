import { Stack, Typography } from '@mui/material';
import Scrollbar from '../../components/Scrollbar';
import useLocales from '../../hooks/useLocales';
// Redux
import { useSelector } from '../../redux/store';

const History = () => {
  const { WFInstance } = useSelector((store) => store.bankAccount);
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
