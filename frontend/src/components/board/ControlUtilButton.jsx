function ControlUtilButton({ className, onClick, label }) {
    return (
        <div
            className="cursor-pointer hover:opacity-80 active:translate-y-1"
            onClick={onClick}
            aria-label={label}
        >
            <i className={`${className} text-text-1 text-3xl`}></i>
        </div>
    );
}

export default ControlUtilButton;
