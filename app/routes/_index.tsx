import { json } from "@remix-run/node";
import { Form, Link, useLoaderData, useSubmit } from "@remix-run/react";
import { BiLinkExternal, BiDownArrowAlt, BiUpArrowAlt } from "react-icons/bi";

interface IArticle {
  imageUrl: string;
  id: number;
  summary: string;
  newsSite: string;
  publishedAt: string;
  url: string;
  title: string;
}

interface ILoaderData {
  data: IArticle[];
  page: number;
  q: string;
  length: number;
  sortOrder: string;
  sort: string;
}

interface IPaginationProps {
  page: number;
  length: number;
  sort: string;
  sortOrder: string;
  q: string;
}

const Pagination = ({ page, length, sort, sortOrder, q }: IPaginationProps) => {
  const submit = useSubmit();
  const currentPage = page;
  const totalPages = Math.ceil(length / 6);
  const pagesToShow = 5;
  const pageItems = [];

  if (totalPages <= pagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pageItems.push(i);
    }
  } else {
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      pageItems.push(1, "...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pageItems.push(i);
    }

    if (endPage < totalPages) {
      pageItems.push("...", totalPages);
    }
  }

  return (
    <div className="flex justify-center my-4" role="pagination">
      {pageItems.map((p, index) => (
        <button
          key={index}
          className={`px-2 py-1 mx-1 rounded ${
            p === currentPage ? "bg-gray-800 text-white" : "bg-gray-300"
          }`}
          type="button"
          id={`page-${p}`}
          aria-label={`Page ${p}`}
          name={`page`}
          value={p}
          onClick={() => submit({ page: p, sort, sortOrder, q })}
        >
          {p}
        </button>
      ))}
    </div>
  );
};

export const loader = async ({
  request,
}: {
  request: Request;
}): Promise<ReturnType<typeof json>> => {
  try {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") || 1);
    const q = url.searchParams.get("q") || "";
    const sort = url.searchParams.get("sort") || "";
    const sortOrder = url.searchParams.get("sortOrder") || "";
    const sortOrderAddition = sortOrder ? `:${sortOrder}` : "";
    const limit = 6;
    const startIndex = (page - 1) * limit;

    const articleResponse = fetch(
      `https://api.spaceflightnewsapi.net/v3/articles?_start=${startIndex}&_limit=${limit}&title_contains=${q}&_sort=${sort}${sortOrderAddition}`
    );
    const lengthResponse = fetch(
      `https://api.spaceflightnewsapi.net/v3/articles/count?title_contains=${q}`
    );
    const [response, length] = await Promise.all([
      articleResponse,
      lengthResponse,
    ]);
    const [jsonResponse, jsonLength] = await Promise.all([
      response.json(),
      length.json(),
    ]);
    return json({
      data: jsonResponse,
      length: jsonLength,
      page,
      q,
      sortOrder,
      sort,
    });
  } catch (error) {
    throw json({ error });
  }
};

export default function Index() {
  const { data, length, page, q, sortOrder, sort } =
    useLoaderData<ILoaderData>();

  const submit = useSubmit();

  const handleSortByTitle = () => {
    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    submit({ sort: "title", sortOrder: newSortOrder, page, q });
  };

  const handleSortByDate = () => {
    const newSortOrder = sortOrder === "desc" ? "asc" : "desc";
    submit({ sort: "publishedAt", sortOrder: newSortOrder, page, q });
  };

  return (
    <Form>
      <div className="bg-gray-900 text-white p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">
          <Link to="/">My interview app 📚</Link>
        </h1>
        <div className="mb-4 flex flex-row">
          <div id="search" role="search" className="flex-grow">
            <input
              id="q"
              aria-label="Search articles"
              placeholder="Search"
              type="search"
              name="q"
              className="w-full bg-gray-800 text-white rounded p-2"
              defaultValue={q}
            />
          </div>

          <button
            type="button"
            onClick={handleSortByTitle}
            className="ml-2"
            name="sort"
          >
            Sort by title{" "}
            {sortOrder === "asc" ? <BiUpArrowAlt /> : <BiDownArrowAlt />}
          </button>
          <button type="button" onClick={handleSortByDate} className="ml-2">
            Sort by date{" "}
            {sortOrder === "asc" ? <BiUpArrowAlt /> : <BiDownArrowAlt />}
          </button>
        </div>
      </div>
      <div id="details" className="p-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {data.map((article, index) => (
              <Article key={index} article={article} />
            ))}
          </div>
        </div>
      </div>
      <Pagination
        page={page}
        q={q}
        length={length}
        sort={sort}
        sortOrder={sortOrder}
      />
    </Form>
  );
}

const Article: React.FC<{ article: IArticle }> = ({ article }) => {
  const publishedAt = new Date(article.publishedAt);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col">
      <a
        href={article.url}
        target="_blank"
        rel="norel noreferrer"
        className="relative"
      >
        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-64 object-cover rounded-lg mb-4 transition-transform duration-300 hover:scale-105"
        />
        <BiLinkExternal
          className="absolute top-2 right-2 text-gray-200"
          size={20}
        />
      </a>
      <h2 className="text-xl font-bold mb-2">{article.title}</h2>
      <p className="text-gray-600 mb-4 flex-grow">{article.summary}</p>
      <p className="text-gray-500">
        {article.newsSite} |
        {` ${publishedAt.getDate()}-${
          publishedAt.getMonth() + 1
        }-${publishedAt.getFullYear()}`}
      </p>
    </div>
  );
};
