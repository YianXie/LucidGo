function Sidebar({ className, children }) {
    return (
        <aside
            className={`flex h-full w-64 flex-shrink-0 flex-col gap-3 border-r border-gray-700/50 bg-gray-900/30 p-6 ${className}`}
        >
            <h2 className="text-text-1 mb-2 text-lg font-bold">Documentation</h2>
            {children}
        </aside>
    );
}

export default Sidebar;
