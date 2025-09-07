function FlexRow({
    justify = "center",
    align = "center",
    className,
    children,
}) {
    return (
        <div className={`flex justify-${justify} items-${align} ${className}`}>
            {children}
        </div>
    );
}

export default FlexRow;
