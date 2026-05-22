import { ReactElement } from "react"

type CustomPagination = {
    page: number;
    limit: number;
}

export type CommonTableType = {
    totalCount: number
    customPagination: CustomPagination
    setCustomPagination: Function
    data: (string | ReactElement | number)[][] 
    keys: (string | ReactElement | number)[]
    isPagination: boolean
    rowsPerPageOptions?: number[] | undefined
    handleLimit?: Function | undefined
}