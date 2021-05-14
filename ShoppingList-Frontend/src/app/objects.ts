export interface SignupInfo {
    userName: string;
    password: string;
}

export interface ListItem {
    category: string;
    name: string;
    status: boolean;
    store: string;
    quantity: number;
    assignee:string;
}

export interface ShoppingList {
    id: string;
    admin: string;
    items: ListItem[];
    name:string;
    members: string[];
}

export interface ShoppingLists{
    lists:ShoppingList[];
}