export type User = {
    id: number;
    name: string;
    email?: string;
};

export type Status = {
    id: number;
    name: string;
};

export type KanbanBoardTask = {
    id: number;
    title: string;
    description?: string;
    userId: number | null ;
    statusId: number;
    createdAt: string;
    assigneeName?:string;
    statusName?:string;
}