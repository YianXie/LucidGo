import logo from "/logo.png";
import HeaderLink from "./HeaderLink";
import { GitHubRepositoryLink } from "../../constants";
import { useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate();

    return (
        <header className="fixed left-50/100 z-100 mt-4 w-80/100 -translate-x-1/2 rounded-4xl border-1 border-gray-700 px-6 backdrop-blur-xs">
            <nav className="flex items-center justify-between">
                <div
                    className="flex cursor-pointer items-center justify-center gap-3"
                    onClick={() => {
                        navigate("/");
                    }}
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
                    <i
                        className="bi bi-github cursor-pointer text-3xl transition-all hover:opacity-80"
                        title="GitHub Repository"
                        onClick={() => {
                            window.open(GitHubRepositoryLink);
                        }}
                    ></i>
                </ul>
            </nav>
            <div className="bg-bg-2 absolute top-50/100 left-50/100 z-[-1] h-full w-full -translate-50/100 rounded-4xl opacity-80 backdrop-blur-xl"></div>
        </header>
    );
}

export default Header;
