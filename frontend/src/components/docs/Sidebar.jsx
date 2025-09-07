function Sidebar({ className, children }) {
    return (
        <aside
            className={`flex h-full w-max flex-col gap-2.5 p-5 ${className}`}
        >
            {children}
        </aside>
    );
}

export default Sidebar;
