import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

const fieldRowSx = { display: "flex", alignItems: "center", gap: 2 } as const;

/**
 * A labeled text/number input field row used in config forms.
 */
export function ConfigTextField({
    label,
    value,
    type = "text",
    onChange,
    inputProps,
    tooltip,
}: {
    label: string;
    value: string | number;
    type?: string;
    onChange: (value: string) => void;
    inputProps?: Record<string, unknown>;
    tooltip?: string;
}) {
    const labelElement = tooltip ? (
        <Tooltip title={tooltip} placement="top" arrow>
            <Typography
                variant="body1"
                sx={{
                    textDecoration: "underline",
                    textDecorationStyle: "dotted",
                }}
            >
                {label}
            </Typography>
        </Tooltip>
    ) : (
        <Typography variant="body1">{label}</Typography>
    );

    return (
        <Box sx={fieldRowSx}>
            {labelElement}
            <TextField
                variant="standard"
                type={type}
                value={value}
                inputProps={inputProps}
                onChange={(e) => onChange(e.target.value)}
            />
        </Box>
    );
}

/**
 * A labeled checkbox field row used in config forms.
 */
export function ConfigCheckbox({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    return (
        <Box sx={{ ...fieldRowSx, gap: 1 }}>
            <Checkbox
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                sx={{ width: 16, p: 0 }}
            />
            <Typography variant="body1">{label}</Typography>
        </Box>
    );
}

/**
 * A labeled slider field row used in config forms.
 */
export function ConfigSlider({
    label,
    value,
    onChange,
    min,
    max,
    step,
    ariaLabel,
    tooltip,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    ariaLabel: string;
    tooltip?: string;
}) {
    const labelElement = tooltip ? (
        <Tooltip title={tooltip} placement="top" arrow>
            <Typography
                variant="body1"
                sx={{
                    textDecoration: "underline",
                    textDecorationStyle: "dotted",
                }}
            >
                {label}
            </Typography>
        </Tooltip>
    ) : (
        <Typography variant="body1">{label}</Typography>
    );

    return (
        <Box sx={fieldRowSx}>
            {labelElement}
            <Stack
                direction="row"
                spacing={2}
                sx={{ width: "500px", alignItems: "center" }}
            >
                <Typography variant="body1">{min}</Typography>
                <Slider
                    value={value}
                    onChange={(_, v) => onChange(v as number)}
                    min={min}
                    max={max}
                    step={step}
                    valueLabelDisplay="auto"
                    aria-label={ariaLabel}
                />
                <Typography variant="body1">{max}</Typography>
            </Stack>
        </Box>
    );
}

/**
 * A labeled select/dropdown field row used in config forms.
 */
export function ConfigSelect({
    label,
    value,
    onChange,
    options,
    id,
    labelId,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    id?: string;
    labelId?: string;
}) {
    return (
        <Box sx={fieldRowSx}>
            <Typography variant="body1">{label}</Typography>
            <Select
                variant="standard"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                id={id}
                labelId={labelId}
            >
                {options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
}

/**
 * A titled section wrapper for grouping related config fields.
 */
export function ConfigSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Box>
            <Typography variant="h4" component="h2" fontWeight={500}>
                {title}
            </Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    mt: 1,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
