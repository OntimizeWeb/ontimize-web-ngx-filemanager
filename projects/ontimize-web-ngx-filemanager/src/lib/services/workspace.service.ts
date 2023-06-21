import { Injectable } from '@angular/core';
import { OFormComponent } from 'ontimize-web-ngx';
import { WorkspaceProvider } from '../interfaces/workspace.provider.interface';
import { WorkspaceOntimizeProvider } from '../providers/workspace/workspace-ontimize.provider';
import { WorkspaceS3Provider } from '../providers/workspace/workspace-s3.provider';
import { WorkspaceS3 } from '../interfaces/workspaceS3.interface';


/**
 * A service that manages the workspace provider and provides access to the workspace object.
 */
@Injectable()
export class WorkspaceService {

  /** The workspace providere. */
  private provider: WorkspaceProvider;

  // ------------------------------------------------------------------------------------------------------ \\

  /**
   * Initializes the workspace provider with an Ontimize form component.
   *
   * @param workspaceKey The key used to access the workspace object in the form data.
   * @param form The Ontimize form component from which to retrieve the workspace object.
   */
  public initializeOntimizeProvider(workspaceKey: string, form: OFormComponent): void {
    this.provider = new WorkspaceOntimizeProvider(workspaceKey, form);
  }



  /**
   * Initializes the workspace provider with a pre-defined workspace object.
   *
   * @param workspace The pre-defined workspace object.
   */
  public initializeS3Provider(workspaceKey: string, form: OFormComponent, workspaceS3?: (values: Array<{ attr, value }>) => WorkspaceS3): void {
    this.provider = new WorkspaceS3Provider(workspaceKey, form, workspaceS3);
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
