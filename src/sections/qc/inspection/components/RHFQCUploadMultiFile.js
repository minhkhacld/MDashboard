import { Capacitor } from '@capacitor/core';
import PropTypes from 'prop-types';
// form
import { Controller, useFormContext } from 'react-hook-form';
// @mui
import { Backdrop, Box, Button, CircularProgress, FormHelperText, Stack, Typography, styled, useTheme } from '@mui/material';
import { useDropzone } from 'react-dropzone';
// utils
//
import MobileBlockContent from '../../../../components/upload/MobileBlockContent';
import RejectionFiles from '../../../../components/upload/RejectionFiles';
// icon name
// HOST_API
// hoooks
import { UploadIllustration } from '../../../../assets';
import useLocales from '../../../../hooks/useLocales';
import QCMultiFilePreview from './QCMultifilePreview';

// ----------------------------------------------------------------------
RHFQCUploadMultiFile.propTypes = {
  name: PropTypes.string,
};

export function RHFQCUploadMultiFile({ name, ...other }) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        // console.log(field);
        const checkError = !!error && field.value?.length === 0;
        const files = typeof other?.filter === "function" ? field.value.filter(d => other?.filter(d)) : field?.value;
        return (
          <QCUploadMultiFile
            accept={other.accept ? other.accept : 'image/*'}
            // files={field.value}
            files={files}
            error={checkError}
            helperText={
              checkError && (
                <FormHelperText error sx={{ px: 2 }}>
                  {error?.message}
                </FormHelperText>
              )
            }
            {...other}
          />
        );
      }}
    />
  );
};


const DropZoneStyle = styled('div')(({ theme }) => ({
  outline: 'none',
  overflow: 'hidden',
  position: 'relative',
  //   padding: theme.spacing(3, 1),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create('padding'),
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': { opacity: 0.72, cursor: 'pointer' },
}));

const DropZoneStyleCapacitor = styled('div')(({ theme }) => ({
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
}));

QCUploadMultiFile.propTypes = {
  error: PropTypes.any,
  showPreview: PropTypes.bool,
  files: PropTypes.any,
  onUpload: PropTypes.func,
  onRemove: PropTypes.func,
  onRemoveAll: PropTypes.func,
  helperText: PropTypes.any,
  sx: PropTypes.object,
  other: PropTypes.object
};


function QCUploadMultiFile({
  error,
  showPreview = true,
  files,
  onUpload,
  onRemove,
  onRemoveAll,
  helperText,
  sx,
  showRemoveAll = true,
  // progress = { progress: 0, total: 0 },
  ...other
}) {

  const isWebApp = Capacitor.getPlatform() === 'web';
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections, open } = useDropzone({
    ...other,
    multiple: true,
    maxFiles: isWebApp ? 50 : 10,
    ...(!isWebApp && {
      noClick: true,
      noDrag: true,
      noKeyboard: true,
      useFsAccessApi: true,
      disabled: other?.disabled,
    })
  });

  const { translate } = useLocales();
  const insertAndUpdateImage = files.length === 0 ? [] : files.filter((d) => d.Action !== 'Delete') || [];

  const theme = useTheme();
  // const imageProcessingProgress = Math.round(progress.progress / progress.total * 100) || 0;

  return (
    <Box sx={{ width: '100%', ...sx }} id="attachment-view-box">

      {other?.processing &&
        (
          <Backdrop
            sx={{
              color: '#fff',
              zIndex: `${10000000000} !important`,
              position: 'fixed',
              width: '100vw',
              height: '100vh',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
            }}
            open={other?.processing}
          >
            <CircularProgress color="primary" />
          </Backdrop>
        )}

      {isWebApp ? (
        <DropZoneStyle
          {...getRootProps()}
          sx={{
            ...(isDragActive && { opacity: 0.72 }),
            ...((isDragReject || error) && {
              color: 'error.main',
              borderColor: 'error.light',
              bgcolor: 'error.lighter',
            }),
            p: 0,
            m: 0,
          }}
        >
          <input {...getInputProps()} />
          <MobileBlockContent showGraphic={other?.showGraphic} />
        </DropZoneStyle>
      ) : (
        <Stack direction={'row'} spacing={2}>
          <DropZoneStyleCapacitor onClick={() => other?.handleCamera()}>
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24">
              <path
                fill="#007b55"
                d="M12 17.5q1.875 0 3.188-1.313T16.5 13q0-1.875-1.313-3.188T12 8.5q-1.875 0-3.188 1.313T7.5 13q0 1.875 1.313 3.188T12 17.5ZM4 21q-.825 0-1.413-.588T2 19V7q0-.825.588-1.413T4 5h3.15L9 3h6l1.85 2H20q.825 0 1.413.588T22 7v12q0 .825-.588 1.413T20 21H4Z"
              />
            </svg>
          </DropZoneStyleCapacitor>
          <DropZoneStyleCapacitor
            {...getRootProps()}
            sx={{
              ...(isDragActive && { opacity: 0.72 }),
              ...((isDragReject || error) && {
                color: 'error.dark',
                borderColor: 'error.light',
                bgcolor: 'error.lighter',
              }),
            }}
            {...(!isWebApp && !other?.disabled && {
              onClick: other?.onOpenGallary
            })}
          >
            <input {...getInputProps()} />
            <UploadIllustration sx={{ height: 70 }} />
          </DropZoneStyleCapacitor>
        </Stack>
      )}

      {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}

      {other?.showTotal && (
        <Box mt={2}>
          <Typography variant="title">{`Attachments: `}</Typography>
          <strong>{insertAndUpdateImage.length}</strong>
        </Box>
      )}

      <QCMultiFilePreview
        files={insertAndUpdateImage}
        showPreview={showPreview}
        onRemove={onRemove}
        setOpenLightbox={other.setOpenLightbox}
        setSelectedImage={other.setSelectedImage}
        imagesLightbox={other.imagesLightbox}
        onClick={other.onClick}
        {...other}
      />

      {insertAndUpdateImage.length > 0 && showRemoveAll && (
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button color="inherit" size="small" onClick={onRemoveAll} disabled={other?.disabled}>
            {translate('button.removeAll')}
          </Button>
        </Stack>
      )}

      {helperText && helperText}

    </Box>
  );
};
