import { OFormComponent, Util } from 'ontimize-web-ngx';

import { WorkspaceProvider } from '../../interfaces/workspace.provider.interface';
import { WorkspaceS3 } from '../../interfaces/workspaceS3.interface';


/**
 * A workspace provider implementation that uses a pre-defined workspace object.
 * Implements the WorkspaceProvider interface.
 */
export class WorkspaceS3Provider implements WorkspaceProvider {

  /** The pre-defined workspace object. */
  private workspaceS3: any;

  /** The key used to access the workspace object in the form data. */
  private form: OFormComponent;

  /** The Ontimize form component from which to retrieve the workspace object. */
  private workspaceKey: string;


  // ------------------------------------------------------------------------------------------------------ \\

  /**
   * Creates an instance of WorkspaceS3Provider.
   *
   * @param workspace The pre-defined workspace object.
   *
   * @example workspace = { name: 'default', data: {}}
   */
  public constructor(workspaceKey: string, form: OFormComponent, workspaceS3?: (values: Array<{ attr, value }>) => WorkspaceS3) {
    this.workspaceKey = workspaceKey;
    this.form = form;
    this.workspaceS3 = workspaceS3;
  }


  /**
   * Retrieves the pre-defined workspace object.
   *
   * @returns The workspace object.
   */
  public getWorkspace(): WorkspaceS3 {
    let workspace: WorkspaceS3 = { name: 'default', data: {} };
    if (Util.isDefined(this.workspaceKey)) {
      const workspaceKey = this.form.formData[this.workspaceKey] ? this.form.formData[this.workspaceKey].value : undefined;
      workspace.data = { id: [workspaceKey] };
    } else if (Util.isDefined(this.workspaceS3)) {
      workspace = this.workspaceS3 ? this.workspaceS3(this.form.getDataValue) : undefined;
    } else {
      console.warn('[File manager]: The workspace-key or workspace-S3 should be configured for correct use')
    }
    return workspace;
  }

  // ------------------------------------------------------------------------------------------------------ \\

}
