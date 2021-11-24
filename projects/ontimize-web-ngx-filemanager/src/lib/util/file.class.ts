export class FileClass {

  public id: number;
  public name: string;
  public size: number;
  public creationDate: number;
  public directory: boolean;

  // public path;
  // public type;
  // public modified;
  // public stats;
  // public isFile;
  // public isLink;
  // public mime;

  constructor(obj?: any) {
    this.id = obj && obj.id ? obj.id : null;
    this.name = obj && obj.name ? obj.name : null;
    this.size = obj && obj.size ? obj.size : null;
    this.creationDate = obj && obj.creationDate ? obj.creationDate : null;
    this.directory = obj && obj.directory ? obj.directory : null;
  }

}
