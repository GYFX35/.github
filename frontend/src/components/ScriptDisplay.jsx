import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import './ScriptDisplay.css';

function ScriptDisplay({ scriptContent, onScriptChange }) { // Added onScriptChange for later
  if (scriptContent === null || scriptContent === undefined) { // Check for null or undefined
    return null;
  }

  // In this step, we are just displaying. Editing will be enabled in the next step.
  // For now, a readOnly prop can be used, or simply not passing an onChange handler
  // makes it effectively read-only for user input.
  // The actual `onChange` prop will be used in the next step "Manage Editable Script State".

  return (
    <div className="script-display-container">
      <h2>Generated Script & Storyboard (Editable)</h2>
      <ReactQuill
        theme="snow"
        value={scriptContent}
        onChange={onScriptChange} // Connect the handler
        className="script-content-box"
        modules={ScriptDisplay.modules} // Optional: for toolbar customization later
        formats={ScriptDisplay.formats} // Optional: for toolbar customization later
      />
    </div>
  );
}

export default ScriptDisplay;

// Default modules and formats for ReactQuill
// See https://quilljs.com/docs/modules/toolbar/ for customization
ScriptDisplay.modules = {
  toolbar: [
    [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
    [{size: []}],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'},
     {'indent': '-1'}, {'indent': '+1'}],
    ['link'], // Removed 'image', 'video'
    ['clean']
  ],
};

ScriptDisplay.formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link' // Removed 'image', 'video'
];
