import { OFormComponent } from 'ontimize-web-ngx';
import { WorkspaceProvider } from './workspace.provider';


export class WorkspaceOntimizeProvider implements WorkspaceProvider{

  private form: OFormComponent;
  private workspaceKey: string;

  public constructor( workspaceKey: string, form: OFormComponent ){
    this.form = form;
    this.workspaceKey = workspaceKey;
  }

  public getWorkspace(): any {
    return this.form.formData[this.workspaceKey] ? this.form.formData[this.workspaceKey].value : undefined
  }

}
