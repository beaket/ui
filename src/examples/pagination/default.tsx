import { useState } from "react";

import { Pagination } from "../../components/pagination";

const buildPageUrl = (page: number) => `?page=${page}`;

const args = {
  page: 1,
  totalPages: 10,
  buildPageUrl,
};

export default function Example() {
  return <Pagination {...args} />;
}
