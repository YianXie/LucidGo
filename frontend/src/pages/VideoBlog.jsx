import { useParams } from "react-router-dom";
<<<<<<< HEAD
import { videoData, transcriptData } from "../constants";
import { capitalize } from "../utils";
import Container from "../components/global/Container";
import Video from "../components/videos/Video";
import VideoSidebar from "../components/videos/VideoSidebar";
import VideoSidebarLink from "../components/videos/VideoSidebarLink";
import Transcript from "../components/videos/Transcript";
=======

import Container from "../components/global/Container";
import Flex from "../components/global/Flex";
import NavigationSidebar from "../components/global/NavigationSidebar";
import Video from "../components/videos/Video";
import { videoData } from "../constants";
import { capitalize } from "../utils";
>>>>>>> b17305a (refactor: :recycle: Formatted code)

function VideoBlog() {
    const { videoId } = useParams();

    return (
        <Container className="flex">
            <VideoSidebar>
                {Object.keys(videoData).map((key) => (
                    <VideoSidebarLink
                        key={key}
                        to={`/video-blog/${key}`}
                        isActive={videoId === key}
                    >
                        {capitalize(key)}
                    </VideoSidebarLink>
                ))}
            </VideoSidebar>

            <div className="prose prose-invert max-w-none flex-1 overflow-y-auto scroll-smooth p-8">
                {videoId && videoData[videoId] ? (
                    <div className="flex flex-col items-center gap-6">
                        <h1 className="text-text-1 text-2xl font-semibold">
                            {capitalize(videoId)}
                        </h1>
                        <Video link={videoData[videoId]} />
                        
                        <div className="mt-8 w-full flex flex-col items-center gap-4">
                            <h2 className="text-text-1 text-xl font-semibold">
                                Transcript
                            </h2>
                            <Transcript transcript={transcriptData[videoId]} />
                        </div>
                    </div>
                ) : (
                    <div className="mt-10 flex h-full items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-text-1 text-3xl font-semibold">
                                Welcome to the Video Blog!
                            </h1>
                            <p className="text-text-1/70 mt-4 text-lg">
                                Select a video from the sidebar to watch.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Container>
    );
}

export default VideoBlog;
