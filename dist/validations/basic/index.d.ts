import Validation from '../validation';
export default class extends Validation {
    id: string;
    github: string;
    version: string;
    title: string;
    description: string;
    validate(): Promise<boolean>;
}
