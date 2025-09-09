function CheckList({ options, maxChecked, className }) {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {options.map((option, index) => (
                <label
                    key={option.label}
                    className="hover:bg-bg-4 check-list relative flex cursor-pointer items-center gap-3 rounded-xl p-2 select-none"
                >
                    <input
                        type="checkbox"
                        checked={option.value}
                        onChange={() => {
                            if (maxChecked) {
                                for (let i = 0; i < options.length; i++) {
                                    if (i !== index) {
                                        options[i].setValue(false);
                                    }
                                }
                            }
                            options[index].setValue(!option.value);
                        }}
                        className="size-4"
                    />
                    <p className="text-sm font-[500]">{option.label}</p>
                </label>
            ))}
        </div>
    );
}

export default CheckList;
