import { columns } from "./columns";
import { DataTable } from "./data-table";

function TransactionsPage() {
  return (
    <div className="py-10">
      <DataTable columns={columns} />
    </div>
  );
}
export default TransactionsPage;
