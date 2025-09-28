import Flex from "./Flex";

function RangeSelector({ min, max, step, value, setValue }) {
    return (
        <Flex className="items-center justify-center gap-2">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => {
                    setValue(e.target.value);
                }}
                className="cursor-grab active:cursor-grabbing"
            />
            <p className="text-text-1 font-mono text-sm">{value}</p>
        </Flex>
    );
}

export default RangeSelector;
