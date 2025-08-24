import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../../styles/components/global/Header.module.css";

function Header({ setHeaderHeight }) {
    const navigate = useNavigate();
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
                </span>
                <span
                    className={styles.demo}
                    onClick={() => {
                        navigate("/demo");
                    }}
                >
                    Demo
                </span>
            </nav>
        </header>
    );
}

export default Header;
