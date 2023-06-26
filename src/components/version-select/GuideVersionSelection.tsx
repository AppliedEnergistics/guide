import {
  GuideVersion,
  GuideVersionIndex,
} from "../../data/GuideVersionIndex.ts";
import css from "./GuideVersionSelection.module.css";

type GuideVersionSelectionProps = {
  versionIndex: GuideVersionIndex;
};

function GuideVersion({ version }: { version: GuideVersion }) {
  const lastUpdate = new Date(version.generated);

  return (
    <a href={"#/" + version.gameVersion + "/"} className={css.version}>
      <div className={css.minecraftLogo}>
        <span>{version.gameVersion}</span>
      </div>
      <h2>Applied Energistics 2 {version.modVersion}</h2>
      <div>Last Updated: {lastUpdate.toLocaleDateString()}</div>
    </a>
  );
}

function GuideVersionSelection({ versionIndex }: GuideVersionSelectionProps) {
  return (
    <div className={css.root}>
      <h1>Guide Versions</h1>
      {versionIndex.versions.map((version, idx) => (
        <GuideVersion key={idx} version={version} />
      ))}
    </div>
  );
}

export default GuideVersionSelection;
