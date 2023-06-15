import { HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseServiceResponse, OntimizeServiceResponse, ServiceResponseAdapter } from "ontimize-web-ngx";
import { FileClass } from "../util";

@Injectable({ providedIn: 'root' })
export class S3ServiceResponseAdapter implements ServiceResponseAdapter<BaseServiceResponse> {

  public adapt(resp: HttpResponse<any>): BaseServiceResponse {
    let code = 1;
    let data = [];
    let message = '';

    // Adapt the data received from the service
    if (resp.body) {
      code = resp.body[ 'code' ];
      message = resp.body[ 'message' ];
      data = resp.body[ 'data' ];
      if ( data) {
        const newData: FileClass[] = [];

        if( data != null && data.length > 0 ){
          data.forEach( target => {
            const file: any = {
              id: target.key,
              name: target.name,
              size: target.size,
              directory: target.folder,
              directoryPath: target.relativePrefix,
              path: target.relativeKey
            }
            newData.push( new FileClass( file ) );
          });
        }

        data = newData;
      }
    }

    // Create Ontimize service response with the data adapted
    return new OntimizeServiceResponse(code, data, message);
  }
}
