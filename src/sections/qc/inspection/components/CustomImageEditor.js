import { Capacitor } from '@capacitor/core';
import { Toast } from '@capacitor/toast';
import { LoadingButton } from '@mui/lab';
import { Box, Stack, Tooltip, useTheme } from '@mui/material';
import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { Arrow, Circle, Group, Image, Layer, Line, Rect, Stage, Text, Transformer, } from 'react-konva';
// import deleteImageSrc from '../../../../assets/icons/delete-outline-rounded.svg';
// Hooks
import useResponsive from '../../../../hooks/useResponsive';
// Components
import Iconify from '../../../../components/Iconify';
import IconName from '../../../../utils/iconsName';
// config
// import { QC_ATTACHEMENTS_HOST_API } from '../../../../config';
// Redux
import Scrollbar from '../../../../components/Scrollbar';
import useIsOnline from '../../../../hooks/useIsOnline';
import useLocales from '../../../../hooks/useLocales';
import { useSelector } from '../../../../redux/store';


const DRAWING_TOOLS = ['ARROW', 'TEXT', 'RECT', 'CIRCLE', 'LINE', 'ROTATE'];

CustomImageEditor.propTypes = {
  source: PropTypes.any,
  handleSave: PropTypes.func
};


export default function CustomImageEditor({ source, handleSave }) {
  // Capacitor
  const isWebapp = Capacitor.getPlatform() === 'web';
  // Hooks
  const smUp = useResponsive('up', 'sm');
  const mdUp = useResponsive('up', 'md');
  const xsUp = useResponsive('up', 'xs');
  const theme = useTheme();
  const { online } = useIsOnline();
  const { translate } = useLocales()
  // Refs
  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const isDrawing = useRef(false);
  const layerRef = useRef(null);
  const notifyRef = useRef(null);
  // Redux
  const reduxEditor = useSelector((store) => store.imageEditor);
  // States
  const [image, setImage] = useState('');
  const [deleteImage, setDeleteImage] = useState('');
  const [shape, setShape] = useState({
    text: [],
    arrow: [],
    circle: [],
    rect: [],
    line: [],
  });
  const [rectangles, setRectangles] = useState([]);
  const [selectedId, selectShape] = useState(null);
  // const [isSelected, setIsSelected] = useState(false);
  const [zooming, setZooming] = useState({
    scale: 1,
    posX: 0,
    posY: 0,
  });
  const [shapeZIndex, setShapeZIndex] = useState({ currentShapeId: null, index: 0 });
  const [drawingTool, setTool] = useState(DRAWING_TOOLS[0]);
  const [isRotateImage, setIsRotateImage] = useState(false);
  const [originalImage, setOriginalImage] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const newImage = new window.Image();
    const deleteImg = new window.Image();
    stageRef.current.container().style.backgroundColor = theme.palette.grey[200];
    stageRef.current.container().style.padding = '0px !important';
    stageRef.current.container().style.margin = '0px !important';
    stageRef.current.container().style.position = 'absolute';
    stageRef.current.container().style.top = '100px';
    stageRef.current.container().style.left = '0px !important';
    stageRef.current.container().style.right = '0px !important';
    stageRef.current.container().style.justifyContent = 'center !important';
    stageRef.current.container().style.alignItems = 'center !important';

    // console.log(stageRef.current);

    newImage.src = source?.Data;
    // if (online) {
    //   deleteImg.src = deleteImageSrc;
    // } else {
    deleteImg.src =
      'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMjQgMjQiPjxwYXRoIGZpbGw9InJlZCIgZD0iTTcgMjFxLS44MjUgMC0xLjQxMi0uNTg3UTUgMTkuODI1IDUgMTlWNnEtLjQyNSAwLS43MTMtLjI4N1E0IDUuNDI1IDQgNXQuMjg3LS43MTNRNC41NzUgNCA1IDRoNHEwLS40MjUuMjg4LS43MTNROS41NzUgMyAxMCAzaDRxLjQyNSAwIC43MTMuMjg3UTE1IDMuNTc1IDE1IDRoNHEuNDI1IDAgLjcxMi4yODdRMjAgNC41NzUgMjAgNXQtLjI4OC43MTNRMTkuNDI1IDYgMTkgNnYxM3EwIC44MjUtLjU4NyAxLjQxM1ExNy44MjUgMjEgMTcgMjFaTTcgNnYxM2gxMFY2Wm0yIDEwcTAgLjQyNS4yODguNzEyUTkuNTc1IDE3IDEwIDE3dC43MTMtLjI4OFExMSAxNi40MjUgMTEgMTZWOXEwLS40MjUtLjI4Ny0uNzEzUTEwLjQyNSA4IDEwIDh0LS43MTIuMjg3UTkgOC41NzUgOSA5Wm00IDBxMCAuNDI1LjI4OC43MTJxLjI4Ny4yODguNzEyLjI4OHQuNzEzLS4yODhRMTUgMTYuNDI1IDE1IDE2VjlxMC0uNDI1LS4yODctLjcxM1ExNC40MjUgOCAxNCA4dC0uNzEyLjI4N1ExMyA4LjU3NSAxMyA5Wk03IDZ2MTNWNloiLz48L3N2Zz4=';
    // }
    // console.log(newImage.width, newImage.height);
    setDeleteImage(deleteImg);
    setOriginalImage({
      width: newImage.width,
      height: newImage.height
    })
    getScaledImageCoordinates(
      stageRef.current.attrs.width,
      stageRef.current.attrs.height,
      newImage.width,
      newImage.height,
      newImage,
      setImage
    );
  }, [xsUp, smUp, mdUp]);

  const getScaledImageCoordinates = (containerWidth, containerHeight, width, height, newImage, setImage) => {
    const widthRatio = containerWidth / width;
    const heightRatio = containerHeight / height;
    const bestRatio = Math.min(widthRatio, heightRatio);
    const newWidth = width * bestRatio;
    const newHeight = height * bestRatio;
    newImage.width = newWidth;
    newImage.height = newHeight;
    const attrs = {
      x: stageRef.current.attrs.width / 2 - newWidth / 2,
      // y: (stageRef.current.height() - BUTTON_GROUP_HEIGHT * 2 - height) / 2,
      y: stageRef.current.attrs.height / 2 - newHeight / 2,
      shapeZIndex: { currentShapeId: 1, index: 1 },
    };
    imageRef.current.setAttrs(attrs);
    setImage(newImage);
  };

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target.attrs?.id === undefined || e.target.attrs?.id === null;
    if (clickedOnEmpty) {
      selectShape(null);
      const textArea = document.getElementsByClassName('textarea-editor');
      if (textArea.length > 0) {
        document.body.removeChild(textArea[0]);
      }
    }
  };

  const addNewArrow = () => {
    const WIDTH = stageRef.current.attrs.width;
    const HEIGHT = stageRef.current.attrs.height;
    const arrow =
      shape.arrow.length === 0
        ? {
          x1: WIDTH / 2 - 150,
          y1: HEIGHT / 2 - 150,
          x2: WIDTH / 2,
          y2: HEIGHT / 2,
          id: `arrow${shape.arrow.length + 1}`,
          ...reduxEditor.ARROW,
        }
        : {
          x1: shape.arrow.slice(-1)[0]?.x1 + 10,
          y1: shape.arrow.slice(-1)[0]?.y1 + 10,
          x2: shape.arrow.slice(-1)[0]?.x2 + 10,
          y2: shape.arrow.slice(-1)[0]?.y2 + 10,
          id: `arrow${shape.arrow.length + 1}`,
          ...reduxEditor.ARROW,
        };
    setShape({ ...shape, arrow: [...shape.arrow, arrow] });
    setTool(DRAWING_TOOLS[0]);
    selectShape(arrow.id);
  };

  const addNewText = () => {
    const WIDTH = stageRef.current.attrs.width;
    const HEIGHT = stageRef.current.attrs.height;
    const text =
      shape.text.length === 0
        ? {
          id: `text${shape.text.length + 1}`,
          x: WIDTH / 2 - 125,
          y: HEIGHT / 2 - 100,
          text: 'Type your remark...',
          width: 200,
          height: 100,
          ...reduxEditor.TEXT,
        }
        : {
          id: `text${shape.text.length + 1}`,
          x: WIDTH / 2 - 125 + 10,
          y: HEIGHT / 2 - 100,
          text: 'Type your remark...',
          width: 200,
          height: 100,
          ...reduxEditor.TEXT,
        };
    setShape({ ...shape, text: [...shape.text, text] });
    setTool(DRAWING_TOOLS[1]);
    selectShape(text.id);
    // console.log('default', stageRef.current.find(text.id));
  };

  const addNewRect = () => {
    const WIDTH = stageRef.current.attrs.width;
    const HEIGHT = stageRef.current.attrs.height;
    const rect =
      shape.rect.length === 0
        ? {
          id: `rect${shape.rect.length + 1}`,
          x: WIDTH / 2 - 75,
          y: HEIGHT / 2 - 100,
          width: 150,
          height: 100,
          ...reduxEditor.RECT,
        }
        : {
          id: `rect${shape.rect.length + 1}`,
          x: WIDTH / 2 - 75 + 10,
          y: HEIGHT / 2 - 100,
          width: 150,
          height: 100,
          ...reduxEditor.RECT,
        };
    setShape({ ...shape, rect: [...shape.rect, rect] });
    setTool(DRAWING_TOOLS[2]);
    selectShape(rect.id);
  };

  const addNewCircle = () => {
    const WIDTH = stageRef.current.attrs.width;
    const HEIGHT = stageRef.current.attrs.height;
    const circle =
      shape.circle.length === 0
        ? {
          id: `circle${shape.circle.length + 1}`,
          x: WIDTH / 2 - 50,
          y: HEIGHT / 2 - 50,
          width: 100,
          height: 100,
          radius: 50,
          ...reduxEditor.CIRCLE,
        }
        : {
          id: `circle${shape.circle.length + 1}`,
          x: WIDTH / 2 - 50 + 10,
          y: HEIGHT / 2 - 50,
          width: 100,
          height: 100,
          radius: 50,
          ...reduxEditor.CIRCLE,
        };
    setShape({ ...shape, circle: [...shape.circle, circle] });
    setTool(DRAWING_TOOLS[3]);
    selectShape(circle.id);
  };

  const handleFreeDrawing = () => {
    isDrawing.current = true;
    setTool(DRAWING_TOOLS[4]);
  };

  const handleRotateImg = () => {
    const degToRad = (angle) => {
      return (angle / 180) * Math.PI;
    };

    const getCenter = (shape) => {
      const angleRad = degToRad(shape.rotation || 0);
      return {
        x: shape.x + (shape.width / 2) * Math.cos(angleRad) + (shape.height / 2) * Math.sin(-angleRad),
        y: shape.y + (shape.height / 2) * Math.cos(angleRad) + (shape.width / 2) * Math.sin(angleRad),
      };
    };

    const rotateAroundPoint = (shape, deltaDeg, point) => {
      const angleRad = degToRad(deltaDeg);
      const x = Math.round(
        point.x + (shape.x - point.x) * Math.cos(angleRad) - (shape.y - point.y) * Math.sin(angleRad)
      );
      const y = Math.round(
        point.y + (shape.x - point.x) * Math.sin(angleRad) + (shape.y - point.y) * Math.cos(angleRad)
      );
      return {
        ...shape,
        rotation: Math.round(shape.rotation + deltaDeg),
        x,
        y,
      };
    };

    const rotateAroundCenter = (shape, deltaDeg) => {
      const center = getCenter(shape);
      return rotateAroundPoint(shape, deltaDeg, center);
    };

    // usage
    const attrs = {
      x: imageRef.current.x(),
      y: imageRef.current.y(),
      width: imageRef.current.width(),
      height: imageRef.current.height(),
      rotation: imageRef.current.rotation(),
    };

    const rotatedAttrs = rotateAroundCenter(attrs, 90);
    imageRef.current.setAttrs(rotatedAttrs);
    setIsRotateImage(!isRotateImage)
  };

  const handleZoom = (scale) => {
    const newCenter = {
      x: stageRef.current.width() / 2 - imageRef.current.width() / 2,
      y: stageRef.current.height() / 2 - imageRef.current.height() / 2,
    };
    const pointTo = {
      x: (newCenter.x - stageRef.current.x()) / stageRef.current.scaleX(),
      y: (newCenter.y - stageRef.current.y()) / stageRef.current.scaleX(),
    };
    const newPos = {
      x: newCenter.x - pointTo.x * scale,
      y: newCenter.y - pointTo.y * scale,
    };
    stageRef.current.scaleX(stageRef.current.attrs.scaleX + scale);
    stageRef.current.scaleY(stageRef.current.attrs.scaleX + scale);
    stageRef.current.position(newPos);
  };

  // Custom tools
  const TOOLS = [
    {
      text: 'Arrow',
      icon: IconName.arrowRight,
      // key: 'Arrow',
      onClick: () => addNewArrow(),
      tooltip: 'Add arrow',
      key: DRAWING_TOOLS[0],
    },
    {
      text: 'Text',
      icon: 'material-symbols:format-color-text',
      // key: 'Text',
      onClick: () => addNewText(),
      tooltip: 'Add text',
      key: DRAWING_TOOLS[1],
    },
    {
      text: 'Rect',
      icon: 'material-symbols:crop-square-outline',
      // key: 'Rect',
      onClick: () => addNewRect(),
      tooltip: 'Add rectangle',
      key: DRAWING_TOOLS[2],
    },
    {
      text: 'Circle',
      icon: 'fluent-mdl2:circle-shape',
      // key: 'Circle',
      onClick: () => addNewCircle(),
      tooltip: 'Add circle',
      key: DRAWING_TOOLS[3],
    },
    // {
    //   text: 'Line',
    //   icon: 'icon-park-outline:curve-adjustment',
    //   // key: 'Circle',
    //   onClick: () => handleFreeDrawing(),
    //   tooltip: 'Add circle',
    //   key: DRAWING_TOOLS[4],
    // },
    {
      text: 'Rotate',
      icon: 'material-symbols:rotate-left',
      // key: 'Circle',
      onClick: () => handleRotateImg(),
      tooltip: 'Rotate image',
      key: DRAWING_TOOLS[5],
    },
  ];

  // ---------------------------------SAVE-----------------------------
  const onSave = async () => {
    const reset = () => {
      return new Promise((resolve, reject) => {
        resolve(onResetCanvas());
      });
    };
    reset().then((res) => {
      layerRef?.current.position({ x: 0, y: 0 });
      if (isRotateImage) {
        layerRef?.current.width(originalImage.height);
        layerRef?.current.height(originalImage.width);
        const imgSrc = layerRef.current.toDataURL();
        handleSave(imgSrc);
      } else {
        layerRef?.current.width(imageRef.current.width());
        layerRef?.current.height(imageRef.current.height());
        const imgSrc = layerRef.current.toDataURL({ pixelRatio: 2 });
        handleSave(imgSrc);
      }

      // const imgSrc = stageRef.current.toDataURL({ pixelRatio: 2 });
      // const imgSrc = layerRef.current.toDataURL();
      // handleSave(imgSrc);
    });
  };

  // ZOOMING
  const handleWheele = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.2;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const mousePointTo = {
      x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
      y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    setZooming({
      scale: newScale,
      posX: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
      posY: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
    });
  };

  const onResetCanvas = () => {
    stageRef?.current.position({ x: 0, y: 0 });
    stageRef?.current.width(imageRef.current.width());
    // stageRef?.current.height(imageRef.current.height());
    setZooming({
      scale: 1,
      posX: 0,
      posY: 0,
    });

    selectShape(null);
  };

  const onReset = () => {
    setShape({
      rect: [],
      text: [],
      arrow: [],
      circle: [],
      line: [],
    });
  };

  const resetCanvasState = () => {
    onResetCanvas();
    onReset();
    isDrawing.current = false;
  };

  // FREE DRAWING
  const handleMouseDown = (e) => {
    // no drawing - skipping
    if (drawingTool !== 'LINE' || selectedId !== null) {
      return;
    }
    const pos = e.target.getStage().getPointerPosition();
    setShape({
      ...shape,
      line: [
        ...shape.line,
        {
          id: `line${shape.line.length + 1}`,
          points: [pos.x, pos.y],
          ...reduxEditor.LINE,
        },
      ],
    });
  };

  const handleMouseMove = (e) => {

    if (!e.evt.touches) return
    // mobile zoom
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];
    const stage = e.target.getStage();

    if (touch1 && touch2) {
      if (stage.isDragging()) {
        stage.stopDrag();
      }
      handleMultiTouch(e, touch1, touch2, stage);
    }
    // no drawing - skipping
    if (drawingTool !== 'LINE') {
      return;
    }
    const point = stage.getPointerPosition();
    const lastLine = shape.line[shape.line.length - 1];
    // add point
    lastLine.points = lastLine.points.concat([point.x, point.y]);
    // replace last
    shape.line.splice(shape.line.length - 1, 1, lastLine);
    setShape({ ...shape, line: shape.line.concat() });
    selectShape(lastLine.id);
  };

  const multiTouchEnd = () => {
    lastCenter = null;
    lastDist = 0;
  };

  const handleMouseUp = (e) => {
    multiTouchEnd();
  };

  // For ios mobile browser
  function getDistance(p1, p2) {
    // eslint-disable-next-line
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  function getCenter(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  let lastCenter = null;
  let lastDist = 0;

  const handleMultiTouch = (e, touch1, touch2, stage) => {
    // e.evt.preventDefault();
    const p1 = {
      x: touch1.clientX,
      y: touch1.clientY,
    };
    const p2 = {
      x: touch2.clientX,
      y: touch2.clientY,
    };

    if (!lastCenter) {
      lastCenter = getCenter(p1, p2);
      return;
    }

    const newCenter = getCenter(p1, p2);

    const dist = getDistance(p1, p2);
    // console.log('getDistance', newCenter.x, newCenter.y, dist);

    if (!lastDist) {
      lastDist = dist;
    }

    // local coordinates of center point
    const pointTo = {
      x: (newCenter.x - stage.x()) / stage.scaleX(),
      y: (newCenter.y - stage.y()) / stage.scaleX(),
    };

    const scale = stage.scaleX() * (dist / lastDist);
    // console.log('scale', scale);

    stage.scaleX(scale);
    stage.scaleY(scale);

    // calculate new position of the stage
    const dx = newCenter.x - lastCenter.x;
    const dy = newCenter.y - lastCenter.y;

    const newPos = {
      x: newCenter.x - pointTo.x * scale + dx,
      y: newCenter.y - pointTo.y * scale + dy,
    };

    stage.position(newPos);
    stage.batchDraw();

    lastDist = dist;
    lastCenter = newCenter;
  };


  // Image zoom scale
  let lastImgCenter = null;
  let lastImgDist = 0;

  const handleTouchMove = (e) => {
    // mobile zoom
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];
    const stage = e.target.getStage();

    if (touch1 && touch2) {
      if (stage.isDragging()) {
        stage.stopDrag();
      }
      e.evt.preventDefault();
      const p1 = {
        x: touch1.clientX,
        y: touch1.clientY,
      };
      const p2 = {
        x: touch2.clientX,
        y: touch2.clientY,
      };

      if (!lastImgCenter) {
        lastImgCenter = getCenter(p1, p2);
        return;
      }

      const newCenter = getCenter(p1, p2);

      const dist = getDistance(p1, p2);

      if (!lastImgDist) {
        lastImgDist = dist;
      }

      // local coordinates of center point
      const pointTo = {
        x: (newCenter.x - stage.x()) / stage.scaleX(),
        y: (newCenter.y - stage.y()) / stage.scaleX(),
      };

      const scale = stage.scaleX() * (dist / lastImgDist);

      stage.scaleX(scale);
      stage.scaleY(scale);

      // calculate new position of the stage
      const dx = newCenter.x - lastImgCenter.x;
      const dy = newCenter.y - lastImgCenter.y;

      const newPos = {
        x: newCenter.x - pointTo.x * scale + dx,
        y: newCenter.y - pointTo.y * scale + dy,
      };

      stage.position(newPos);
      // imageRef.current.draw();

      lastImgDist = dist;
      lastImgCenter = newCenter;

    }
  };

  const handleTouchUp = () => {
    lastImgCenter = null;
    lastImgDist = 0;
  };

  // handle Notifications
  const handleNotifications = async () => {
    if (notifyRef.current === null) {
      await Toast.show({ text: 'Dùng hai ngón tay để di chuyển, phóng to, nhỏ hình ảnh', duration: 'short', position: 'bottom' })
      notifyRef.current = false
    };
  };

  // console.log(
  //   // imageRef.current.width(), imageRef.current.height()
  //   //  stageRef.current,
  //   // layerRef,
  //   originalImage,
  //   isRotateImage
  // );

  return (
    <Box
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
      }}
    >
      {/* <Stack
        sx={{
          position: 'absolute',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          top: {
            xs: 120,
            sm: 120,
            md: 120,
          },
          left: {
            xs: 20,
            sm: 20,
            md: 20,
          },
        }}
        spacing={1}
      >
        <IconButton onClick={() => handleZoom(0.1)}>
          <Iconify
            icon="ri:zoom-in-line"
            sx={{
              fontSize: 25,
            }}
          />
        </IconButton>
        <IconButton onClick={() => handleZoom(-0.1)}>
          <Iconify
            icon="ri:zoom-out-line"
            sx={{
              fontSize: 25,
            }}
          />
        </IconButton>
      </Stack> */}
      <Scrollbar sx={{ width: '100%' }}>
        <Stack
          direction={'row'}
          justifyContent="center"
          alignItems={'center'}
          sx={{
            height: 40,
          }}
          spacing={smUp ? 3 : 2}
        >
          <Tooltip title="Save image" arrow>
            <Box sx={{
              justifyContent: 'center',
              alignItems: 'center',
              width: 40,
              display: 'flex',
              flexDirection: 'row',
            }} mr={2}>
              <LoadingButton variant="contained" onClick={onSave} sx={{ height: 30 }}>
                {translate('button.save')}
              </LoadingButton>
            </Box>
          </Tooltip>

          {TOOLS.map((tool) => (
            <Tooltip title={tool.tooltip} key={tool.key} arrow>
              <Box
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 30,
                  height: 40,
                  display: 'flex',
                  flexDirection: 'row',
                }}
                onClick={tool.onClick}
              >
                <CustomIcon tool={tool} drawingTool={drawingTool} />
              </Box>
            </Tooltip>
          ))}

          <Tooltip title={'Clear all'} arrow>
            <Box
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
                width: 30,
                height: 40,
                display: 'flex',
                flexDirection: 'row',
              }}
              onClick={resetCanvasState}
            >
              {online ? (
                <Iconify
                  icon={'material-symbols:reset-image'}
                  sx={{
                    fontSize: 25,
                  }}
                />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21">
                  <g fill="none" fillRule="evenodd" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.578 6.487A8 8 0 1 1 2.5 10.5" />
                    <path d="M7.5 6.5h-4v-4" />
                  </g>
                </svg>
              )}
            </Box>
          </Tooltip>
        </Stack>
      </Scrollbar>

      {/* //Konva Canvas */}

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        id="container"
        ref={(ref) => {
          stageRef.current = ref;
        }}
        onClick={checkDeselect}
        onDblClick={checkDeselect}
        onTap={checkDeselect}
        // For zooming
        onWheel={handleWheele}
        scaleX={zooming.scale}
        scaleY={zooming.scale}
        x={zooming.posX}
        y={zooming.posY}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer
          draggable={isWebapp}
        >
          <Group
            draggable={isWebapp}
            ref={(ref) => {
              layerRef.current = ref;
            }}
          >
            <Image
              image={image}
              ref={(ref) => {
                imageRef.current = ref;
              }}
              draggable={isWebapp}
              onTouchEnd={handleNotifications}
            />

            {/* Arrow */}
            {shape.arrow.map((ele, index) => {
              return (
                <ArrowShape
                  key={index}
                  name={ele.id}
                  shapeProps={ele}
                  isSelected={ele.id === selectedId}
                  onSelect={() => {
                    selectShape(ele.id);
                    if (shapeZIndex.currentShapeId !== ele.id) {
                      setShapeZIndex({
                        currentShapeId: ele.id,
                        index: shapeZIndex.index + 1,
                      });
                    }
                  }}
                  onChange={(newAttrs) => {
                    // console.log('newAttrs', newAttrs);
                    const arrows = shape.arrow;
                    const arowIndex = arrows.findIndex((d) => d.id === ele.id);
                    arrows[arowIndex] = newAttrs;
                    setShape({ ...shape, arrow: arrows });
                  }}
                  {...ele}
                  points={[ele.x1, ele.y1, ele.x2, ele.y2]}
                  deleteImage={deleteImage}
                  selectShape={selectShape}
                  // draggable
                  shapeZIndex={shapeZIndex}
                />
              );
            })}

            {/* Text */}
            {shape.text.map((ele, index) => {
              return (
                <TextShape
                  key={index}
                  name={ele.id}
                  shapeProps={ele}
                  isSelected={ele.id === selectedId}
                  onSelect={() => {
                    selectShape(ele.id);
                    if (shapeZIndex.currentShapeId !== ele.id) {
                      setShapeZIndex({
                        currentShapeId: ele.id,
                        index: shapeZIndex.index + 1,
                      });
                    }
                  }}
                  onChange={(newAttrs) => {
                    //   console.log('newAttrs', newAttrs);
                    const texts = shape.text;
                    const textIndex = texts.findIndex((d) => d.id === ele.id);
                    texts[textIndex] = newAttrs;
                    setShape({ ...shape, text: texts });
                  }}
                  {...ele}
                  deleteImage={deleteImage}
                  stageRef={stageRef}
                  shapeZIndex={shapeZIndex}
                // online={online}
                />
              );
            })}
            {/* Rect */}
            {shape.rect.map((ele, index) => {
              return (
                <RectangleShape
                  key={index}
                  name={ele.id}
                  shapeProps={ele}
                  isSelected={ele.id === selectedId}
                  onSelect={() => {
                    selectShape(ele.id);
                    if (shapeZIndex.currentShapeId !== ele.id) {
                      setShapeZIndex({
                        currentShapeId: ele.id,
                        index: shapeZIndex.index + 1,
                      });
                    }
                  }}
                  onChange={(newAttrs) => {
                    //   console.log('newAttrs', newAttrs);
                    const rects = shape.rect;
                    const rectIndex = rects.findIndex((d) => d.id === ele.id);
                    rects[rectIndex] = newAttrs;
                    setShape({ ...shape, rect: rects });
                  }}
                  {...ele}
                  fill="transparent"
                  draggable
                  strokeEnabled
                  deleteImage={deleteImage}
                  shapeZIndex={shapeZIndex}
                />
              );
            })}
            {/* Circle */}
            {shape.circle.map((ele, index) => {
              return (
                <CircleShape
                  key={index}
                  name={ele.id}
                  shapeProps={ele}
                  isSelected={ele.id === selectedId}
                  onSelect={() => {
                    selectShape(ele.id);
                    if (shapeZIndex.currentShapeId !== ele.id) {
                      setShapeZIndex({
                        currentShapeId: ele.id,
                        index: shapeZIndex.index + 1,
                      });
                    }
                  }}
                  onChange={(newAttrs) => {
                    //   console.log('newAttrs', newAttrs);
                    const circles = shape.circle;
                    const circleIndex = circles.findIndex((d) => d.id === ele.id);
                    circles[circleIndex] = newAttrs;
                    setShape({ ...shape, circle: circles });
                  }}
                  {...ele}
                  deleteImage={deleteImage}
                  shapeZIndex={shapeZIndex}
                />
              );
            })}
            {/* Line drawing */}
            {shape.line.map((ele, index) => {
              return (
                <LineShape
                  key={index}
                  name={ele.id}
                  shapeProps={ele}
                  isSelected={ele.id === selectedId}
                  onSelect={() => {
                    selectShape(ele.id);
                    if (shapeZIndex.currentShapeId !== ele.id) {
                      setShapeZIndex({
                        currentShapeId: ele.id,
                        index: shapeZIndex.index + 1,
                      });
                    }
                  }}
                  onChange={(newAttrs) => {
                    const lines = shape.line;
                    const lineIndex = lines.findIndex((d) => d.id === ele.id);
                    lines[lineIndex] = newAttrs;
                    setShape({ ...shape, line: lines });
                    selectShape(ele.id);
                  }}
                  {...ele}
                  deleteImage={deleteImage}
                  shapeZIndex={shapeZIndex}
                />
              );
            })}
          </Group>
        </Layer>
      </Stage>
    </Box>
  );
};


