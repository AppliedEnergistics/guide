import css from "./GuideShell.module.css";
import { Link, Outlet } from "react-router-dom";
import logo from "./assets/logo_00.png";
import GuideNavBar from "./GuideNavBar.tsx";
import { useGuide } from "./data/Guide.ts";

function GuideShell() {
  const guide = useGuide();

  return (
    <main className={css.main}>
      <Link to="/" className={css.logo}>
        <img src={logo} alt="" />
        Applied Energistics 2
      </Link>
      <div>{/* TODO Show title */}</div>
      <aside>
        <GuideNavBar />
      </aside>
      <article>
        <Outlet />
      </article>
      <div className={css.versionPicker}>
        Minecraft {guide.version.gameVersion} [<a href="#/">change</a>]
      </div>
    </main>
  );
}

export default GuideShell;
