import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DarkVeil from "../components/global/assets/DarkVeil";
import BlurText from "../components/global/assets/BlurText";
import ButtonPill from "../components/global/assets/ButtonPill";
import AnimatedContent from "../components/global/assets/AnimatedContent";
import FlexRow from "../components/global/FlexRow";
import demoPicture from "../assets/images/home/demo.png";
import { GitHubRepositoryLink, paddingTop } from "../constants";

function Home() {
    const navigate = useNavigate();
    const [demoImageHovered, setDemoImageHovered] = useState(false);
    const titleClassName = "text-text-1 mt-25 text-5xl/tight font-[600]";

    return (
        <div className="relative h-full w-full">
            <DarkVeil speed={1} />
            <div
                className="relative flex flex-col items-center justify-center"
                style={{ paddingTop: `${paddingTop}px` }}
            >
                <BlurText
                    text="Explore how KataGo makes its move"
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
                    <FlexRow className={"mt-10 gap-10"}>
                        <ButtonPill
                            className={
                                "bg-text-1 hover:bg-text-1/80 active:bg-text-1/60 px-10 py-3"
                            }
                            onClick={() => {
                                navigate("/demo");
                            }}
                        >
                            Demo
                        </ButtonPill>

                        <ButtonPill
                            className={
                                "bg-text-1/10 hover:bg-text-1/20 text-text-1 active:bg-text-1/40 border-1 border-gray-600 px-10 py-3"
                            }
                            onClick={() => {
                                window.open(GitHubRepositoryLink);
                            }}
                        >
                            GitHub
                        </ButtonPill>
                    </FlexRow>
                    <div
                        className="relative h-max w-max cursor-pointer"
                        onClick={() => {
                            window.open("/demo");
                        }}
                        onMouseEnter={() => {
                            setDemoImageHovered(true);
                        }}
                        onMouseLeave={() => {
                            setDemoImageHovered(false);
                        }}
                    >
                        <img
                            src={demoPicture}
                            alt="demo picture"
                            draggable={false}
                            className={`my-15 h-200 w-200 transition-all duration-300 ${demoImageHovered ? "blur-xs brightness-50" : ""}`}
                        />
                        <div
                            className={`absolute top-50/100 left-50/100 flex -translate-50/100 flex-col items-center justify-center gap-3 transition-all duration-300 ${demoImageHovered ? "opacity-100" : "opacity-0"}`}
                        >
                            <i
                                className={`bi bi-box-arrow-up-right text-text-1 text-3xl`}
                            ></i>
                            <p className="text-text-1 text-3xl">Try it out</p>
                        </div>
                    </div>
                </AnimatedContent>
            </div>
        </div>
    );
}

export default Home;
