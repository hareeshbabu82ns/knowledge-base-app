import HeaderToolbar from "./_components/header-toolbar";

export default async function Layout({
  list,
  details,
}: Readonly<{
  list: React.ReactNode;
  details: React.ReactNode;
}>) {
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex flex-row justify-between">
        <h1 className="header"></h1>
        <HeaderToolbar />
      </div>
      <div className="mt-5 flex flex-row gap-4">
        <div className="flex-2">{list}</div>
        <div className="flex-1">{details}</div>
      </div>
    </div>
  );
}
