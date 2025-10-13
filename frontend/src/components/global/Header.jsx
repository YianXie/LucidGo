import logo from "/logo.png";
import HeaderLink from "./HeaderLink";
import ClickableIcon from "./ClickableIcon";
import { GitHubRepositoryLink } from "../../constants";
import useNavigation from "../../hooks/useNavigation";

function Header() {
    const { navigateTo, openExternal } = useNavigation();

    return (
        <header className="fixed left-50/100 z-100 mt-4 w-80/100 -translate-x-1/2 rounded-4xl border-1 border-gray-700 px-6 backdrop-blur-xs">
            <nav className="flex items-center justify-between">
                <div
                    className="flex cursor-pointer items-center justify-center gap-3"
                    onClick={navigateTo("/")}
                >
                    <img
                        src={logo}
                        alt="Logo"
                        className="h-10 w-10 cursor-pointer"
                    />
                    <p className="text-text-1 text-lg font-[500]">LucidGo</p>
                </div>
                <ul className="text-text-1 flex items-center gap-7.5">
                    <HeaderLink to={"/docs"}>Docs</HeaderLink>
                    <HeaderLink to={"/video-blog"}>Video Blog</HeaderLink>
                    <HeaderLink to={"/demo"}>Demo</HeaderLink>
                    <ClickableIcon
                        iconClass="bi bi-github"
                        onClick={openExternal(GitHubRepositoryLink)}
                        title="GitHub Repository"
                        className="text-3xl"
                    />
                </ul>
            </nav>
            <div className="bg-bg-2 absolute top-50/100 left-50/100 z-[-1] h-full w-full -translate-50/100 rounded-4xl opacity-80 backdrop-blur-xl"></div>
        </header>
    );
}

export default Header;
