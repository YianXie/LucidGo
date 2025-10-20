function Sidebar({ className, children }) {
    return (
        <aside
            className={`sticky top-0 flex h-screen w-64 flex-shrink-0 flex-col gap-3 border-r border-gray-700/50 bg-gray-900/30 p-6 ${className}`}
        >
            <h2 className="text-text-1 mb-2 text-lg font-bold">Documentation</h2>
            <nav className="flex flex-col gap-3">
                {children}
            </nav>
        </aside>
    );
}

export default Sidebar;
