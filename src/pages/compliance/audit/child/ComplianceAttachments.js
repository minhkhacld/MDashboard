import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { Box, Chip, Divider, List, ListItem, Typography, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// pfd image
// hook
import useLocales from '../../../../hooks/useLocales';
// Icon
import Iconify from '../../../../components/Iconify';
import IconName from '../../../../utils/iconsName';
// Redux

import Scrollbar from '../../../../components/Scrollbar';
import MsgFileViewer from '../../../../components/dxPopup/MsgFileReader';

// util
import CapFileOpenner from '../../../../utils/appFileOpen';
import axios from '../../../../utils/axios';
import { getFileFormat } from '../../../../utils/getFileFormat';


const chipStyles = {
  '& .MuiChip-deleteIcon': {
    fontSize: '30px !important',
  },
  "& .MuiButtonBase-root-MuiChip-root .MuiChip-icon": {
    width: 50
  }, "& .MuiChip-label": {
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    wordWrap: 'break-word',
  },
  "&.MuiChip-root": {
    py: 0.5,
    height: 'fit-content',
  },
  ':hover': {
    backgroundColor: 'primary.main',
    color: 'white',
    '& .MuiChip-deleteIcon': {
      color: 'white'
    }
  },
  cursor: 'pointer',
};

const ComplianceAttachments = ({
  attachments = [],
  setOpenLightbox = () => { },
  setSelectedImage = () => { },
  imagesLightbox = [],
  onDelete = () => { },
  showDeleteButton = false,
  ...other
}) => {
  // Props

  // hook
  const { translate } = useLocales();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const renderExcelFiles = attachments.filter(d => getFileFormat(d.Name || d?.FileName) === 'excel') || [];

  return (
    <Box id='report-document'>
      <Typography paragraph variant="overline">
        {translate('attachment: ')}{renderExcelFiles.length}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <Scrollbar sx={{ height: 400, paddingBottom: 15 }}>
        <List disablePadding sx={{
          width: '100%',
          bgcolor: 'background.paper',
        }}>
          {renderExcelFiles.length > 0 ? (
            renderExcelFiles.map((att, index) => {
              return (
                <RenderElement
                  d={att}
                  key={att?.Id}
                  setOpenLightbox={setOpenLightbox}
                  setSelectedImage={setSelectedImage}
                  imagesLightbox={imagesLightbox}
                  showDeleteButton={showDeleteButton}
                  onDelete={onDelete}
                  attachments={attachments}
                />
              )
            })
          ) : (
            <Typography variant="body2" sx={{ width: '100%', textAlign: 'center' }}>
              {translate('noFileText')}
            </Typography>
          )
          }
        </List>
      </Scrollbar>
    </Box>
  );
};

export default ComplianceAttachments;

const RenderElement = ({ d, attachments, ...other }) => {
  RenderElement.propTypes = {
    d: PropTypes.object,
  };

  const theme = useTheme();
  const fileType = getFileFormat(d.Name);
  const platform = Capacitor.getPlatform();

  const { setOpenLightbox, setSelectedImage, imagesLightbox, onDelete, showDeleteButton } = other;

  const handleOpenImage = () => {
    const imgIndex = imagesLightbox.findIndex((img) => img === `${d.URL}`);
    setOpenLightbox(true);
    setSelectedImage(imgIndex >= 0 ? imgIndex : 0);
  };

  const handleOpenLink = useCallback(async (link) => {
    await Browser.open({ url: link });
  }, []);


  const handleViewFile = async () => {
    try {
      const pdfRefFile = attachments.find(file => Number(file.RefId) === Number(d.Id));
      // await Browser.open({ url: pdfRefFile.URL });
      if (platform !== 'android') {
        await Browser.open({ url: pdfRefFile.URL });
      } else {
        const response = await axios.get(pdfRefFile.URL, {
          responseType: 'blob'
        });

        if (!response.data) {
          return await Toast.show({ text: `File not found!` })
        }

        const readFile = await CapFileOpenner({ type: 'blob', data: response.data, name: pdfRefFile.Name });
      }

    } catch (error) {
      await Toast.show({ text: `Can not read file, Error: ${JSON.stringify(error)}` });
    }

  }


  if (fileType === 'pdf') {
    return (
      <ListItem sx={{ px: 0.1, }}>
        <Box
        // component='a' href={`${d.URL}`} target='_blank' rel="noopener noreferrer"
        >
          <Chip
            icon={<Iconify icon={IconName.pdf} sx={{ fontSize: 28 }} />}
            sx={chipStyles}
            tabIndex={-1}
            // label={d?.Name}
            label={<Box
              component='a'
              target='_blank'
              rel="noopener noreferrer"
              href={`${d.URL}`}
            >{d?.Name}</Box>}
            {...(showDeleteButton && {
              onDelete: () => onDelete(d)
            })}
          // onDelete={() => handleDelete(d)}
          />
        </Box>
      </ListItem>
    );
  }

  if (fileType === 'image') {
    return (
      <ListItem sx={{ px: 0.5 }} onClick={() => handleOpenImage()}>
        <Box>
          <Chip
            icon={<Iconify icon={IconName.image} sx={{ fontSize: 28 }} />}
            sx={chipStyles}
            tabIndex={-1}
            label={d?.Name}
            {...(showDeleteButton && {
              onDelete: () => onDelete(d)
            })}
          />
        </Box>
      </ListItem>
    );
  }

  if (fileType === 'msg') {
    return (
      <MsgFileViewer file={d}
        showDeleteButton={showDeleteButton}
        onDelete={onDelete}
      />
    );
  }

  if (fileType === 'excel' || fileType === 'word') {
    const pdfRefFile = attachments.find(file => Number(file.RefId) === Number(d.Id));
    return (
      <ListItem sx={{ px: 0.5 }}  >
        <Box
        >
          <Chip
            icon={<Iconify icon={IconName.excel} sx={{ fontSize: 28 }} />}
            sx={chipStyles}
            tabIndex={-1}
            // label={d?.Name}
            label={<Box
              onClick={handleViewFile}
            // {...platform === 'android' ? {
            //   component: 'a',
            //   target: '_blank',
            //   rel: "noopener noreferrer",
            //   href: `${pdfRefFile.URL}`,
            // } : { onClick: () => handleViewFile() }}
            >{d?.Name}</Box>}
            {...(showDeleteButton && {
              onDelete: () => onDelete(d)
            })}
          />
        </Box>
      </ListItem>
    );
  }

  return (

    <ListItem sx={{ px: 0.5 }}  >
      <Box
      >
        <Chip
          icon={<Iconify icon={IconName.document} sx={{ fontSize: 28 }} />}
          sx={chipStyles}
          tabIndex={-1}
          // label={d?.Name}
          label={<Box
            component='a' target='_blank'
            rel="noopener noreferrer"
            href={d?.URL}
          >{d?.Name}</Box>}
          {...(showDeleteButton && {
            onDelete: () => onDelete(d)
          })}
        />
      </Box>
    </ListItem>
  );
};
