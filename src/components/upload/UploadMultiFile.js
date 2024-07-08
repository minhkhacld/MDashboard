import { ScrollView } from 'devextreme-react';
import PropTypes from 'prop-types';
import { useDropzone } from 'react-dropzone';
// @mui
import { Box, Stack, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
//
import useLocales from '../../hooks/useLocales';
import BlockContent from './BlockContent';
import MobileBlockContent from './MobileBlockContent';
import MultiFilePreview from './MultiFilePreview';
import MultiFilePreviewWithActions from './MultifilePreviewWithAction';
import RejectionFiles from './RejectionFiles';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  padding: theme.spacing(3, 1),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

// ----------------------------------------------------------------------

UploadMultiFile.propTypes = {
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

export default function UploadMultiFile({
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

  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    ...other,
  });
  const { translate } = useLocales();

  return (
    <Box sx={{ width: '100%', ...sx }} id="attachment-view-box">
      {!other?.disableBlockContent &&
        <DropZoneStyle
          {...getRootProps()}
          sx={{
            ...(isDragActive && { opacity: 0.72 }),
            ...((isDragReject || error) && {
              color: 'error.main',
              borderColor: 'error.light',
              bgcolor: 'error.lighter',
            }),
          }}
        >
          <input {...getInputProps()} />
          {other?.smallBlockContent ? <MobileBlockContent /> : <BlockContent showGraphic={other.showGraphic} />}
        </DropZoneStyle>
      }

      {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}

      {other?.showTotal && files.length > 0 && (
        <Stack mt={2} direction='row' spacing={1}>
          <Typography variant="body2">{`Images: ${files.length}`}</Typography>
          {/* <strong>{files.length}</strong> */}
        </Stack>
      )}

      {files.length > 0 && (
        <ScrollView style={{ height: 160 }}>
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
