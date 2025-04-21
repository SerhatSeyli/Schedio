declare module 'react-csv' {
  import { ComponentType, ReactNode } from 'react';

  export interface CSVLinkProps {
    data: any[];
    headers?: any[];
    filename?: string;
    separator?: string;
    target?: string;
    className?: string;
    style?: React.CSSProperties;
    children?: ReactNode;
    onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  }

  export const CSVLink: ComponentType<CSVLinkProps>;
  
  export interface CSVDownloadProps {
    data: any[];
    headers?: any[];
    filename?: string;
    separator?: string;
    target?: string;
  }
  
  export const CSVDownload: ComponentType<CSVDownloadProps>;
}
