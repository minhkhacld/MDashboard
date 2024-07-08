import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
// @mui
import { Box, Link, Typography, Breadcrumbs as MUIBreadcrumbs } from '@mui/material';
import uuidv4 from '../utils/uuidv4'
// ----------------------------------------------------------------------

Breadcrumbs.propTypes = {
  activeLast: PropTypes.bool,
  links: PropTypes.array.isRequired,
};

export default function Breadcrumbs({ links, activeLast = false, ...other }) {

  const currentLink = links[links.length - 1]?.name;
  const listDefault = links.map((link) => {
    const key = link?.name !== undefined ? link?.name : uuidv4()
    return <LinkItem key={key} link={link} other={other} />
  });

  const listActiveLast = links.map((link) => (
    <div key={link?.name !== undefined ? link?.name : uuidv4()}>
      {link?.name !== currentLink ? (
        <LinkItem link={link} other={other} />
      ) : (
        <Typography
          // variant={"body2"}
          variant={"button"}
          sx={{
            maxWidth: 260,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: 'text.disabled',
            textOverflow: 'ellipsis',
          }}
        >
          {currentLink}
        </Typography>
      )}
    </div>
  ));

  return (
    <MUIBreadcrumbs
      separator={<Box component="span" sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />}
      {...other}
    >
      {activeLast ? listDefault : listActiveLast}
    </MUIBreadcrumbs>
  );
}

// ----------------------------------------------------------------------

LinkItem.propTypes = {
  link: PropTypes.shape({
    href: PropTypes.string,
    icon: PropTypes.any,
    name: PropTypes.string,
  }),
  other: PropTypes.any,
};

function LinkItem({ link, other }) {
  const { href, name, icon } = link;
  return (
    <Link
      key={name || uuidv4().toString()}
      // variant="body2"
      variant={"button"}
      component={RouterLink}
      to={href || '#'}
      sx={{
        lineHeight: 2.8,
        display: 'flex',
        alignItems: 'center',
        color: 'text.primary',
        '& > div': { display: 'inherit' },
      }}
      state={other?.state ? other.state : null}
    >
      {icon && <Box sx={{ mr: 1, '& svg': { width: 20, height: 20 } }}>{icon}</Box>}
      {name}
    </Link>
  );
}
