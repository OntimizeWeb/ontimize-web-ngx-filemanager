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

// export const DUMMY_DATA = [{
//   'name': 'FILE1',
//   'size': 123,
//   'created': 1514901150269,
//   'id': 3
// }, {
//   'name': 'FOLDER1',
//   'created': 1514901612345,
//   'isDir': true,
//   'id': 2
// }, {
//   'name': 'FILE2',
//   'size': 456,
//   'created': 1514801655999,
//   'id': 1
// }];

// export const DUMMY_DATA_FOLDER1 = [{
//   'name': 'FILE1',
//   'size': 1024,
//   'created': 1514901601051,
//   'id': 5
// }, {
//   'name': 'FILE2',
//   'size': 2048,
//   'created': 1514901617051,
//   'id': 6
// }];

