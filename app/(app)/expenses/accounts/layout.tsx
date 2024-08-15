export default async function Layout({
  list,
  details,
}: Readonly<{
  list: React.ReactNode;
  details: React.ReactNode;
}>) {
  return (
    <div className="mt-10 flex flex-row gap-4">
      <div className="flex-2">{list}</div>
      <div className="flex-1">{details}</div>
    </div>
  );
}
