import { AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
// @mui
import { IconButton, List, ListItem } from '@mui/material';
// utils
import getFileData from '../../../../utils/getFileData';
//
import Iconify from '../../../../components/Iconify';
import Image from '../../../../components/Image';
// icon name
// HOST_API
import { QC_ATTACHEMENTS_HOST_API } from '../../../../config';
// hoooks

// ----------------------------------------------------------------------

QCMultiFilePreview.propTypes = {
  files: PropTypes.array.isRequired,
  onRemove: PropTypes.func,
  showPreview: PropTypes.bool,
};

export default function QCMultiFilePreview({ showPreview = false, files, onRemove, ...other }) {
  const hasFile = files.length > 0;

  return (
    <List disablePadding sx={{
      ...(hasFile && { my: 3 }),
      maxHeight: {
        xs: 300,
        sm: 500,
        md: 800,
      },
      overflow: 'auto',
    }} >
      <AnimatePresence>
        {files.map((file, index) => {
          const { key, name, size, preview } = getFileData(file, index);
          let ImageSource = null;
          // FOR STEP ATTACHEMENTS IMAGE
          if (file?.URL) {
            ImageSource = file?.URL;
          }
          // FOR STEP INSPECTIONS IMAGES
          else if (file?.Data !== null) {
            ImageSource = file.Data;
          } else if (file.Data === null) {
            ImageSource = `${QC_ATTACHEMENTS_HOST_API}/${file?.Guid}`;
          } else {
            const isFileType = typeof file.name === 'string';
            if (isFileType) {
              const image = Object.assign(file, {
                preview: URL.createObjectURL(file),
              });
              ImageSource = image.preview;
            }
          }
          if (showPreview) {
            return (
              <ListItem
                key={index}
                // key={file.id}
                // component={m.div}
                // {...varFade().inRight}
                sx={{
                  p: 0,
                  m: 0.5,
                  width: { xs: 100, md: 120 },
                  height: { xs: 100, md: 120 },
                  borderRadius: 1.25,
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'inline-flex',
                  border: (theme) => `solid 1px ${theme.palette.divider}`,
                }}
              >
                <Image alt="preview" src={ImageSource} ratio="1/1" onClick={(e) => other?.onClick(file, e)} />
              </ListItem>
            );
          }

          return (
            <ListItem
              key={file.id}
              // component={m.div}
              // {...varFade().inRight}
              sx={{
                my: 1,
                px: 2,
                py: 0.75,
                borderRadius: 0.75,
                border: (theme) => `solid 1px ${theme.palette.divider}`,
              }}
            >
              {onRemove && (
                <IconButton
                  edge="end"
                  size="small"
                  onClick={(e) => onRemove(file, e)}
                  sx={{ position: 'absolute', right: 10 }}
                >
                  <Iconify icon={'eva:close-fill'} />
                </IconButton>
              )}
            </ListItem>
          );
        })}
      </AnimatePresence>
    </List>
  );
}
