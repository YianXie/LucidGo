function ButtonPill({ className, onClick, children }) {
    return (
        <button
            type="button"
            className={`cursor-pointer rounded-full text-center font-[500] transition-all duration-300 ${className}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export default ButtonPill;
