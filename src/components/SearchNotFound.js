import PropTypes from 'prop-types';
import { Paper, Typography } from '@mui/material';

// ----------------------------------------------------------------------

SearchNotFound.propTypes = {
  searchQuery: PropTypes.string,
};

export default function SearchNotFound({ searchQuery = '', ...other }) {
  return searchQuery ? (
    <Paper {...other}>
      <Typography gutterBottom align="center" variant="subtitle1">
        Không tìm thấy
      </Typography>
      <Typography variant="body2" align="center">
        Không có kết quả tìm kiếm cho &nbsp;
        <strong>&quot;{searchQuery}&quot;</strong>. Vui lòng tìm kiếm từ khóa khác
      </Typography>
    </Paper>
  ) : (
    <Typography variant="body2">Nhập từ khóa</Typography>
  );
}
