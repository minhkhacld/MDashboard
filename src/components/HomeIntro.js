import React, { useState } from 'react';
import { capitalCase } from 'change-case';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { m } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Typography, Box, Stack, colors, Button, Grid } from '@mui/material';
import { varTranEnter, varTranExit } from './animate/variants';
import { PAYMENT_KEY, APP_VERSIONS } from '../config';
import { PATH_APP } from '../routes/paths';
import useResponsive from '../hooks/useResponsive';
import Image from './Image';
import PlayStore from '../assets/images/playstore.png';
import AppStore from '../assets/images/apple-app-store-logo.jpg';

export default function HomeIntro() {
  const navigate = useNavigate();

  const allTags = PAYMENT_KEY.sort((a, b) => (a.label.toString().localeCompare(b.label))).map((d) => capitalCase(d.label));

  const smUp = useResponsive('up', 'sm');
  const onlyMd = useResponsive('only', 'md');
  const smDown = useResponsive('down', 'sm');
  const lgUp = useResponsive('up', 'lg');
  const [tags, setTags] = useState(allTags);

  const settings = {
    dots: false,
    autoplay: true,
    autoplaySpeed: 1500,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    vertical: true,
    waitForAnimate: true,
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const variant = () => {
    if (lgUp) {
      return 'h2';
    }
    if (onlyMd) {
      return 'h4';
    }
    if (smDown) {
      return 'h3';
    }
    return 'h2';
  };

  return (
    <m.div
      initial={{ y: -160, opacity: 0 }}
      animate={{
        y: 0,
        transition: { ...varTranEnter(), delay: 0.5 },
        opacity: 1,
      }}
      exit={{
        y: -160,
        transition: varTranExit(),
        opacity: 0,
      }}
    >
      <Stack
        direction="column"
        justifyContent="center"
        alignItems={'center'}
        width={'100%'}
        height={'100%'}
        sx={{
          minHeight: {
            xs: 200,
            sm: 300,
            md: 400,
            lg: 600,
          },
        }}
        p={0}
      >
        <Typography variant={variant()} flexWrap>
          Web and Mobile
        </Typography>
        <Typography variant={variant()} flexWrap>
          Application for
        </Typography>

        <Slider {...settings}>
          {tags.map((tag, index) => (
            <Box key={`${tag}${index}`} width="100%" justifyContent="center" alignItems="center">
              <Typography
                variant={variant()}
                width="100%"
                textAlign={'center'}
                sx={{
                  color: PAYMENT_KEY[PAYMENT_KEY.findIndex((d) => d.label === tag)] || colors.red[500],
                }}
              >
                {tag}
              </Typography>
            </Box>
          ))}
        </Slider>

        {Capacitor.getPlatform() === 'web' && (
          <Stack
            direction="row"
            mt={1}
            display="flex"
            columnGap={3}
            justifyContent="space-evenly"
            alignItems={'center'}
          >
            <Box
              component={'a'}
              // href={`https://play.google.com/store/apps/details?id=com.motivesvn.reactjsebs`}
              href={APP_VERSIONS.appUrlAndroid}
              target={'_blank'}
              download
            >
              <Image src={PlayStore} sx={{ height: 45, maxWidth: 150 }} />
            </Box>
            <Box component={'a'} href={APP_VERSIONS.appUrlIos} target={'_blank'} download>
              <Image src={AppStore} sx={{ height: 45, maxWidth: 150 }} />
            </Box>
          </Stack>
        )}
      </Stack>
    </m.div>
  );
}
