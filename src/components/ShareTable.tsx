import React, { FC } from "react";
import { ColumnsType, TablePaginationConfig } from "antd/lib/table";
import { Table } from "antd";

type TableProps = {
  columns: ColumnsType<any>;
  dataSource: any;
};

export const ShareTable: FC<TableProps> = (props) => {
  //   const [columns, setColumns] = useState<ColumnsType<any>>();
  //   const [data, setData] = useState();
  const pagination: TablePaginationConfig = {
    pageSize: 7,
  };

  return <Table columns={props.columns} dataSource={props.dataSource} rowKey={(record) => record._id} pagination={pagination} />;
};
