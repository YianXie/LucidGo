import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "../../styles/components/global/Header.module.css";

function Header({ setHeaderHeight }) {
    const headerRef = useRef(null);

    useEffect(() => {
        if (!headerRef.current) return;

        const measure = () => {
            // use offsetHeight (integer) to match what devtools shows
            const headerHeight = headerRef.current.offsetHeight;
            setHeaderHeight(headerHeight);
        };

        // initial measurement after paint
        requestAnimationFrame(measure);

        // keep in sync if header size changes (responsive, fonts, DOM updates)
        const ro = new ResizeObserver(measure);
        ro.observe(headerRef.current);

        // also update on window events as a fallback
        window.addEventListener("load", measure);
        window.addEventListener("resize", measure);

        return () => {
            ro.disconnect();
            window.removeEventListener("load", measure);
            window.removeEventListener("resize", measure);
        };
    }, [setHeaderHeight]);

    return (
        <header ref={headerRef}>
            <nav>
                <span className={styles.logo}>
                    <Link to="/">Home</Link>
                </span>
                <span>
                    <Link to="/docs">Docs</Link>
                </span>
                <span>
                    <a
                        href="https://github.com/YianXie/katago-visualizer"
                        rel="noreferrer"
                        target="_blank"
                    >
                        GitHub
                    </a>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        className="bi bi-box-arrow-up-right"
                        viewBox="0 0 16 16"
                    >
                        <path
                            fillRule="evenodd"
                            d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"
                        />
                        <path
                            fillRule="evenodd"
                            d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"
                        />
                    </svg>
                </span>
                <span>
                    <Link to="/demo">Demo</Link>
                </span>
            </nav>
        </header>
    );
}

export default Header;
