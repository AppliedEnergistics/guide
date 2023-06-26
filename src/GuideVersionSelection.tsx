import { GuideVersion, GuideVersionIndex } from "./GuideVersionIndex.ts";

type GuideVersionSelectionProps = {
  versionIndex: GuideVersionIndex;
};

function GuideVersion({ version }: { version: GuideVersion }) {
  const lastUpdate = new Date(version.generated);

  return (
    <div>
      <a href={"#/" + version.gameVersion + "/"}>
        Minecraft {version.gameVersion}, Mod {version.modVersion}
      </a>{" "}
      ({lastUpdate.toLocaleDateString()})
    </div>
  );
}

function GuideVersionSelection({ versionIndex }: GuideVersionSelectionProps) {
  return (
    <div>
      Select a version of the guidebook to view:
      <ul>
        {versionIndex.versions.map((version, idx) => (
          <GuideVersion key={idx} version={version} />
        ))}
      </ul>
    </div>
  );
}

export default GuideVersionSelection;