ArrowShape.propTypes = {
  shapeProps: PropTypes.object,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onChange: PropTypes.func,
  deleteImage: PropTypes.any,
  reduxEditor: PropTypes.any,
  selectShape: PropTypes.any,
  shapeZIndex: PropTypes.any,
  others: PropTypes.object,
};


// Arrows
function ArrowShape({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  deleteImage,
  reduxEditor,
  selectShape,
  shapeZIndex,
  ...others
}) {
  const arrowRef = useRef();
  const theme = useTheme();
  // states
  const [blue1Node, updateBlue1Node] = useState({
    x: 100,
    y: 100,
    fill: theme.palette.warning.main,
    width: 40,
    height: 40,
    draggable: true,
  });
  const [blue2Node, updateBlue2Node] = useState({
    x: 100,
    y: 300,
    fill: theme.palette.warning.main,
    width: 40,
    height: 40,
    draggable: true,
  });

  useEffect(() => {
    if (isSelected) {
      updateBlue1Node({
        ...blue1Node,
        x: arrowRef.current.attrs.x1,
        y: arrowRef.current.attrs.y1,
      });
      updateBlue2Node({
        ...blue2Node,
        x: arrowRef.current.attrs.x2,
        y: arrowRef.current.attrs.y2,
      });
      if (shapeZIndex.currentShapeId === shapeProps.id) {
        arrowRef.current.zIndex(shapeZIndex.index);
      }
    }
  }, [isSelected]);

  const onDeleteShape = () => {
    arrowRef.current.destroy();
  };

  return (
    <>
      <Arrow
        {...others}
        onClick={onSelect}
        onTap={onSelect}
        ref={arrowRef}
        {...shapeProps}
        draggable={false}
        strokeWidth={3}
        pointerWidth={10}
        pointerLength={13}
        strokeEnabled
        pointerAtEnding
        onDragEnd={(e) => {
          // console.log(e.target.x(), shapeProps, blue1Node.x, blue2Node.x);
          onChange({
            ...shapeProps,
            x1: shapeProps.x1 + e.target.x(),
            y1: shapeProps.y1 + e.target.y(),
            x2: shapeProps.x2 + e.target.x(),
            y2: shapeProps.y2 + e.target.y(),
          });
          updateBlue1Node({ ...blue1Node, x: blue1Node.x + e.target.x(), y: blue1Node.y + e.target.y() });
          updateBlue2Node({ ...blue2Node, x: blue2Node.x + e.target.x(), y: blue2Node.y + e.target.y() });
        }}
      />
      {isSelected && (
        <Group>
          <Circle
            {...blue1Node}
            onDragMove={(e) => {
              const { x, y } = e.target.position();
              updateBlue1Node({ ...blue1Node, ...e.target.position() });
              onChange({
                ...shapeProps,
                x1: x,
                y1: y,
              });
            }}
            opacity={0.6}
          />
          <Circle
            {...blue2Node}
            onDragMove={(e) => {
              const { x, y } = e.target.position();
              updateBlue2Node({ ...blue2Node, ...e.target.position() });
              onChange({
                ...shapeProps,
                x2: x,
                y2: y,
              });
            }}
            opacity={0.6}
          />
          {arrowRef.current?.attrs?.x1 && (
            <>
              <Image
                onClick={onDeleteShape}
                onTap={onDeleteShape}
                width={35}
                height={35}
                x={arrowRef.current?.attrs?.x1}
                y={arrowRef.current?.attrs?.y1 - 55}
                image={deleteImage}
                fill="white"
              />
              {/* <DeleteImage
                onClick={onDeleteShape}
                onTap={onDeleteShape}
                width={35}
                height={35}
                x={arrowRef.current?.attrs?.x1}
                y={arrowRef.current?.attrs?.y1 - 55}
                image={deleteImage}
                fill="white"
              /> */}
            </>
          )}
        </Group>
      )}

      {isSelected && (
        <ColorScheme
          shapeRef={arrowRef}
          onChange={onChange}
          shapeProps={shapeProps}
          shapeType={'ARROW'}
          isSelected={isSelected}
        />
      )}
    </>
  );
};



