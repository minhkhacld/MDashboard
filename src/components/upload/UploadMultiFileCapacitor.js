import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
import { ScrollView } from 'devextreme-react';
import { Capacitor } from '@capacitor/core';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, Button, Typography, useTheme, } from '@mui/material';
//
import BlockContent from './BlockContent';
import RejectionFiles from './RejectionFiles';
import MultiFilePreview from './MultiFilePreview';
import MultiFilePreviewWithActions from './MultifilePreviewWithAction';
import useLocales from '../../hooks/useLocales';
import MobileBlockContent from './MobileBlockContent';
import Iconify from '../Iconify';
import { UploadIllustration } from '../../assets';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(3, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
  width: '50%',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  maxHeight: 120,
}));

// ----------------------------------------------------------------------

UploadMultiFileCapacitor.propTypes = {
  files: PropTypes.array.isRequired,
  error: PropTypes.bool,
  showPreview: PropTypes.bool,
  onUpload: PropTypes.func,
  onRemove: PropTypes.func,
  onRemoveAll: PropTypes.func,
  helperText: PropTypes.node,
  onSetDefault: PropTypes.func,
  defaultImage: PropTypes.string,
  sx: PropTypes.object,
};

export default function UploadMultiFileCapacitor({
  error,
  showPreview = false,
  files,
  onUpload,
  onRemove,
  onRemoveAll,
  helperText,
  onSetDefault,
  defaultImage,
  sx,
  ...other
}) {

  const isWebApp = Capacitor.getPlatform() === 'web';
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    ...other,
    multiple: true,
    ...(other?.onOpenGallary && {
      noClick: true,
      noDrag: true,
      noKeyboard: true,
      useFsAccessApi: true,
      disabled: other?.disabled,
    })
  });
  const { translate } = useLocales();

  const theme = useTheme();
  // console.log(getInputProps())
  return (
    <Box sx={{ width: '100%', ...sx }} id="attachment-view-box">
      <Stack direction={'row'} spacing={2}>
        <DropZoneStyle
          {...getRootProps()}
          onClick={() => {
            if (other?.disabled) return;
            other?.handleCamera();
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24">
            <path
              fill={theme.palette.primary.main}
              d="M12 17.5q1.875 0 3.188-1.313T16.5 13q0-1.875-1.313-3.188T12 8.5q-1.875 0-3.188 1.313T7.5 13q0 1.875 1.313 3.188T12 17.5ZM4 21q-.825 0-1.413-.588T2 19V7q0-.825.588-1.413T4 5h3.15L9 3h6l1.85 2H20q.825 0 1.413.588T22 7v12q0 .825-.588 1.413T20 21H4Z"
            />
          </svg>
        </DropZoneStyle>
        <DropZoneStyle
          {...getRootProps()}
          sx={{
            ...(isDragActive && { opacity: 0.72 }),
            ...((isDragReject || error) && {
              color: 'error.dark',
              borderColor: 'error.light',
              bgcolor: 'error.lighter',
            }),
          }}
          {...(other?.onOpenGallary && !other?.disabled && {
            onClick: other?.onOpenGallary
          })}
        >
          <input {...getInputProps()} />
          <UploadIllustration sx={{ height: 70 }} />
        </DropZoneStyle>
      </Stack>

      {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}

      {other?.showTotal && (
        <Box mt={2}>
          <Typography variant="title">{`Attachments: `}</Typography>
          <strong>{files.length}</strong>
        </Box>
      )}

      {files.length > 0 && (
        <ScrollView style={{ height: 250 }}>
          {other?.showMenuActions ? (
            <MultiFilePreviewWithActions
              files={files}
              showPreview={showPreview}
              onRemove={onRemove}
              onSetDefault={onSetDefault}
              defaultImage={defaultImage}
              stateIndex={other.stateIndex}
              setOpenLightbox={other.setOpenLightbox}
              setSelectedImage={other.setSelectedImage}
              imagesLightbox={other.imagesLightbox}
              {...other}
            />
          ) : (
            <MultiFilePreview
              files={files}
              showPreview={showPreview}
              onRemove={onRemove}
              onSetDefault={onSetDefault}
              defaultImage={defaultImage}
              stateIndex={other.stateIndex}
              setOpenLightbox={other.setOpenLightbox}
              setSelectedImage={other.setSelectedImage}
              imagesLightbox={other.imagesLightbox}
              {...other}
            />
          )}
        </ScrollView>
      )}

      {files.length > 0 && other?.showRemoveAll && (
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button color="inherit" size="small" onClick={onRemoveAll}
            disabled={other?.disabled}
          >
            {translate('button.removeAll')}
          </Button>
          {/* <Button size="small" type="submit" variant="contained" onClick={onUpload}>
            {translate('button.uploadFiles')}
          </Button> */}
        </Stack>
      )}

      {helperText && helperText}
    </Box>
  );
}
