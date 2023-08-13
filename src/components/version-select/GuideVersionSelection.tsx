import {
  GuideVersion,
  GuideVersionIndex,
} from "../../data/GuideVersionIndex.ts";
import css from "./GuideVersionSelection.module.css";

type GuideVersionSelectionProps = {
  versionIndex: GuideVersionIndex;
};

function getBaseUrl(version: GuideVersion): string {
  if (version.development) {
    return "#/development/";
  } else {
    return "#/" + version.gameVersion + "/";
  }
}

function GuideVersion({ version }: { version: GuideVersion }) {
  const lastUpdate = new Date(version.generated);

  return (
    <a href={getBaseUrl(version)} className={css.version}>
      <div className={css.minecraftLogo}>
        <span>{version.gameVersion}</span>
      </div>
      <h2>
        Applied Energistics 2 {version.modVersion}
        {version.development ? " (Development)" : null}
      </h2>
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
