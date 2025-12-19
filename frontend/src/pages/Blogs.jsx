import BlogPageIsHere from "../../../articles/blog-page-is-here.md";
import MiniKataGoInProgress from "../../../articles/mini-katago-in-progress.md";
import ContentPage from "../components/global/ContentPage";

function Blogs() {
    const articles = [
        {
            id: "blog-page-is-here",
            title: "Blog Page is Here!",
            content: BlogPageIsHere,
        },
        {
            id: "mini-katago-in-progress",
            title: "Mini KataGo is Work in Progress!",
            content: MiniKataGoInProgress,
        },
    ];

    return (
        <ContentPage
            items={articles}
            basePath="/blogs"
            pageTitle="Blogs"
            welcomeTitle="Welcome to the blog page"
            welcomeMessage="Click on a blog to read it."
            sidebarTitle="Blogs"
        />
    );
}

export default Blogs;
