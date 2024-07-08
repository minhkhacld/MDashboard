import { Box } from '@mui/material';
import { m } from 'framer-motion';
// import applicationImage from '../assets/application_devices.png';
import useResponsive from '../hooks/useResponsive';
import { varTranEnter, varTranExit } from './animate/variants';
import Image from './Image';

function ApplicationImage() {
  const smUp = useResponsive('up', 'sm');
  const lgUp = useResponsive('up', 'lg');
  return (
    <Box
      display={'flex'}
      direction="column"
      justifyContent="center"
      alignItems={'center'}
      width={'100%'}
      height={'100%'}
    >
      <m.div
        initial={{ x: 160, opacity: 0 }}
        animate={{
          x: 0,
          transition: { ...varTranEnter(), delay: 0.5 },
          opacity: 1,
        }}
        exit={{
          x: 160,
          transition: varTranExit(),
          opacity: 0,
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
        }}
      >
        <Image
          src={imageSrc}
          alt="Application"
          sx={{
            width: {
              xs: '100%',
              sm: '100%',
              md: '70%',
              lg: '60%'
            },
            minWidth: 100,
            minHeight: {
              xs: 250,
              sm: 300,
              md: 400,
              lg: 500
            }
          }}
        />
      </m.div>
    </Box>
  );
};

export default ApplicationImage;

const imageSrc =