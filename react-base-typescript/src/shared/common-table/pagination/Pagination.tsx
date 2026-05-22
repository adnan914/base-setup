import { usePagination, DOTS } from "./usePagination";

type Paginat = {
  onPageChange: Function;
  currentPage: number;
  totalCount: number;
  siblingCount?: number;
  pageSize: number;
};
const Pagination = (props: Paginat) => {
  const {
    onPageChange,
    totalCount,
    siblingCount = 1,
    currentPage,
    pageSize,
  } = props;

  const paginationRange: any = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };

  let lastPage = paginationRange[paginationRange.length - 1];
  return (
    <div className="paginations">
      <ul>
        <li>
          <button
            className="button inline-block"
            disabled={currentPage === 1}
            onClick={onPrevious}
          >
            Prev
          </button>
        </li>
        {paginationRange.map((pageNumber: any, index: number) => {
          if (pageNumber === DOTS) {
            return (
              <li key={index} className="pagination-item dots">
                <button className="button inline-block">&#8230;</button>
              </li>
            );
          }
          return (
            <li
              key={index}
              className={pageNumber === currentPage ? "pagi_actived" : ""}
            >
              <button
                className="button inline-block"
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}
        <li>
          <button
            disabled={currentPage === lastPage}
            className="button inline-block"
            onClick={onNext}
          >
            Next
          </button>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
