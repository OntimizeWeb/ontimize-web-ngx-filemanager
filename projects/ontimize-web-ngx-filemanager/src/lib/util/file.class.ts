export class FileClass {

  public id: any;
  public name: string;
  public size: number;
  public creationDate: number;
  public directory: boolean;
  public directoryPath: string;
  public path: string;


  constructor(obj?: any) {
    this.id = obj && obj.id ? obj.id : null;
    this.name = obj && obj.name ? obj.name : null;
    this.size = obj && obj.size ? obj.size : null;
    this.creationDate = obj && obj.creationDate ? obj.creationDate : null;
    this.directory = obj && obj.directory ? obj.directory : null;
    this.directoryPath = obj && obj.directoryPath ? obj.directoryPath : null;
    this.path = obj && obj.path ? obj.path : null;
  }

}
