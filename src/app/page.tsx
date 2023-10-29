import css from "./GuideVersionSelection.module.css";
import Link from "next/link";
import {
  GuideVersion,
  guideVersions,
} from "../build-data/GuideVersionIndex.ts";

function GuideVersion({ version }: { version: GuideVersion }) {
  const lastUpdate = new Date(version.generated);

  return (
    <Link href={"/" + version.slug + "/index"} className={css.version}>
      <div className={css.minecraftLogo}>
        <span>{version.gameVersion}</span>
      </div>
      <h2>
        Applied Energistics 2 {version.modVersion}
        {version.development ? " (Development)" : null}
      </h2>
      <div>Last Updated: {lastUpdate.toLocaleDateString()}</div>
    </Link>
  );
}

function GuideVersionSelection() {
  return (
    <div className={css.root}>
      <h1>Guide Versions</h1>
      {guideVersions.map((version) => (
        <GuideVersion key={version.slug} version={version} />
      ))}
    </div>
  );
}

export default GuideVersionSelection;