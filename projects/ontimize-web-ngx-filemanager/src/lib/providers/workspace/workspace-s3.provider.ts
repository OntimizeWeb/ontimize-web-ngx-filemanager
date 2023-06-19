import { WorkspaceProvider } from '../../interfaces/workspace.provider.interface';
import { WorkspaceS3 } from '../../interfaces/workspaceS3.interface';


/**
 * A workspace provider implementation that uses a pre-defined workspace object.
 * Implements the WorkspaceProvider interface.
 */
export class WorkspaceS3Provider implements WorkspaceProvider{

  /** The pre-defined workspace object. */
  private workspace: any;

// ------------------------------------------------------------------------------------------------------ \\

  /**
   * Creates an instance of WorkspaceS3Provider.
   *
   * @param workspace The pre-defined workspace object.
   *
   * @example workspace = { name: 'default', data: {}}
   */
  public constructor( workspace: WorkspaceS3 ){
    this.workspace = workspace;
  }


  /**
   * Retrieves the pre-defined workspace object.
   *
   * @returns The workspace object.
   */
  public getWorkspace(): WorkspaceS3 {
    return this.workspace;
  }

// ------------------------------------------------------------------------------------------------------ \\

}