TextShape.propTypes = {
  shapeProps: PropTypes.object,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onChange: PropTypes.func,
  stageRef: PropTypes.any,
  deleteImage: PropTypes.any,
  reduxEditor: PropTypes.any,
  shapeZIndex: PropTypes.any,
  online: PropTypes.bool,
  others: PropTypes.object,
};

// Text
function TextShape({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  stageRef,
  deleteImage,
  shapeZIndex,
  online,
  ...others
}) {
  const textRef = useRef();
  const trTextRef = useRef();

  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trTextRef.current.nodes([textRef.current]);
      trTextRef.current.getLayer().batchDraw();
      if (shapeZIndex.currentShapeId === shapeProps.id) {
        textRef.current.zIndex(shapeZIndex.index);
      }

      // if (textRef.current !== null && textRef.current !== undefined) {
      //   handleDbClick(textRef.current);
      // }
    }
  }, [isSelected]);

  const handleDbClick = (e) => {
    // console.log('default', e, textRef);
    // create textarea and style it
    const textarea = document.createElement('textarea');
    const divarea = document.createElement('div');
    divarea.style.position = 'absolute';
    divarea.style.top = '0px';
    divarea.style.left = '0px';
    divarea.style.width = '100vw';
    divarea.style.height = '100vh';
    divarea.style.backgroundColor = 'black';
    divarea.style.opacity = 0.5;
    divarea.style.zIndex = 100000 - 1;
    document.body.appendChild(divarea);
    document.body.appendChild(textarea);
    // text area config
    const textInput = e?.target?.attrs === undefined ? e?.attrs : e?.target?.attrs;
    textarea.value = textRef.current.text();
    textarea.style.position = 'absolute';
    textarea.classList.add('textarea-editor');
    textarea.style.top = `${textInput?.y + textInput?.height}px`;
    textarea.style.left = `${textInput?.x}px`;
    textarea.style.width = `${textInput?.width}px`;
    textarea.style.height = `${textInput?.height}px`;
    textarea.style.minWidth = `170px`;
    textarea.style.minHeight = `150px`;
    textarea.style.maxHeight = `200px`;
    textarea.style.padding = `${5}px`;
    textarea.style.zIndex = 100000;
    textarea.style.backgroundColor = 'white';
    textarea.focus();
    textarea.select();
    textarea.border = 'none';
    textarea.addEventListener('blur', (e) => {
      // console.log('default', e);
      // hide on enter
      // if (e.keyCode === 13) {
      textRef.current.text(textarea.value);
      document.body.removeChild(textarea);
      document.body.removeChild(divarea);
      // }
    });
  };

  const onDeleteShape = () => {
    textRef.current.destroy();
  };

  return (
    <>
      <Text
        onClick={onSelect}
        onDblClick={handleDbClick}
        onDblTap={handleDbClick}
        onTap={onSelect}
        ref={textRef}
        {...shapeProps}
        draggable
        onTouchEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = textRef.current;
          //   console.log(node);
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
        fill="transparent"
        letterSpacing={1.5}
        fontSize={12}
        strokeWidth={1}
        fontStyle="thin"
        fontFamily="Tahoma"
        {...others}
      />
      {isSelected && (
        <Group>
          <Transformer
            ref={trTextRef}
            padding={5}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />

          <Image
            onClick={onDeleteShape}
            onTap={onDeleteShape}
            width={35}
            height={35}
            x={textRef.current?.attrs?.x - 5 || shapeProps.x - 5}
            y={textRef.current?.attrs?.y - 45 || shapeProps.y - 45}
            image={deleteImage}
            fill="white"
          />

        </Group>
      )}
      {isSelected && (
        <ColorScheme
          shapeRef={textRef}
          onChange={onChange}
          shapeProps={shapeProps}
          shapeType={'TEXT'}
          isSelected={isSelected}
        />
      )}
    </>
  );
};


