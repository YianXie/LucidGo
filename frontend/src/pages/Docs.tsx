import getStarted from "../../../docs/get-started.md";
import githubAction from "../../../docs/github-action.md";
import howToUse from "../../../docs/how-to-use.md";
import installation from "../../../docs/installation.md";
import ContentPage from "../components/common/ContentPage";
import type { DocItem } from "../components/common/ContentPage";

const docs: DocItem[] = [
    {
        id: "get-started",
        title: "Get Started",
        content: getStarted,
    },
    {
        id: "github-action",
        title: "GitHub Action",
        content: githubAction,
    },
    {
        id: "how-to-use",
        title: "How to Use",
        content: howToUse,
    },
    {
        id: "installation",
        title: "Installation",
        content: installation,
    },
];

function Docs() {
    return (
        <ContentPage
            items={docs}
            basePath="/docs"
            pageTitle="Docs"
            welcomeTitle="Welcome to the documentation page"
            welcomeMessage="Click on a documentation to read it."
        />
    );
}

export default Docs;
