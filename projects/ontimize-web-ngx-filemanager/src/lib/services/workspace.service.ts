import { Injectable, Injector } from '@angular/core';
import { OFormComponent } from 'ontimize-web-ngx';
import { WorkspaceProvider } from '../providers/workspace/workspace.provider';
import { WorkspaceOntimizeProvider } from '../providers/workspace/workspace-ontimize.provider';
import { WorkspaceS3Provider } from '../providers/workspace/workspace-s3.provider';


/**
 * A service that manages the workspace provider and provides access to the workspace object.
 */
@Injectable()
export class WorkspaceService{

  /** The workspace providere. */
  private provider: WorkspaceProvider;

// ------------------------------------------------------------------------------------------------------ \\

  /**
   * Creates an instance of WorkspaceService.
   */
  public constructor() {}



  /**
   * Initializes the workspace provider with an Ontimize form component.
   *
   * @param workspaceKey The key used to access the workspace object in the form data.
   * @param form The Ontimize form component from which to retrieve the workspace object.
   */
  public initializeOntimizeProvider( workspaceKey: string, form: OFormComponent ): void{
    this.provider = new WorkspaceOntimizeProvider( workspaceKey, form );
  }



  /**
   * Initializes the workspace provider with a pre-defined workspace object.
   *
   * @param workspace The pre-defined workspace object.
   */
  public initializeS3Provider( workspace: any ): void{
    this.provider = new WorkspaceS3Provider( workspace );
  }



  /**
   * Retrieves the workspace object from the workspace provider.
   *
   * @returns The workspace object.
   */
  public getWorkspace(): any {
    return this.provider.getWorkspace();
  }

// ------------------------------------------------------------------------------------------------------ \\

}
