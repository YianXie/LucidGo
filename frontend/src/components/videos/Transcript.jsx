function Transcript({ transcript }) {
    if (!transcript) {
        return (
            <div className="text-text-1/70 w-full max-w-2xl text-center">
                <p>No transcript available for this video.</p>
            </div>
        );
    }

    return (
        <div className="text-text-1 w-full max-w-2xl rounded-lg bg-gray-900/30 p-6">
            <div className="space-y-4">
                {transcript.map((entry, index) => (
                    <div
                        key={index}
                        className="border-l-2 border-blue-500/30 pl-4"
                    >
                        <div className="text-text-1/50 mb-1 text-sm">
                            {entry.timestamp}
                        </div>
                        <p className="leading-relaxed">{entry.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Transcript;
