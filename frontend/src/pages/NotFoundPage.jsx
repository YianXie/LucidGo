import { Link } from "react-router-dom";

function NotFoundPage() {
    return (
        <>
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Link to="/">Go back to the home page</Link>
        </>
    );
}

export default NotFoundPage;
