import PropTypes from 'prop-types';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// @mui
import { List, Collapse } from '@mui/material';
//
import { NavItemRoot, NavItemSub } from './NavItem';
import { getActive } from '..';
import { PATH_APP } from '../../../routes/paths';

// ----------------------------------------------------------------------

NavListRoot.propTypes = {
  list: PropTypes.object,
  isCollapse: PropTypes.bool,
};

export function NavListRoot({ list, isCollapse, search }) {
  const { pathname } = useLocation();
  const navigate = useNavigate()

  const active = getActive(list.path, pathname);

  const [open, setOpen] = useState(active);

  const hasChildren = list.children;


  if (hasChildren) {
    const handleOpenSubMenu = () => {
      const approvalGroup = ['accounting', 'shipment', 'bank_account'];
      const isNeedtoSetDefaultRoute = approvalGroup.find(d => d === list.id) !== undefined;
      if (isNeedtoSetDefaultRoute) {
        navigate(list.path);
        setOpen(!open)
      } else {
        setOpen(!open)
      }
    }; return (
      <>
        <NavItemRoot
          item={list}
          isCollapse={isCollapse}
          active={active}
          open={open}
          // onOpen={() => setOpen(!open)}
          onOpen={handleOpenSubMenu}
          search={search}
        />

        {!isCollapse && (
          <Collapse in={search !== '' ? true : open} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {(list.children || []).map(
                // (item) => item.isAuth && <NavListSub key={item.title + item.path} list={item} />
                (item) => (
                  <NavListSub key={item.title + item.path} list={item} />
                )
              )}
            </List>
          </Collapse>
        )}
      </>
    );
  }

  return <NavItemRoot item={list} active={active} isCollapse={isCollapse} search={search} />;
}

// ----------------------------------------------------------------------

NavListSub.propTypes = {
  list: PropTypes.object,
};

function NavListSub({ list }) {
  const { pathname } = useLocation();

  const active = getActive(list.path, pathname);

  const [open, setOpen] = useState(active);

  const hasChildren = list.children;

  if (hasChildren) {
    return (
      <>
        <NavItemSub item={list} onOpen={() =>
          setOpen(!open)
        } open={open} active={active} />

        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 3, }}>
            {(list.children || []).map((item) => (
              <NavItemSub key={item.title + item.path} item={item} active={getActive(item.path, pathname)} />
            ))}
          </List>
        </Collapse>
      </>
    );
  }

  return <NavItemSub item={list} active={active} />;
}