RectangleShape.propTypes = {
  shapeProps: PropTypes.object,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onChange: PropTypes.func,
  deleteImage: PropTypes.any,
  shapeZIndex: PropTypes.any,
  others: PropTypes.object,
};

// Rectangle
function RectangleShape({ shapeProps, isSelected, onSelect, onChange, deleteImage, shapeZIndex, ...others }) {

  const shapeRef = useRef();
  const trRectRef = useRef();

  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRectRef.current.nodes([shapeRef.current]);
      trRectRef.current.getLayer().batchDraw();
      if (shapeZIndex.currentShapeId === shapeProps.id) {
        shapeRef.current.zIndex(shapeZIndex.index);
      }
    }
  }, [isSelected]);

  const onDeleteShape = () => {
    shapeRef.current.destroy();
  };

  return (
    <>
      <Rect
        {...shapeProps}
        {...others}
        strokeWidth={2}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}

      />
      {isSelected && (
        <Group>
          <Transformer
            ref={trRectRef}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />

          <Image
            onClick={onDeleteShape}
            onTap={onDeleteShape}
            width={35}
            height={35}
            x={shapeRef.current?.attrs?.x - 5 || shapeProps.x}
            y={shapeRef.current?.attrs?.y - 45 || shapeProps.y - 45}
            image={deleteImage}
            fill="white"
          />
        </Group>
      )}
      {isSelected && (
        <ColorScheme
          shapeRef={shapeRef}
          onChange={onChange}
          shapeProps={shapeProps}
          shapeType={'RECT'}
          isSelected={isSelected}
        />
      )}
    </>
  );
};


