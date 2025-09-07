import { paddingTop } from "../../constants";

function Container({ className, children }) {
    return (
        <div
            className={`bg-bg-1 z-1 h-full w-full ${className}`}
            style={{ paddingTop: `${paddingTop}px` }}
        >
            {children}
        </div>
    );
}

export default Container;
