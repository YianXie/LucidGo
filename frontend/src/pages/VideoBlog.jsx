import { useParams, Link as Link } from "react-router-dom";
import { videoData } from "../constants";
import Container from "../components/global/Container";
import Video from "../components/videos/Video";
import Flex from "../components/global/Flex";
import { useEffect, useState } from "react";

function VideoBlog() {
    const { videoId } = useParams();
    const [transcript, setTranscript] = useState(null);

    // useEffect(() => {
    //     if (videoId) {
    //         try {
    //             const rawTranscript = readFile(
    //                 `../assets/transcripts/${videoId}.srt`,
    //                 "utf-8"
    //             );
    //             console.log(rawTranscript);
    //             setTranscript(transcript);
    //         } catch (error) {
    //             console.error("Error reading transcript:", error);
    //         }
    //     }
    // }, [videoId]);

    return (
        <Container>
            <Flex className={"h-full w-full gap-10"}>
                <Flex
                    className={
                        "text-text-1 border-text-1 w-1/4 flex-col gap-2 overflow-auto border-r-1 border-dotted"
                    }
                >
                    <h1 className="text-text-1 border-text-1 mb-3 border-b-1 border-dotted pr-10 pb-3 pl-5 text-2xl font-[500]">
                        Video Blog
                    </h1>
                    {Object.keys(videoData).map((key) => (
                        <Link
                            key={key}
                            to={`/video-blog/${key}`}
                            className={`text-text-1 hover:bg-text-1/10 mx-3 rounded-lg py-1.5 pr-3 pl-5 transition-colors duration-300 ${videoId === key ? "bg-text-1/10" : ""}`}
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Link>
                    ))}
                </Flex>

                <Flex
                    className={
                        "w-full flex-col items-center gap-2 overflow-auto p-3"
                    }
                >
                    {videoId && videoData[videoId] ? (
                        <>
                            <h1 className="text-text-1 mb-3 text-xl font-[500]">
                                {videoId.charAt(0).toUpperCase() +
                                    videoId.slice(1)}
                            </h1>
                            <Video link={videoData[videoId]} />
                            <h1 className="text-text-1 mt-5 mb-3 text-xl font-[500]">
                                Transcript
                            </h1>
                        </>
                    ) : (
                        <div className="mt-5 w-full text-center">
                            <h1 className="text-text-1 text-2xl font-[500]">
                                Welcome to the video blog page!
                            </h1>
                            <p className="text-text-1 mt-2">
                                Click on a video to watch it.
                            </p>
                        </div>
                    )}
                </Flex>
            </Flex>
        </Container>
    );
}

export default VideoBlog;
