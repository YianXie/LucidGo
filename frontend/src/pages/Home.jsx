import DarkVeil from "../components/global/assets/DarkVeil";
import BlurText from "../components/global/assets/BlurText";
import ButtonPill from "../components/global/assets/ButtonPill";
import AnimatedContent from "../components/global/assets/AnimatedContent";
import Flex from "../components/global/Flex";
import ClickableImage from "../components/global/ClickableImage";
import HoverOverlay from "../components/global/HoverOverlay";
import demoPicture from "../assets/images/home/demo.png";
import { GitHubRepositoryLink, paddingTop } from "../constants";
import useNavigation from "../hooks/useNavigation";
import useHover from "../hooks/useHover";

function Home() {
    const { navigateTo, openExternal } = useNavigation();
    const [demoImageHovered, demoImageHoverProps] = useHover();
    const titleClassName = "text-text-1 mt-25 text-5xl/tight font-[600]";

    return (
        <div className="relative h-full w-full">
            <DarkVeil speed={1} />
            <div
                className="relative flex flex-col items-center justify-center"
                style={{ paddingTop: `${paddingTop}px` }}
            >
                <BlurText
                    text="Analyze your moves with LucidGo"
                    delay={100}
                    animateBy="words"
                    direction="top"
                    className={titleClassName}
                />
                <AnimatedContent
                    distance={100}
                    direction="vertical"
                    reverse={false}
                    duration={1.2}
                    ease="power3.out"
                    animateOpacity
                    threshold={0.1}
                >
                    <Flex
                        className={"mt-10 items-center justify-center gap-10"}
                    >
                        <ButtonPill
                            className={
                                "bg-text-1 hover:bg-text-1/80 active:bg-text-1/60 px-10 py-3"
                            }
                            onClick={navigateTo("/demo")}
                        >
                            Demo
                        </ButtonPill>
                        <ButtonPill
                            className={
                                "bg-text-1/10 hover:bg-text-1/20 text-text-1 active:bg-text-1/40 border-1 border-gray-600 px-10 py-3"
                            }
                            onClick={openExternal(GitHubRepositoryLink)}
                        >
                            GitHub
                        </ButtonPill>
                    </Flex>
                    <ClickableImage
                        src={demoPicture}
                        alt="demo picture"
                        onClick={openExternal("/demo")}
                        isHovered={demoImageHovered}
                        hoverProps={demoImageHoverProps}
                        className="my-15 h-200 w-200"
                    >
                        <HoverOverlay isVisible={demoImageHovered}>
                            <i
                                className={`bi bi-box-arrow-up-right text-text-1 text-3xl`}
                            ></i>
                            <p className="text-text-1 text-3xl font-[500]">
                                Try it out
                            </p>
                        </HoverOverlay>
                    </ClickableImage>
                </AnimatedContent>
            </div>
        </div>
    );
}

export default Home;
