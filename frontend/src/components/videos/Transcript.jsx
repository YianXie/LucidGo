import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

function Transcript({ transcript }) {
    if (!transcript) {
        return (
            <Box
                sx={{
                    width: "100%",
                    maxWidth: 800,
                    textAlign: "center",
                    color: "text.secondary",
                }}
            >
                <Typography>No transcript available for this video.</Typography>
            </Box>
        );
    }

    return (
        <Paper
            elevation={0}
            sx={{
                width: "100%",
                maxWidth: 800,
                p: 3,
                backgroundColor: "background.paper",
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {transcript.map((entry, index) => (
                    <Box
                        key={index}
                        sx={{
                            borderLeft: 2,
                            borderColor: "primary.light",
                            pl: 2,
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 0.5 }}
                        >
                            {entry.timestamp}
                        </Typography>
                        <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                            {entry.text}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
}

export default Transcript;