CircleShape.propTypes = {
  shapeProps: PropTypes.object,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onChange: PropTypes.func,
  deleteImage: PropTypes.any,
  shapeZIndex: PropTypes.any,
  others: PropTypes.object,
};

// Circle
function CircleShape({ shapeProps, isSelected, onSelect, onChange, deleteImage, shapeZIndex, ...others }) {
  const circleRef = useRef();
  const trCircleRef = useRef();

  useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trCircleRef.current.nodes([circleRef.current]);
      trCircleRef.current.getLayer().batchDraw();
      if (shapeZIndex.currentShapeId === shapeProps.id) {
        circleRef.current.zIndex(shapeZIndex.index);
      }
    }
  }, [isSelected]);

  const onDeleteShape = () => {
    circleRef.current.destroy();
  };

  return (
    <>
      <Circle
        onClick={onSelect}
        onTap={onSelect}
        ref={circleRef}
        {...shapeProps}
        {...others}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = circleRef.current;
          //   console.log(node);
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
        fill="transparent"
        pointerWidth={3}
        strokeWidth={2}
        strokeEnabled
        pointerAtEnding

      />
      {isSelected && (
        <Group>
          <Transformer
            ref={trCircleRef}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
          <Image
            onClick={onDeleteShape}
            onTap={onDeleteShape}
            width={35}
            height={35}
            // x={circleRef.current?.attrs?.x - 50}
            // y={circleRef.current?.attrs?.y - 90}
            x={circleRef.current?.attrs?.x - 50 || shapeProps.x - 50}
            y={circleRef.current?.attrs?.y - 90 || shapeProps.y - 90}
            image={deleteImage}
            fill="white"
          />
        </Group>
      )}
      {isSelected && (
        <ColorScheme
          shapeRef={circleRef}
          onChange={onChange}
          shapeProps={shapeProps}
          shapeType={'CIRCLE'}
          isSelected={isSelected}
        />
      )}
    </>
  );
};



