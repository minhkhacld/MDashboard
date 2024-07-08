import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import { Badge, Box, Link, ListItemText, Tooltip, Typography } from '@mui/material';
// hooks
import useLocales from '../../../hooks/useLocales';
import { useSelector } from '../../../redux/store';
// guards
import RoleBasedGuard from '../../../guards/RoleBasedGuard';
//
import { isExternalLink } from '..';
import Iconify from '../../Iconify';
import { ListItemIconStyle, ListItemStyle, ListItemTextStyle } from './style';


// ----------------------------------------------------------------------

// HANDLE SHOW ITEM BY ROLE
const ListItem = forwardRef((props, ref) => (
  <RoleBasedGuard roles={props.roles}>
    <ListItemStyle {...props} ref={ref}>
      {props.children}
    </ListItemStyle>
  </RoleBasedGuard>
));

ListItem.propTypes = {
  children: PropTypes.node,
  roles: PropTypes.arrayOf(PropTypes.string),
};

NavItemRoot.propTypes = {
  active: PropTypes.bool,
  open: PropTypes.bool,
  isCollapse: PropTypes.bool,
  onOpen: PropTypes.func,
  item: PropTypes.shape({
    children: PropTypes.array,
    icon: PropTypes.any,
    info: PropTypes.any,
    path: PropTypes.string,
    title: PropTypes.string,
    disabled: PropTypes.bool,
    caption: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
  }),
};

const setLastPath = (path) => {
  localStorage.setItem('lastVisitPage', JSON.stringify(path));
};

export function NavItemRoot({ item, isCollapse, open = false, active, onOpen, search }) {
  const { translate } = useLocales();

  const { title, path, icon, info, children, disabled, caption, roles } = item;
  const { pendingList } = useSelector((store) => store.notification);

  const renderContent = (
    <>
      {icon && <ListItemIconStyle>{icon}</ListItemIconStyle>}
      <ListItemTextStyle
        disableTypography
        primary={translate(title)}
        secondary={
          <Tooltip title={translate(caption) || ''} arrow>
            <Typography
              noWrap
              variant="caption"
              component="div"
              sx={{ textTransform: 'initial', color: 'text.secondary' }}
            >
              {translate(caption)}
            </Typography>
          </Tooltip>
        }
        isCollapse={isCollapse}
      />
      {!isCollapse && (
        <>
          {info && info}

          {pendingList.length > 0 &&
            <ItemBagdes item={item} pendingList={pendingList} />
          }

          {children && <ArrowIcon open={search !== '' ? true : open} />}
        </>
      )}
    </>
  );


  const handleOpenNavItem = (e,) => {
    onOpen();
    // const element = document.getElementById('navbar-item-container');
    // const parentContainer = element.getBoundingClientRect();
    // const itemPostion = e.target.getBoundingClientRect();

    // // console.log(element.getBoundingClientRect(), e.target.getBoundingClientRect());
    // console.log('container - item',
    //   parentContainer.height, parentContainer.top,
    //   itemPostion.top,
    //   e.target.offsetTop,
    //   element.scrollHeight, element.offsetHeight
    // );
    // e.target.scrollIntoView({ behavior: "smooth", inline: "center", });
    // element.scrollTop = element.scrollHeight;

    // if (parentContainer.height + parentContainer.top - itemPostion.top <= 200) {
    //   console.log('near reach bottom');
    //   // element.scrollTop = element.scrollHeight;
    //   element.scrollIntoView({ behavior: 'smooth', block: 'end' });
    // }
    // // e.target.scrollIntoView({ behavior: "smooth", inline: "center", });
    // console.log(element.getBoundingClientRect(), e)
  }


  if (children) {
    return (
      <ListItem onClick={handleOpenNavItem} activeRoot={active} disabled={disabled} roles={roles}>
        {renderContent}
      </ListItem>
    );
  }

  return isExternalLink(path) ? (
    <ListItem component={Link} href={path} target="_blank" rel="noopener" disabled={disabled} roles={roles}>
      {renderContent}
    </ListItem>
  ) : (
    <ListItem
      component={RouterLink}
      to={path}
      activeRoot={active}
      disabled={disabled}
      roles={roles}
      onClick={() => setLastPath(path)}
    >
      {renderContent}
    </ListItem>
  );
}

// ----------------------------------------------------------------------

NavItemSub.propTypes = {
  active: PropTypes.bool,
  open: PropTypes.bool,
  onOpen: PropTypes.func,
  item: PropTypes.shape({
    children: PropTypes.array,
    info: PropTypes.any,
    path: PropTypes.string,
    title: PropTypes.string,
    disabled: PropTypes.bool,
    caption: PropTypes.bool,
    roles: PropTypes.arrayOf(PropTypes.string),
  }),
};

