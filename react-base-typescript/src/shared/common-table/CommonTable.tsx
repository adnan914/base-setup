import React, {
  useState,
  useEffect,
  ReactElement,
} from "react";
import Pagination from "./pagination/Pagination";
import { CommonTableType } from "./types";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const CommonTable = ({
  totalCount,
  customPagination,
  setCustomPagination,
  data,
  keys,
  isPagination,
  rowsPerPageOptions,
  handleLimit,
}: CommonTableType) => {
  const [isLoaded, setLoaded] = useState<boolean>(false);
  useEffect(() => {
    if (!isLoaded && !totalCount) setLoaded(true);
  }, [isLoaded, totalCount]);

  return (
    <>
      <div className="table_scroll">
        <SkeletonTheme
          baseColor="#00c852"
          highlightColor="#94ecb8"
          borderRadius="0.5rem"
          duration={4}
        >
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                {keys.map((key, index) => (
                  <th key={index}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(
                (column: (string | ReactElement | number)[], index: number) => {
                  return (
                    <tr key={index}>
                      {column?.map((key, i) => (
                        <td key={i}>
                          {key}
                        </td>
                      ))}
                    </tr>
                  );
                }
              )}
              {isLoaded && !totalCount ? (
                <tr className="text-center">
                  <td colSpan={Object.keys(keys).length}>No record available</td>
                </tr>
              ) : null}

              {/* {!isLoaded ? (
                <tr className="text-center">
                  {keys.map((_, index) =>
                    <td key={index}>
                      <Skeleton />
                    </td>
                  )}
                </tr>
              ) : null} */}
            </tbody>
          </table>
        </SkeletonTheme>
      </div>
      <div className={`pagin_group`}>
        <div className="show_reslts">
          {rowsPerPageOptions ? (
            <select
              className="select_icn40 input_40"
              value={customPagination.limit}
              onChange={handleLimit ? (e) => handleLimit(e) : () => {}}
            >
              {rowsPerPageOptions.map((e: number) => (
                <option value={e} key={e}>
                  Show {e} results
                </option>
              ))}
            </select>
          ) : null}
        </div>
        {isPagination ? (
          <Pagination
            currentPage={customPagination.page}
            totalCount={totalCount}
            pageSize={customPagination.limit}
            onPageChange={setCustomPagination}
          />
        ) : null}
      </div>
    </>
  );
};

export default CommonTable;
