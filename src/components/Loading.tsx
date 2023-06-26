export type LoadingProps = {
  operation?: string;
};

function Loading({ operation }: LoadingProps) {
  return <div>Loading {operation ?? ""}...</div>;
}

export default Loading;
