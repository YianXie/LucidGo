import Container from "../components/global/Container";
import Sidebar from "../components/docs/Sidebar";
import SidebarLink from "../components/docs/SidebarLink";
import GetStarted from "../../docs/get-started.mdx";

function Docs() {
    return (
        <Container>
            <Sidebar>
                <SidebarLink to={"get-started"}>Get started</SidebarLink>
                <SidebarLink to={"installation"}>Installation</SidebarLink>
                <SidebarLink to={"how-to-use"}>How to use</SidebarLink>
            </Sidebar>
            <GetStarted />
        </Container>
    );
}

export default Docs;
