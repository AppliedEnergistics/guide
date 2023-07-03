import css from "./Loading.module.css";

export type LoadingProps = {
  operation?: string;
};

function Loading({ operation }: LoadingProps) {
  return (
    <div className={css.container}>
      <div className={css.indicator}></div>
      <div className={css.message}>Loading {operation ?? ""}...</div>
    </div>
  );
}

export default Loading;
