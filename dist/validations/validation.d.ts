export default class Validation {
    id: string;
    github: string;
    version: string;
    title: string;
    description: string;
    author: string;
    space: string;
    network: string;
    snapshot: number | 'latest';
    params: any;
    constructor(author: string, space: string, network: string, snapshot: number | 'latest', params: any);
    validate(): Promise<boolean>;
}
