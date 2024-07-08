import PropTypes from 'prop-types';
import { CardHeader, Typography } from '@mui/material';
// Icon for
import Iconify from './Iconify';

const CustomLabel = ({ icon, text, subheader, onClick, sx, ...other }) => {
  CustomLabel.propTypes = {
    icon: PropTypes.string,
    text: PropTypes.string,
    onClick: PropTypes.any,
    subheader: PropTypes.string,
  };

  return (
    <CardHeader
      title={
        <Typography variant="button" sx={{ width: '100%', textTransform: 'none' }}>
          {text}
        </Typography>
      }
      subheader={subheader}
      action={
        other.isAddOrEdit && (
          <Iconify
            icon={icon}
            color="var(--icon)"
            className="text-2xl cursor-pointer hover:text-red-500"
            onClick={onClick}
          />
        )
      }
      sx={{
        mb: 1,
        p: 0,
        ...sx,
      }}
    />
  );
};

export default CustomLabel;
