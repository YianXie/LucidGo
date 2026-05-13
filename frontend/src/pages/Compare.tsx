import Box from "@mui/material/Box";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const Compare = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const game1 = searchParams.get("game1");
    const game2 = searchParams.get("game2");

    useEffect(() => {
        if (!game1 || !game2) {
            toast.error(
                "No games for comparison found. Navigate to home page."
            );
            navigate("/");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [game1, game2]);

    return <Box>Compare</Box>;
};

export default Compare;
