import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { forwardRef } from "react";

type ComparisonReadyIndicatorProps = {
    game1Name: string;
    game2Name: string;
    onCompare: () => void;
};

const ComparisonReadyIndicator = forwardRef<
    Element,
    ComparisonReadyIndicatorProps
>(({ game1Name, game2Name, onCompare }, ref) => {
    return (
        <Box
            ref={ref}
            sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "100%",
                display: "flex",
                backgroundColor: "#3F74CD",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 2,
                boxShadow: 2,
                zIndex: (theme) => theme.zIndex.tooltip + 1,
            }}
        >
            <Typography
                fontWeight={500}
                fontSize={18}
                sx={{
                    color: "white",
                }}
            >
                Compare {game1Name} and {game2Name}
            </Typography>
            <Button
                variant="contained"
                onClick={onCompare}
                sx={{
                    backgroundColor: "#9131AB",
                    color: "white",
                }}
            >
                Compare
            </Button>
        </Box>
    );
});

export default ComparisonReadyIndicator;
