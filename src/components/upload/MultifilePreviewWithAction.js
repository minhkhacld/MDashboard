import PropTypes from 'prop-types';
import { m, AnimatePresence } from 'framer-motion';
// @mui
import { alpha } from '@mui/material/styles';
import { List, IconButton, ListItemText, ListItem, Stack, Typography, useTheme, Box } from '@mui/material';
// utils
import { fData } from '../../utils/formatNumber';
import getFileData from '../../utils/getFileData';
//
import Image from '../Image';
import Iconify from '../Iconify';
import { varFade } from '../animate';
// icon name
import IconName from '../../utils/iconsName';
// HOST_API
import { QC_ATTACHEMENTS_HOST_API } from '../../config';
// hoooks
import useResponsive from '../../hooks/useResponsive';
import useIsOnline from '../../hooks/useIsOnline';

// ----------------------------------------------------------------------

MultiFilePreviewWithActions.propTypes = {
  files: PropTypes.array.isRequired,
  onRemove: PropTypes.func,
  showPreview: PropTypes.bool,
  onSetDefault: PropTypes.func,
  defaultImage: PropTypes.string,
};

export default function MultiFilePreviewWithActions({
  showPreview = false,
  files,
  onRemove,
  onSetDefault,
  defaultImage,
  stateIndex,
  ...other
}) {
  const smUp = useResponsive('up', 'sm');
  const hasFile = files.length > 0;
  const { online } = useIsOnline();
  const renderSource = (file, index) => {
    if (file?.preview !== undefined && file?.preview !== null) {
      return `${file?.preview}`;
    }
    if (file.Data === null && online) {
      return `${QC_ATTACHEMENTS_HOST_API}/${file?.Guid}`;
    }
    return `${file?.Data}`;
  };

  return (
    <List
      disablePadding
      sx={{
        ...(hasFile && { my: 3 }),
      }}
    >
      <AnimatePresence>
        {files.map((file, index) => {
          const { key, name, size, preview } = getFileData(file, index);
          const source = renderSource(file, index);
          if (showPreview) {
            return (
              <ListItem
                key={file?.Id ? file?.Id : index}
                sx={{
                  p: 0,
                  m: 0.5,
                  width: 80,
                  height: 80,
                  borderRadius: 1.25,
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'inline-flex',
                  border: (theme) => `solid 1px ${theme.palette.divider}`,
                }}
              >
                <Image
                  alt="preview"
                  src={source}
                  ratio="1/1"
                  onClick={(e) => {
                    if (other?.onClick) {
                      other?.onClick(file, e);
                    }
                  }}
                />
              </ListItem>
            );
          }

          return (
            <ListItem
              key={file.id}
              // component={div}
              // component={m.div}
              // {...varFade().inRight}
              sx={{
                my: 1,
                px: 2,
                py: 0.75,
                borderRadius: 0.75,
                border: (theme) => `solid 1px ${theme.palette.divider}`,
                width: smUp ? '30%' : '100%',
              }}
            >
              <Iconify
                icon={file?.Data ? 'ic:outline-image' : 'eva:file-fill'}
                sx={{ width: 28, height: 28, color: 'text.secondary', mr: 2 }}
              />

              <ListItemText
                // primary={typeof file === 'string' ? file : name}
                primary={typeof file === 'string' ? file : file.fileName || file?.Name}
                // secondary={typeof file === 'string' ? '' : fData(size || 0)}
                primaryTypographyProps={{ variant: 'subtitle2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
                onClick={() => {
                  if (other?.onClick) {
                    other?.onClick(file);
                  }
                }}
              />
            </ListItem>
          );
        })}
      </AnimatePresence>
    </List>
  );
}
