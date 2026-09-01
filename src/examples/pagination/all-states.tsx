import { useState } from "react";

import { Pagination } from "../../components/pagination";

const buildPageUrl = (page: number) => `?page=${page}`;

export default function PaginationStatesExample() {
  const [firstPage, setFirstPage] = useState(1);
  const [middlePage, setMiddlePage] = useState(5);
  const [lastPage, setLastPage] = useState(10);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-medium">First Page (Link Mode)</h3>
        <Pagination page={1} totalPages={10} buildPageUrl={buildPageUrl} />
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium">Middle Page (Link Mode)</h3>
        <Pagination page={5} totalPages={10} buildPageUrl={buildPageUrl} />
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium">Last Page (Link Mode)</h3>
        <Pagination page={10} totalPages={10} buildPageUrl={buildPageUrl} />
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium">Few Pages (3)</h3>
        <Pagination page={2} totalPages={3} buildPageUrl={buildPageUrl} />
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium">Many Pages with Ellipsis</h3>
        <Pagination page={50} totalPages={100} buildPageUrl={buildPageUrl} />
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium">Single Page (Hidden)</h3>
        <p className="text-fg-muted text-sm">Pagination is hidden when totalPages = 1</p>
        <Pagination page={1} totalPages={1} buildPageUrl={buildPageUrl} />
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium">Button Mode — First Page</h3>
        <Pagination mode="button" page={firstPage} totalPages={10} onPageChange={setFirstPage} />
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium">Button Mode — Middle Page</h3>
        <Pagination mode="button" page={middlePage} totalPages={10} onPageChange={setMiddlePage} />
      </div>

      <div>
        <h3 className="mb-4 text-sm font-medium">Button Mode — Last Page</h3>
        <Pagination mode="button" page={lastPage} totalPages={10} onPageChange={setLastPage} />
      </div>
    </div>
  );
}
