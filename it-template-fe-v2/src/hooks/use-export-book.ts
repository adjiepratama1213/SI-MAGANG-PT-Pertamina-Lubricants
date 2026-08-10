import { useCallback } from 'react';
import { utils, writeFile } from 'xlsx';

type TInput = {
  dataArr: any[];
  sheetName: string;
  fileName: string;
  fileType: 'xlsx' | 'csv';
};

export default function useExportBook({ dataArr, fileType, sheetName, fileName }: TInput) {
  /* get state data and export to XLSX */
  const exportFile = useCallback(() => {
    /* generate worksheet from state */
    const ws = utils.json_to_sheet(dataArr);
    /* create workbook and append worksheet */
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, `${sheetName}`);
    /* export to XLSX */
    writeFile(wb, `${fileName}.${fileType}`);
  }, [dataArr, fileName, fileType, sheetName]);

  return { exportFile };
}
