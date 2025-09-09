function LoadingIndicator({ show, value }) {
    return (
        <div
            className={`fixed z-[10] flex h-full w-full items-center justify-center ${show ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"} backdrop-blur-md backdrop-brightness-50 transition-all select-none`}
        >
            <div className="absolute rounded-2xl bg-white p-6 shadow-md">
                {value ? (
                    <div className="relative size-40">
                        <svg
                            className="size-full -rotate-90"
                            viewBox="0 0 36 36"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                className="stroke-current text-gray-200 dark:text-neutral-700"
                                strokeWidth="2"
                            ></circle>
                            <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                className="stroke-current text-blue-600 dark:text-blue-500"
                                strokeWidth="2"
                                strokeDasharray="100"
                                strokeDashoffset={100 - value}
                                strokeLinecap="round"
                            ></circle>
                        </svg>

                        <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                            <span className="text-center text-2xl font-bold text-blue-600 dark:text-blue-500">
                                {value.toFixed(1)}%
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center">
                        <i className="bi bi-arrow-clockwise animate-spin text-7xl"></i>
                        <p className="mt-5 text-2xl font-bold">Loading...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LoadingIndicator;
