import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { List, Box, ListSubheader } from '@mui/material';
// hooks
import useLocales from '../../../hooks/useLocales';
//
import { NavListRoot } from './NavList';

// ----------------------------------------------------------------------

export const ListSubheaderStyle = styled((props) => <ListSubheader disableSticky disableGutters {...props} />)(
  ({ theme }) => ({
    ...theme.typography.overline,
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(1),
    color: theme.palette.text.primary,
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shorter,
    }),
  })
);

// ----------------------------------------------------------------------

NavSectionVertical.propTypes = {
  isCollapse: PropTypes.bool,
  navConfig: PropTypes.array,
};

export default function NavSectionVertical({ navConfig, isCollapse = false, search, ...other }) {
  const { translate } = useLocales();
  return (
    <Box {...other} id="navbar-item-container">
      {navConfig.map((group, index) => (
        <List key={group.subheader + index} disablePadding sx={{ px: 2, pb: 3 }} dense>
          <ListSubheaderStyle
            sx={{
              ...(isCollapse && {
                opacity: 0,
              }),
            }}
          >
            {translate(group.subheader)}
          </ListSubheaderStyle>
          {group.items.map((list, index) => (
            // list.isAuth && <NavListRoot key={list.title + list.path + index} list={list} isCollapse={isCollapse} />
            <NavListRoot key={list.title + list.path + index} list={list} isCollapse={isCollapse} search={search} />
          ))}
        </List>
      ))}
    </Box>
  );
}