export function NavItemSub({ item, open = false, active = false, onOpen }) {
  const { translate } = useLocales();

  const { title, path, info, children, disabled, caption, roles } = item;
  const { pendingList } = useSelector((store) => store.notification);

  const renderContent = (
    <>
      <DotIcon active={active} />
      <ListItemText
        disableTypography
        primary={translate(title)}
        onClick={() => setLastPath(path)}
        secondary={
          <Tooltip title={translate(caption) || ''} arrow>
            <Typography
              noWrap
              variant="caption"
              component="div"
              sx={{ textTransform: 'initial', color: 'text.secondary' }}
            >
              {translate(caption)}
            </Typography>
          </Tooltip>
        }
      />
      {info && info}
      {pendingList.length > 0 !== null &&
        <ItemBagdes item={item} pendingList={pendingList} />
      }
      {children && <ArrowIcon open={open} />}
    </>
  );


  if (children) {
    return (
      <ListItem onClick={onOpen} activeSub={active} subItem disabled={disabled} roles={roles}>
        {renderContent}
      </ListItem>
    );
  }

  return isExternalLink(path) ? (
    <ListItem component={Link} href={path} target="_blank" rel="noopener" subItem disabled={disabled} roles={roles}>
      {renderContent}
    </ListItem>
  ) : (
    <ListItem component={RouterLink} to={path} activeSub={active} subItem disabled={disabled} roles={roles}>
      {renderContent}
    </ListItem>
  );
}

// ----------------------------------------------------------------------

DotIcon.propTypes = {
  active: PropTypes.bool,
};

export function DotIcon({ active }) {
  return (
    <ListItemIconStyle>
      <Box
        component="span"
        sx={{
          width: 4,
          height: 4,
          borderRadius: '50%',
          bgcolor: 'text.disabled',
          transition: (theme) =>
            theme.transitions.create('transform', {
              duration: theme.transitions.duration.shorter,
            }),
          ...(active && {
            transform: 'scale(2)',
            bgcolor: 'primary.main',
          }),
        }}
      />
    </ListItemIconStyle>
  );
}

// ----------------------------------------------------------------------

ArrowIcon.propTypes = {
  open: PropTypes.bool,
};

export function ArrowIcon({ open }) {
  return (
    <Iconify
      icon={open ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
      sx={{ width: 16, height: 16, ml: 1 }}
    />
  );
}


ItemBagdes.propTypes = {
  item: PropTypes.object,
  pendingList: PropTypes.array,
};

function ItemBagdes({ item, pendingList }) {

  let number = null;

  switch (item.title) {
    case 'accounting':
      // code block
      number = pendingList.filter(x => x.TableName === "FinanceRequest").length;

      break;
    case 'accounting_approval':
      // code block
      number = pendingList.filter(x => x.TableName === "FinanceRequest" && x.WFAction === 'Pending').length;
      break;
    case 'accounting_recall':
      // code block
      number = pendingList.filter(x => x.TableName === "FinanceRequest" && x.WFAction === 'Recall').length;
      break;
    case 'shipment':
      // code block
      number = pendingList.filter(x => x.TableName === "ShipmentStatement").length;

      break;
    case 'shipment_approval':
      number = pendingList.filter(x => x.TableName === "ShipmentStatement" && x.WFAction === 'Pending').length;

      // code block
      break;
    case 'shipment_recall':
      number = pendingList.filter(x => x.TableName === "ShipmentStatement" && x.WFAction === 'Recall').length;

      // code block
      break;
    case 'bankAccount':
      // code block
      number = pendingList.filter(x => x.TableName === "BankAccount").length;

      break;
    case 'bankAccount_approval':
      number = pendingList.filter(x => x.TableName === "BankAccount" && x.WFAction === 'Pending').length;

      // code block
      break;
    case 'bankAccount_recall':
      number = pendingList.filter(x => x.TableName === "BankAccount" && x.WFAction === 'Recall').length;
      // code block
      break;
    case 'compliance':
      // code block
      number = pendingList.filter(x => x.TableName === "QualityInspection").length;

      break;
    case 'compliance_approval':
      number = pendingList.filter(x => x.TableName === "QualityInspection").length;

      // code block
      break;
    // case 'compliance_request':
    //   number = pendingList.filter(x => x.TableName === "QualityRequest").length;
    //   // code block
    //   break;
    default:
    // code block
  }

  return (
    number > 0 ?
      <Box mr={1} >
        <Badge badgeContent={number} color="error" />
      </Box>
      : <></>
  )
}