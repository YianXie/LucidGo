import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Dialog from "@mui/material/Dialog";
import Slide from "@mui/material/Slide";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { forwardRef, useState } from "react";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function Settings({ open, setOpen, maxVisits, setMaxVisits, id }) {
    const [tempMaxVisits, setTempMaxVisits] = useState(maxVisits);

    const handleApply = () => {
        setMaxVisits((prev) =>
            prev.map((value, index) => {
                if (index === id) {
                    return tempMaxVisits;
                }
                return value;
            })
        );
        setOpen(false);
    };

    return (
        <Dialog
            maxWidth="md"
            open={open}
            onClose={() => setOpen(false)}
            slots={{ transition: Transition }}
        >
            <Card
                sx={{
                    width: { xs: "100%", sm: 400 },
                    maxWidth: "100%",
                }}
            >
                <CardContent>
                    <Stack spacing={3} alignItems="center">
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "column",
                                gap: 2,
                                alignItems: "center",
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                Settings for Board {id + 1}
                            </Typography>
                            <Box sx={{ width: "100%", px: 2 }}>
                                <Typography variant="body2" gutterBottom>
                                    Max Visits: {tempMaxVisits}
                                </Typography>
                                <Slider
                                    value={tempMaxVisits}
                                    onChange={(e, newValue) =>
                                        setTempMaxVisits(newValue)
                                    }
                                    min={100}
                                    max={1000}
                                    step={10}
                                    marks={[
                                        {
                                            value: 100,
                                            label: "100",
                                        },
                                        {
                                            value: 1000,
                                            label: "1000",
                                        },
                                    ]}
                                    aria-label="Max Visits"
                                />
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleApply}
                                sx={{ mt: 1 }}
                            >
                                Apply
                            </Button>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>
        </Dialog>
    );
}

export default Settings;
