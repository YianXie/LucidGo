import { DRAWER_WIDTH } from "@/constants";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { forwardRef } from "react";

type ComparisonReadyIndicatorProps = {
    game1Name: string;
    game2Name: string;
};

const ComparisonReadyIndicator = forwardRef<
    Element,
    ComparisonReadyIndicatorProps
>((props, ref) => {
    return (
        <Box
            ref={ref}
            sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                width: "inherit",
                display: "flex",
                backgroundColor: (theme) => theme.palette.primary.light,
                justifyContent: "space-between",
                alignItems: "center",
                padding: 2,
                boxShadow: 2,
                zIndex: (theme) => theme.zIndex.tooltip + 1,
            }}
        >
            <Typography fontWeight={500} fontSize={18}>
                Compare {props.game1Name} and {props.game2Name}
            </Typography>
            <Button color="secondary" variant="contained">
                Compare
            </Button>
        </Box>
    );
});

export default ComparisonReadyIndicator;