LineShape.propTypes = {
  shapeProps: PropTypes.object,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func,
  onChange: PropTypes.func,
  deleteImage: PropTypes.any,
  shapeZIndex: PropTypes.any,
  others: PropTypes.object,
};

// lINES
function LineShape({ shapeProps, isSelected, onSelect, onChange, deleteImage, shapeZIndex, ...others }) {
  const lineRef = useRef();
  const trLineRef = useRef();

  const onDeleteShape = () => {
    lineRef.current.destroy();
  };
  useEffect(() => {
    if (isSelected) {
      if (shapeZIndex.currentShapeId === shapeProps.id) {
        lineRef.current.zIndex(shapeZIndex.index);
      }
    }
  }, [isSelected]);

  return (
    <>
      <Line
        {...others}
        onClick={onSelect}
        onTap={onSelect}
        ref={lineRef}
        {...shapeProps}
        strokeWidth={2}
        draggable
        onTouchEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        points={shapeProps.points}
        tension={0.5}
        lineCap="round"
        lineJoin="round"
        globalCompositeOperation={
          // line.tool === 'eraser' ?
          // 'destination-out'
          // :
          'source-over'
        }

      />

      {isSelected && (
        <Group>
          <Image
            onClick={onDeleteShape}
            onTap={onDeleteShape}
            width={35}
            height={35}
            x={lineRef.current?.attrs?.points[0] - 5 || shapeProps.x - 5}
            y={lineRef.current?.attrs?.points[1] - 10 || shapeProps.y - 10}
            image={deleteImage}
            fill="white"
          />
        </Group>
      )}
      {isSelected && (
        <ColorScheme
          shapeRef={lineRef}
          onChange={onChange}
          shapeProps={shapeProps}
          shapeType={'LINE'}
          isSelected={isSelected}
        />
      )}
    </>
  );
};

