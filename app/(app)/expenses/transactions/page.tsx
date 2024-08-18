import { fetchTransactions } from "./actions";
import { columns } from "./columns";
import { DataTable } from "./data-table";

function TransactionsPage() {
  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} />
    </div>
  );
}
export default TransactionsPage;
