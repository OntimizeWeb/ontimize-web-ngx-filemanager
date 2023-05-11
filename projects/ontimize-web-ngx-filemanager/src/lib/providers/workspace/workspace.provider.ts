/**
 * Interface that defines a contract for a workspace provider.
 * Workspace provider is responsible for retrieving the workspace object.
 */
export interface WorkspaceProvider{

  /**
   * Retrieves the workspace object.
   *
   * @returns The workspace object.
   */
  getWorkspace(): any;
}
