import styles from "../../styles/components/global/Footer.module.css";

function Footer({ show }) {
    return (
        <footer className={show ? styles.show : ""}>
            <p>&copy; 2025 KataGo Visualization</p>
        </footer>
    );
}

export default Footer;
