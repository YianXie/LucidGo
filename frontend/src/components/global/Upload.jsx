import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useState } from "react";

function Upload({ setFile, accept, ...props }) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            setFile(files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    return (
        <Paper
            component="label"
            htmlFor="dropzone-file"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 5,
                minHeight: 256,
                cursor: "pointer",
                border: 2,
                borderStyle: "dashed",
                borderColor: isDragging ? "primary.main" : "divider",
                backgroundColor: "background.paper",
                opacity: isDragging ? 0.8 : 1,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                    borderColor: "primary.main",
                    opacity: 0.8,
                },
            }}
        >
            <CloudUploadIcon
                sx={{
                    fontSize: 48,
                    mb: 2,
                    color: "text.secondary",
                }}
            />
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 600 }}>
                Click to upload or drag and drop
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {accept} file
            </Typography>
            <input
                id="dropzone-file"
                type="file"
                accept={accept}
                style={{ display: "none" }}
                onChange={handleFileChange}
                {...props}
            />
        </Paper>
    );
}

export default Upload;
