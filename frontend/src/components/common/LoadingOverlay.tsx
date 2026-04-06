import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

function LoadingOverlay({ open }: { open: boolean }) {
    if (!open) return null;

    return (
        <Backdrop
            open={true}
            sx={{
                color: "#fff",
                zIndex: (theme) => theme.zIndex.appBar - 1,
            }}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    );
}

export default LoadingOverlay;
