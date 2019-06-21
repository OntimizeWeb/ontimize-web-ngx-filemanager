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

    // this.path = obj && obj.path ? obj.path : null;
    // this.type = obj && obj.type ? obj.type : null;
    // this.modified = obj && obj.modified ? obj.modified : null;
    // this.stats = obj && obj.stats ? obj.stats : {};
    // this.isFile = obj && obj.isFile ? obj.isFile : null;
    // this.isLink = obj && obj.isLink ? obj.isLink : null;
    // this.mime = obj && obj.mime ? obj.mime : null;
  }

}
