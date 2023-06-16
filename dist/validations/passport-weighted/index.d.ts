import Validation from '../validation';
export default class extends Validation {
    id: string;
    github: string;
    version: string;
    title: string;
    description: string;
    validate(currentAddress?: string): Promise<boolean>;
}
