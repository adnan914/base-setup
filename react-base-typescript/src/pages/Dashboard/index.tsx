import { useState } from "react";
import CommonTable from "shared/common-table/CommonTable";
import { limit, pagePerOptions } from "utils/constant";

const Dashboard = () => {
    const defaulPagination = {
        limit: limit,
        page: 1,
    };
    const [pagination, setPagination] = useState(defaulPagination);

    const Keys = [
    "Name",
    "Status",
    "Analysis Date",
    "Last Update",
    "Date Created",
    "Address",
    ];

    const ItemData = [
        ["Mannan", "Yes", "11", "12","15", "indore"],
        ["Mannan", "Yes", "11", "12","15", "indore"],
        ["Mannan", "Yes", "11", "12","15", "indore"],
        ["Mannan", "Yes", "11", "12","15", "indore"],
        ["Mannan", "Yes", "11", "12","15", "indore"],
    ];

    const setPage = (page: number) => {
        setPagination({ ...pagination, page });
    };

    const handleLimit = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPagination({ ...pagination, limit: +event.target.value });
    };

  return (
    <div className="main-content">
        <form>
            <div className="form-row align-items-center mb-4">
                <div className="col-auto">
                    <div className="input-group">
                        <input type="text" className="form-control" id="inlineFormInputGroup" placeholder="Name" />
                    </div>
                </div>
                <div className="col-auto">
                    <button type="submit" className="btn btn-primary">Search</button>
                </div>
            </div>
        </form>
        <div className="table-box">
            <CommonTable
                data={ItemData}
                keys={Keys}
                totalCount={30}
                customPagination={pagination}
                setCustomPagination={setPage}
                isPagination={true}
                rowsPerPageOptions={pagePerOptions}
                handleLimit={handleLimit}
            />
        </div>
    </div>
    );
}
export default Dashboard