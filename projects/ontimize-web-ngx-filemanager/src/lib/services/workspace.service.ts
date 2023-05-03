import { Injectable, Injector } from '@angular/core';
import { OFormComponent } from 'ontimize-web-ngx';
import { WorkspaceProvider } from '../providers/workspace/workspace.provider';
import { WorkspaceOntimizeProvider } from '../providers/workspace/workspace-ontimize.provider';
import { WorkspaceS3Provider } from '../providers/workspace/workspace-s3.provider';

@Injectable()
export class WorkspaceService{
  private provider: WorkspaceProvider;

  public constructor() {}

  public initializeOntimizeProvider( workspaceKey: string, form: OFormComponent ): void{
    this.provider = new WorkspaceOntimizeProvider( workspaceKey, form );
  }

  public initializeS3Provider( workspace: any ): void{
    this.provider = new WorkspaceS3Provider( workspace );
  }

  public getWorkspace(): any {
    return this.provider.getWorkspace();
  }

}