ColorScheme.propTypes = {
  shapeProps: PropTypes.object,
  isSelected: PropTypes.bool,
  onChange: PropTypes.func,
  shapeRef: PropTypes.any,
  shapeType: PropTypes.string,
};

// COlor SchemeGroup
function ColorScheme({ onChange, shapeRef, shapeProps, shapeType, isSelected }) {
  const theme = useTheme();
  const colorSchemes = [
    theme.palette.primary.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.grey[500],
    'black',
  ];
  // components state
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // we need to attach transformer manually
    if (shapeType === 'ARROW') {
      setPosition({
        x: shapeRef.current?.attrs?.x1,
        y: shapeRef.current?.attrs?.y1 - 55,
      });
    }
    if (shapeType === 'TEXT') {
      setPosition({
        x: shapeRef.current?.attrs?.x - 5,
        y: shapeRef.current?.attrs?.y - 45,
      });
    }
    if (shapeType === 'RECT') {
      setPosition({
        x: shapeRef.current?.attrs?.x,
        y: shapeRef.current?.attrs?.y - 45,
      });
    }
    if (shapeType === 'CIRCLE') {
      setPosition({
        x: shapeRef.current?.attrs?.x - 50,
        y: shapeRef.current?.attrs?.y - 90,
      });
    }
    if (shapeType === 'LINE') {
      setPosition({
        x: shapeRef.current?.attrs?.points[0],
        y: shapeRef.current?.attrs?.points[1] - 10,
      });
    }
  }, [isSelected]);

  const handleSetColor = (color) => {
    onChange({
      ...shapeProps,
      stroke: color,
    });
  };

  const calculatePosition = (index) => {
    let pos = { x: 0, y: 0 };
    if (shapeType === 'ARROW') {
      pos = {
        x: shapeRef.current?.attrs?.x1 + (index + 1) * 35,
        y: shapeRef.current?.attrs?.y1 - 55,
      };
      return pos;
    }
    if (shapeType === 'TEXT') {
      pos = {
        x: shapeRef.current?.attrs?.x + (index + 1) * 35 - 5,
        y: shapeRef.current?.attrs?.y - 45,
      };
      return pos;
    }
    if (shapeType === 'RECT') {
      pos = {
        x: shapeRef.current?.attrs?.x + (index + 1) * 35,
        y: shapeRef.current?.attrs?.y - 45,
      };
      return pos;
    }
    if (shapeType === 'CIRCLE') {
      pos = {
        x: shapeRef.current?.attrs?.x + (index + 1) * 35 - 50,
        y: shapeRef.current?.attrs?.y - 90,
      };
      return pos;
    }
    if (shapeType === 'LINE') {
      pos = {
        x: shapeRef.current?.attrs?.points[0] + (index + 1) * 35,
        y: shapeRef.current?.attrs?.points[1] - 10,
      };
      return pos;
    }
  };

  return (
    <Group>
      {colorSchemes.map((color, index) => {
        return (
          <Rect
            fill={color}
            key={color}
            width={35}
            height={35}
            x={calculatePosition(index)?.x}
            y={calculatePosition(index)?.y}
            // x={position.x + (index + 1) * 35}
            // y={position.y}
            onClick={() => handleSetColor(color, index)}
            onTap={() => handleSetColor(color, index)}
          />
        );
      })}
    </Group>
  );
};

