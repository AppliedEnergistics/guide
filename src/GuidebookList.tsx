import {Link, useLoaderData} from "react-router-dom";

type GuideVersion = {
    minecraftVersion: string;
    modVersion: string;
    lastUpdate: number;

}

type GuidesIndex = {
    versions: GuideVersion[];
}

function GuideVersion({version}: { version: GuideVersion }) {
    const lastUpdate = new Date(version.lastUpdate);

    return <div>
        <Link to={version.minecraftVersion + "/"}>Minecraft {version.minecraftVersion},
            Mod {version.modVersion}</Link> ({lastUpdate.toLocaleDateString()})
    </div>
}

function GuidebookList() {
    const guides = useLoaderData() as GuidesIndex;
    return (
        <div>
            Select a version of the guidebook to view:
            <ul>
                {guides.versions.map((version, idx) => (<GuideVersion key={idx} version={version}/>))}
            </ul>
        </div>
    );
}

export default GuidebookList;