export default async function Layout({
  list,
  details,
}: Readonly<{
  list: React.ReactNode;
  details: React.ReactNode;
}>) {
  return (
    <div className="mt-5 flex flex-row gap-4">
      <div className="@5xl/main-content:basis-1/3 basis-1/2">{list}</div>
      <div className="@container/details flex-1">{details}</div>
    </div>
  );
}
