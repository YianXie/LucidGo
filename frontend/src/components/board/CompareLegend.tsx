import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type CompareLegendItem = {
    color: string;
    name: string;
};

const CompareLegend = ({ items }: { items: CompareLegendItem[] }) => {
    return (
        <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
            gap={2}
            sx={{
                px: 2,
                py: 1,
            }}
        >
            {items.map((item, index) => (
                <Stack
                    key={`${item.name}-${index}`}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                >
                    <Box
                        sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            backgroundColor: item.color,
                            border: "1px solid rgba(0,0,0,0.2)",
                            flexShrink: 0,
                        }}
                    />
                    <Typography
                        variant="body2"
                        fontWeight={500}
                        sx={{
                            whiteSpace: "nowrap",
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                        title={item.name}
                    >
                        {item.name}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
};

export default CompareLegend;
