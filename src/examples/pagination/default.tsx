import { useState } from "react";

import { Pagination } from "../../components/pagination";

export default function Example() {
  const [page, setPage] = useState(1);

  return (
    <div className="flex h-full items-center justify-center">
      <Pagination
        mode="button"
        page={page}
        totalPages={20}
        maxPageButtons={7}
        onPageChange={setPage}
      />
    </div>
  );
}
