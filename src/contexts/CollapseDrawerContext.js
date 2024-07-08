import PropTypes from 'prop-types';
import { createContext, useEffect, useState } from 'react';
// hooks
import useResponsive from '../hooks/useResponsive';

// ----------------------------------------------------------------------

const initialState = {
  collapseClick: false,
  collapseHover: false,
  onToggleCollapse: () => { },
  onHoverEnter: () => { },
  onHoverLeave: () => { },
  open: false,
  setOpen: () => { },
  onToggleDrawer: () => { },
};

const CollapseDrawerContext = createContext(initialState);

// ----------------------------------------------------------------------

CollapseDrawerProvider.propTypes = {
  children: PropTypes.node,
};

function CollapseDrawerProvider({ children }) {

  const isDesktop = useResponsive('up', 'lg');

  const [collapse, setCollapse] = useState({
    click: false,
    hover: false,
  });

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isDesktop) {
      setCollapse({
        click: false,
        hover: false,
      });
    }
  }, [isDesktop]);

  const handleToggleCollapse = () => {
    setCollapse({ ...collapse, click: !collapse.click });
  };

  const handleHoverEnter = () => {
    if (collapse.click) {
      setCollapse({ ...collapse, hover: true });
    }
  };

  const handleHoverLeave = () => {
    setCollapse({ ...collapse, hover: false });
  };

  const handleToggleDrawer = () => {
    setOpen(!open)
  };

  return (
    <CollapseDrawerContext.Provider
      value={{
        isCollapse: collapse.click && !collapse.hover,
        collapseClick: collapse.click,
        collapseHover: collapse.hover,
        onToggleCollapse: handleToggleCollapse,
        onHoverEnter: handleHoverEnter,
        onHoverLeave: handleHoverLeave,
        onToggleDrawer: handleToggleDrawer,
        open,
      }}
    >
      {children}
    </CollapseDrawerContext.Provider>
  );
}

export { CollapseDrawerContext, CollapseDrawerProvider };
