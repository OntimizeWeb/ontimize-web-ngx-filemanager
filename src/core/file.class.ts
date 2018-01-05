export class File {
  public id;
  public name;
  public size;
  public created;
  public isDir;

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
    this.created = obj && obj.created ? obj.created : null;
    this.isDir = obj && obj.isDir ? obj.isDir : null;

    // this.path = obj && obj.path ? obj.path : null;
    // this.type = obj && obj.type ? obj.type : null;
    // this.modified = obj && obj.modified ? obj.modified : null;
    // this.stats = obj && obj.stats ? obj.stats : {};
    // this.isFile = obj && obj.isFile ? obj.isFile : null;
    // this.isLink = obj && obj.isLink ? obj.isLink : null;
    // this.mime = obj && obj.mime ? obj.mime : null;
  }
}