// Custom icon for offline mode
const CustomIcon = ({ tool, drawingTool }) => {


  CustomIcon.propTypes = {
    tool: PropTypes.object,
    drawingTool: PropTypes.any,
  };

  const { online } = useIsOnline();
  const theme = useTheme();
  if (online) {
    return (
      <Iconify
        icon={tool.icon}
        sx={{
          fontSize: 25,
          color: drawingTool === tool.key ? theme.palette.primary.main : theme.palette.grey[600],
        }}
      />
    );
  }
  if (tool.key === DRAWING_TOOLS[0]) {
    return (
      <Box
        sx={{
          width: 25,
          height: 25,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
          <path
            fill={drawingTool === tool.key ? theme.palette.primary.main : theme.palette.grey[600]}
            filRule="evenodd"
            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
          />
        </svg>
      </Box>
    );
  }
  if (tool.key === DRAWING_TOOLS[1]) {
    return (
      <Box
        sx={{
          width: 25,
          height: 25,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 2.4 24 24">
          <path
            fill={drawingTool === tool.key ? theme.palette.primary.main : theme.palette.grey[600]}
            d="M2 26.4v-4h20v4H2Zm3.5-7l5.25-14h2.5l5.25 14h-2.4l-1.25-3.6H9.2l-1.3 3.6H5.5Zm4.4-5.6h4.2L12.05 8h-.1L9.9 13.8Z"
          />
        </svg>
      </Box>
    );
  }
  if (tool.key === DRAWING_TOOLS[2]) {
    return (
      <Box
        sx={{
          width: 25,
          height: 25,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 2.4 24 24">
          <path
            fill={drawingTool === tool.key ? theme.palette.primary.main : theme.palette.grey[600]}
            d="M3 23.4v-18h18v18H3Zm2-2h14v-14H5v14Zm0 0v-14v14Z"
          />
        </svg>
      </Box>
    );
  }
  if (tool.key === DRAWING_TOOLS[3]) {
    return (
      <Box
        sx={{
          width: 25,
          height: 25,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048">
          <path
            fill={drawingTool === tool.key ? theme.palette.primary.main : theme.palette.grey[600]}
            d="M1024 0q141 0 272 36t244 104t207 160t161 207t103 245t37 272q0 141-36 272t-104 244t-160 207t-207 161t-245 103t-272 37q-141 0-272-36t-244-104t-207-160t-161-207t-103-245t-37-272q0-141 36-272t104-244t160-207t207-161T752 37t272-37zm0 1920q124 0 238-32t214-90t181-140t140-181t91-214t32-239q0-124-32-238t-90-214t-140-181t-181-140t-214-91t-239-32q-124 0-238 32t-214 90t-181 140t-140 181t-91 214t-32 239q0 124 32 238t90 214t140 181t181 140t214 91t239 32z"
          />
        </svg>
      </Box>
    );
  }
  if (tool.key === DRAWING_TOOLS[4]) {
    return (
      <Box
        sx={{
          width: 25,
          height: 25,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <g
            fill="none"
            stroke={drawingTool === tool.key ? theme.palette.primary.main : theme.palette.grey[600]}
            strokeLinejoin="round"
            strokeWidth="4"
          >
            <path d="M44 4H4v40h40V4Z" />
            <path strokeLinecap="round" d="M38 10c-6 0-11 4-14 14s-8 14-14 14" />
          </g>
        </svg>
      </Box>
    );
  }
};
