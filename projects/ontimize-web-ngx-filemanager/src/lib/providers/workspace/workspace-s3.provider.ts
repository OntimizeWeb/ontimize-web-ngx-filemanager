import { WorkspaceProvider } from './workspace.provider';


export class WorkspaceS3Provider implements WorkspaceProvider{

  private workspace: any;

  public constructor( workspace: any ){
    this.workspace = workspace;
  }

  public getWorkspace(): any {
    return this.workspace;
  }

}
