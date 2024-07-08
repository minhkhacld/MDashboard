import PropTypes from 'prop-types';
import { Capacitor } from '@capacitor/core';
// @mui
import { Box, Typography, Link } from '@mui/material';
//
import Breadcrumbs from './Breadcrumbs';

// ----------------------------------------------------------------------

HeaderBreadcrumbs.propTypes = {
  links: PropTypes.array,
  action: PropTypes.node,
  // heading: PropTypes.string.isRequired,
  heading: PropTypes.any,
  moreLink: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  sx: PropTypes.object,
};

export default function HeaderBreadcrumbs({ links, action, heading, moreLink = '' || [], sx, ...other }) {
  return (
    <Box sx={{ mb: 0, ...sx }} id='header-breacrumb'>
      {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" gutterBottom>
            {heading}
          </Typography>
          <Breadcrumbs links={links} {...other} />
        </Box>

        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box> */}


      <div className="flex flex-col sm:flex-row">
        <Box sx={{ flexGrow: 1 }}>
          {other?.showBreadcrumbs
            &&
            <Typography variant="h4" gutterBottom>
              {heading}
            </Typography>
          }
          <Breadcrumbs links={links} {...other} />
        </Box>
        {action && <div className="flex flex-row justify-start item-center mt-2 max-h-[40px]">{action}</div>}
      </div>


      <Box sx={{ mt: 1 }}>
        {typeof moreLink === 'string' ? (
          <Link href={moreLink} target="_blank" rel="noopener" variant="body2">
            {moreLink}
          </Link>
        ) : (
          moreLink.map((href) => (
            <Link
              noWrap
              key={href}
              href={href}
              variant="body2"
              target="_blank"
              rel="noopener"
              sx={{ display: 'table' }}
            >
              {href}
            </Link>
          ))
        )}
      </Box>
    </Box>
  );
}
