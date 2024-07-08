import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
// @mui
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';
//
import EditorToolbar, { formats, redoChange, undoChange } from './EditorToolbar';

// ----------------------------------------------------------------------

const RootStyle = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  border: `solid 1px ${theme.palette.grey[500_32]}`,
  '& .ql-container.ql-snow': {
    borderColor: 'transparent',
    ...theme.typography.body1,
    fontFamily: theme.typography.fontFamily,
  },
  '& .ql-editor': {
    minHeight: 200,
    maxHeight: 640,
    '&.ql-blank::before': {
      fontStyle: 'normal',
      color: theme.palette.text.disabled,
    },
    '& pre.ql-syntax': {
      ...theme.typography.body2,
      padding: theme.spacing(2),
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.grey[900],
    },
  },
}));

// ----------------------------------------------------------------------

Editor.propTypes = {
  // id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  helperText: PropTypes.node,
  simple: PropTypes.bool,
  sx: PropTypes.object,
};

export default function Editor({
  // id = 'my-itemeditor',
  error,
  value,
  onChange,
  simple = false,
  helperText,
  sx,
  ...other
}) {

  const toolbarOptions = [
    [{ 'font': [] }],
    [{ 'align': [] }],
    [{ 'color': [] },
      //  { 'background': [] }
    ],
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['link', 'image'],
    // ['blockquote', 'code-block'],
    // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    // [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    // [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    // [{ 'direction': 'rtl' }],                         // text direction
    // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    // dropdown with defaults from theme
    // ['clean']                                         // remove formatting button
  ];

  const modules = {
    // toolbar: {
    //   // container: `#${id}`,
    //   // container: "#my-itemeditor",
    //   handlers: {
    //     undo: undoChange,
    //     redo: redoChange,
    //   },
    // },
    toolbar: toolbarOptions,
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true,
    },
    syntax: true,
    clipboard: {
      matchVisual: false,
    },
  };

  return (
    <div>
      <RootStyle
        sx={{
          ...(error && {
            border: (theme) => `solid 1px ${theme.palette.error.main}`,
          }),
          ...sx,
        }}
      >
        {/* <EditorToolbar
          // id={id}
          // id="my-itemeditor"
          isSimple={simple} /> */}
        <ReactQuill
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder="Write something awesome..."
          theme='snow'
          {...other}
        />
      </RootStyle>

      {helperText && helperText}
    </div>
  );
}
