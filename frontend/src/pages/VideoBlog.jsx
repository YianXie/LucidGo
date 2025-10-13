import { useParams } from "react-router-dom";
import { videoData } from "../constants";
import { capitalize } from "../utils";
import Container from "../components/global/Container";
import Video from "../components/videos/Video";
import Flex from "../components/global/Flex";
import NavigationSidebar from "../components/global/NavigationSidebar";

function VideoBlog() {
    const { videoId } = useParams();

    const navigationItems = Object.keys(videoData).map((key) => ({
        key,
        label: capitalize(key),
        to: `/video-blog/${key}`,
    }));

    return (
        <Container>
            <Flex className={"h-full w-full gap-10"}>
                <NavigationSidebar
                    title="Video Blog"
                    items={navigationItems}
                    activeKey={videoId}
                />

                <Flex
                    className={
                        "w-full flex-col items-center gap-2 overflow-auto p-3"
                    }
                >
                    {videoId && videoData[videoId] ? (
                        <>
                            <h1 className="text-text-1 mb-3 text-xl font-[500]">
                                {capitalize(videoId)}
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
