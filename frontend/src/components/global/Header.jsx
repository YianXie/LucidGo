import { Link } from "react-router-dom";
import styles from "../../styles/Header.module.css";

function Header() {
    return (
        <header>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/docs">Docs</Link>
                <a
                    href="https://github.com/YianXie/katago-visualizer"
                    target="_blank"
                >
                    GitHub
                </a>
            </nav>
        </header>
    );
}

export default Header;
