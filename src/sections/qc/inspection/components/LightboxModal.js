import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Lightbox from 'react-image-lightbox';
// @mui
import { GlobalStyles, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import useIsOnline from '../../../../hooks/useIsOnline';
// ----------------------------------------------------------------------

function LightboxModalStyles() {
  const theme = useTheme();
  const { online } = useIsOnline();
  const isRTL = theme.direction === 'rtl';

  const ICON_SIZE = 32;
  const ICON_COLOR = theme.palette.grey[600].replace('#', '');

  const reactSvgComponentToMarkupString = (Component) =>
    `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(Component))}`;

  const getIcon = (icon) => {
    // if (online) {
    //   return `url(https://api.iconify.design/carbon/${icon}.svg?color=%23${ICON_COLOR}&width=${ICON_SIZE}&height=${ICON_SIZE})`;
    // }
    if (icon === 'close') {
      return `url(${reactSvgComponentToMarkupString(<Close color={theme.palette.grey[600]} size={ICON_SIZE} />)})`;
    }
    if (icon === 'zoom-in') {
      return `url(${reactSvgComponentToMarkupString(<ZoomIn color={theme.palette.grey[600]} size={ICON_SIZE} />)})`;
    }
    if (icon === 'zoom-out') {
      return `url(${reactSvgComponentToMarkupString(<ZoomOut color={theme.palette.grey[600]} size={ICON_SIZE} />)})`;
    }
    if (icon === 'arrow-right') {
      return `url(${reactSvgComponentToMarkupString(<ArrowRight color={theme.palette.grey[600]} size={ICON_SIZE} />)})`;
    }
    if (icon === 'arrow-left') {
      return `url(${reactSvgComponentToMarkupString(<ArrowLeft color={theme.palette.grey[600]} size={ICON_SIZE} />)})`;
    }
  };

  const Icon = (icon) => ({
    opacity: 1,
    alignItems: 'center',
    display: 'inline-flex',
    justifyContent: 'center',
    backgroundImage: `unset`,
    backgroundColor: 'transparent',
    transition: theme.transitions.create('opacity'),
    '&:before': {
      display: 'block',
      width: ICON_SIZE,
      height: ICON_SIZE,
      content: getIcon(icon),
    },
    '&:hover': {
      opacity: 0.72,
    },
  });

  return (
    <GlobalStyles
      styles={{
        '& .ReactModalPortal': {
          '& .ril__outer': {
            backgroundColor: alpha(theme.palette.grey[900], 0.96),
          },

          // Toolbar
          '& .ril__toolbar': {
            height: 'auto !important',
            padding: theme.spacing(2, 3),
            backgroundColor: 'transparent',
          },
          '& .ril__toolbarLeftSide': { display: 'none' },
          '& .ril__toolbarRightSide': {
            height: 'auto !important',
            padding: 0,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            '& li': {
              display: 'flex',
              alignItems: 'center',
            },
            '& li:first-of-type': {
              flexGrow: 1,
            },
            '& li:not(:first-of-type)': {
              width: 40,
              height: 40,
              justifyContent: 'center',
              marginLeft: theme.spacing(2),
            },
          },

          // Button
          '& button:focus': { outline: 'none' },
          '& .ril__toolbarRightSide button': {
            width: '100%',
            height: '100%',
            '&.ril__zoomInButton': Icon('zoom-in'),
            '&.ril__zoomOutButton': Icon('zoom-out'),
            '&.ril__closeButton': Icon('close'),
          },
          '& .ril__navButtons': {
            padding: theme.spacing(3),
            '&.ril__navButtonPrev': {
              right: 'auto',
              left: theme.spacing(2),
              ...Icon(isRTL ? 'arrow-right' : 'arrow-left'),
            },
            '&.ril__navButtonNext': {
              left: 'auto',
              right: theme.spacing(2),
              ...Icon(isRTL ? 'arrow-left' : 'arrow-right'),
            },
          },
        },
      }}
    />
  );
}

// ----------------------------------------------------------------------

LightboxModal.propTypes = {
  images: PropTypes.array.isRequired,
  photoIndex: PropTypes.number,
  setPhotoIndex: PropTypes.func,
  isOpen: PropTypes.bool,
};

export default function LightboxModal({ images, photoIndex, setPhotoIndex, isOpen, ...other }) {

  const [size, setSize] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  useEffect(() => {
    //     x = (n * (3/4)) - y
    // Where:
    // 1. x is the size of a file in bytes
    // 2. n is the length of the Base64 String
    // 3. y will be 2 if Base64 ends with '==' and 1 if Base64 ends with '='.
    if (images[photoIndex] !== undefined && typeof images[photoIndex] === 'string') {
      const length = images[photoIndex].slice(images[photoIndex].indexOf(',') + 1).length;
      const paddings = images[photoIndex].slice(-2);
      let fileSizeInByte = (length * (3 / 4))
      // console.log(paddings)
      if (paddings === "==") {
        fileSizeInByte -= 2
      } else if (paddings === "=") {
        fileSizeInByte -= 1
      }
      setSize(Math.round(fileSizeInByte / 1000000 * 100) / 100)
    }
  }, [images, photoIndex])

  const showIndex = <Typography variant="subtitle2" sx={{ maxWidth: 120 }}>{`${photoIndex + 1} / ${images.length}`}</Typography>;

  const toolbarButtons = [showIndex];

  const customStyles = {
    overlay: {
      zIndex: 9999,
    },
  };

  const isNullImage = images[photoIndex] === null;

  return (
    <>
      <LightboxModalStyles />

      {isOpen && (
        <Lightbox
          animationDuration={160}
          nextSrc={images[(photoIndex + 1) % images.length]}
          prevSrc={images[(photoIndex + images.length - 1) % images.length]}
          onMovePrevRequest={() => setPhotoIndex((photoIndex + images.length - 1) % images.length)}
          onMoveNextRequest={() => setPhotoIndex((photoIndex + 1) % images.length)}
          toolbarButtons={toolbarButtons}
          reactModalStyle={customStyles}
          imageTitle='title'
          {...(!isNullImage &&
            { imageCaption: images[photoIndex].includes('data:image/') ? `${size}Mb - This image is storage on device` : 'This image is storage on server' })}

          {...other}
        />
      )}
    </>
  );
}

const Close = ({ color, size }) => {
  Close.propTypes = {
    color: PropTypes.string,
    size: PropTypes.number,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32">
      <path
        fill={color}
        d="M24 9.4L22.6 8L16 14.6L9.4 8L8 9.4l6.6 6.6L8 22.6L9.4 24l6.6-6.6l6.6 6.6l1.4-1.4l-6.6-6.6L24 9.4z"
      />
    </svg>
  );
};

const ZoomIn = ({ color, size }) => {
  ZoomIn.propTypes = {
    color: PropTypes.string,
    size: PropTypes.number,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32">
      <path fill={color} d="M18 12h-4V8h-2v4H8v2h4v4h2v-4h4v-2z" />
      <path
        fill={color}
        d="M21.448 20A10.856 10.856 0 0 0 24 13a11 11 0 1 0-11 11a10.856 10.856 0 0 0 7-2.552L27.586 29L29 27.586ZM13 22a9 9 0 1 1 9-9a9.01 9.01 0 0 1-9 9Z"
      />
    </svg>
  );
};

const ZoomOut = ({ color, size }) => {
  ZoomOut.propTypes = {
    color: PropTypes.string,
    size: PropTypes.number,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32">
      <path fill={color} d="M8 12h10v2H8z" />
      <path
        fill={color}
        d="M21.448 20A10.856 10.856 0 0 0 24 13a11 11 0 1 0-11 11a10.856 10.856 0 0 0 7-2.552L27.586 29L29 27.586ZM13 22a9 9 0 1 1 9-9a9.01 9.01 0 0 1-9 9Z"
      />
    </svg>
  );
};

const ArrowRight = ({ color, size }) => {
  ArrowRight.propTypes = {
    color: PropTypes.string,
    size: PropTypes.number,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32">
      <path fill={color} d="m18 6l-1.43 1.393L24.15 15H4v2h20.15l-7.58 7.573L18 26l10-10L18 6z" />
    </svg>
  );
};

const ArrowLeft = ({ color, size }) => {
  ArrowLeft.propTypes = {
    color: PropTypes.string,
    size: PropTypes.number,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32">
      <path fill={color} d="m14 26l1.41-1.41L7.83 17H28v-2H7.83l7.58-7.59L14 6L4 16l10 10z" />
    </svg>
  );
};
