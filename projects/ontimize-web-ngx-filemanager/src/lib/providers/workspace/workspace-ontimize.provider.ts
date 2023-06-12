import { OFormComponent } from 'ontimize-web-ngx';
import { WorkspaceProvider } from './workspace.provider';


/**
 * A workspace provider implementation that retrieves the workspace object from an Ontimize form component.
 * Implements the WorkspaceProvider interface.
 */
export class WorkspaceOntimizeProvider implements WorkspaceProvider{

  /** The key used to access the workspace object in the form data. */
  private form: OFormComponent;

  /** The Ontimize form component from which to retrieve the workspace object. */
  private workspaceKey: string;

// ------------------------------------------------------------------------------------------------------ \\

  /**
   * Creates an instance of WorkspaceOntimizeProvider.
   *
   * @param workspaceKey The key used to access the workspace object in the form data.
   * @param form The Ontimize form component from which to retrieve the workspace object.
   */
  public constructor( workspaceKey: string, form: OFormComponent ){
    this.form = form;
    this.workspaceKey = workspaceKey;
  }


  /**
   * Retrieves the workspace object from the Ontimize form component.
   *
   * @returns The workspace object, or undefined if not found.
   */
  public getWorkspace(): any {
    return this.form.formData[this.workspaceKey] ? this.form.formData[this.workspaceKey].value : undefined
  }

// ------------------------------------------------------------------------------------------------------ \\

}
