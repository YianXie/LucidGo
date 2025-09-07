function Upload({ setFile, accept }) {
    return (
        <div className="relative h-max w-max place-content-center">
            <label
                htmlFor="dropzone-file"
                className="bg-bg-4 hover:bg-bg-3 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-500 p-5 transition-colors"
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                        className="text-text-1 mb-4 h-8 w-8"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                    </svg>
                    <p className="text-text-1 mb-2 text-sm">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                    </p>
                    <p className="text-text-1 text-xs">{accept} file</p>
                </div>
                <input
                    id="dropzone-file"
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => {
                        setFile(e.target.files[0]);
                    }}
                />
            </label>
        </div>
    );
}

export default Upload;
