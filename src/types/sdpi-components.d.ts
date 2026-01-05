export type DataSourceResult = DataSourceResultItem[];
export type DataSourceResultItem = Item | ItemGroup;

type Item = {
    disabled?: boolean;
    label?: string;
    value: string;
};

type ItemGroup = {
    label?: string;
    children: Item[];
};

type DataSourcePayload = {
    event: string;
    items: DataSourceResult;
};