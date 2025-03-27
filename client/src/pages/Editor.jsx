import React, { useState, useEffect, useRef } from "react";
import { Button, TextField, MenuItem, Typography } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";
import { saveLetterToDrive, fetchSavedLetters, initializeGapi } from "../utils/googleDrive";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { io } from "socket.io-client";

const LetterEditor = () => {
  const [content, setContent] = useState("");
  const [draftName, setDraftName] = useState("");
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [driveFiles, setDriveFiles] = useState([]);
  const editorRef = useRef(null);

  useEffect(() => {
    const drafts = JSON.parse(localStorage.getItem("savedDrafts")) || [];
    setSavedDrafts(drafts);

    initializeGapi().then(() => {
      fetchSavedLetters()
        .then(setDriveFiles)
        .catch((err) => console.error("Error fetching letters from Drive:", err));
    });
  }, []);
  

  const handleSaveDraftName = () => {
    if (!draftName.trim()) {
      alert("Please enter a draft name.");
      return;
    }
    alert(`Draft name set to: ${draftName}`);
  };

  const handleSaveDraft = () => {
    if (!content.trim()) {
      alert("Cannot save an empty draft.");
      return;
    }

    if (!draftName.trim()) {
      alert("Please enter a draft name before saving.");
      return;
    }

    const newDraft = { name: draftName, content };
    const updatedDrafts = [...savedDrafts, newDraft];
    setSavedDrafts(updatedDrafts);
    localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts));
    alert("Draft saved locally!");
  };

  const handleLoadDraft = (draft) => {
    setDraftName(draft.name);
    setContent(draft.content);
  };

  const handleUploadToDrive = async () => {
    if (!content.trim()) {
      alert("Write something before uploading.");
      return;
    }
  
    try {
      await saveLetterToDrive(draftName || "New Letter", content);
  
      // ✅ Check if the draft already exists
      const existingDraftIndex = savedDrafts.findIndex((draft) => draft.name === draftName);
  
      let updatedDrafts;
      if (existingDraftIndex !== -1) {
        // ✅ Update existing draft
        updatedDrafts = [...savedDrafts];
        updatedDrafts[existingDraftIndex].content = content;
      } else {
        // ✅ Add new draft
        const newDraft = { name: draftName || `Draft ${savedDrafts.length + 1}`, content };
        updatedDrafts = [...savedDrafts, newDraft];
      }
  
      // ✅ Update state & localStorage
      setSavedDrafts(updatedDrafts);
      localStorage.setItem("savedDrafts", JSON.stringify(updatedDrafts));
  
      // ✅ Fetch updated files from Google Drive
      const files = await fetchSavedLetters();
      setDriveFiles(files);
  
      alert("Draft saved locally & uploaded to Google Drive!");
    } catch (error) {
      console.error("❌ Error uploading letter to Google Drive:", error);
      alert("Failed to upload. Please try again.");
    }
  };
  
    const handleExportAsPDF = () => {
    if (!content.trim()) {
      alert("Write something before exporting.");
      return;
    }

    const doc = new jsPDF();
    const tempElement = document.createElement("div");
    tempElement.innerHTML = content;
    document.body.appendChild(tempElement);

    html2canvas(tempElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      doc.save(`${draftName || "Letter"}.pdf`);
      document.body.removeChild(tempElement);
    });
  };

  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Header Section */}
      <div
        style={{
          padding: "10px",
          backgroundColor: "#1976D2",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5">Letter Editor</Typography>

        {/* Draft Name Input */}
        <TextField
          label="Draft Name"
          variant="outlined"
          size="small"
          sx={{ backgroundColor: "white", minWidth: "200px", marginRight: "10px" }}
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
        />

        {/* Save Draft Name Button */}
        <Button variant="contained" color="primary" onClick={handleSaveDraftName} sx={{ marginRight: 2 }}>
          Save Draft Name
        </Button>

        {/* Load Draft Dropdown */}
        <TextField
          select
          label="Load Draft"
          variant="outlined"
          size="small"
          sx={{ backgroundColor: "white", minWidth: "250px", marginRight: "10px" }} // ✅ Increased width
          onChange={(e) => {
            const selectedDraft = JSON.parse(e.target.value);
            handleLoadDraft(selectedDraft);
          }}
        >
          {savedDrafts.map((draft, index) => (
            <MenuItem key={index} value={JSON.stringify(draft)}>
              {draft.name}
            </MenuItem>
          ))}
        </TextField>

        {/* Buttons */}
        <div>
          <Button variant="contained" color="success" onClick={handleSaveDraft} sx={{ marginRight: 2 }}>
            Save Draft
          </Button>
          <Button variant="contained" color="secondary" onClick={handleUploadToDrive} sx={{ marginRight: 2 }}>
            Upload to Google Drive
          </Button>
          <Button variant="contained" color="warning" onClick={handleExportAsPDF}>
            Export as PDF
          </Button>
        </div>
      </div>

      {/* Full-Screen TinyMCE Editor */}
      <div style={{ flexGrow: 1, overflow: "hidden", display: "flex" }}>
        <Editor
          apiKey="xt4mcv60z6ofctgqqvszjsas1uau941q2fvsllinoju2u81c"
          initialValue="<p>Start writing your letter here...</p>"
          init={{
            height: "100%",
            width: "100%",
            menubar: true,
            plugins: [
              "advlist autolink lists link image charmap print preview anchor",
              "searchreplace visualblocks code fullscreen",
              "insertdatetime media table paste code help wordcount",
            ],
            toolbar:
              "fullscreen | undo redo | formatselect | bold italic backcolor | " +
              "alignleft aligncenter alignright alignjustify | " +
              "bullist numlist outdent indent | removeformat | help",
          }}
          value={content}
          onEditorChange={(newValue) => setContent(newValue)}
        />
      </div>
    </div>
  );
};

export default LetterEditor;



