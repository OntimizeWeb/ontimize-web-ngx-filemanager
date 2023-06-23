import { HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseServiceResponse, OntimizeServiceResponse, ServiceResponseAdapter, Util } from "ontimize-web-ngx";

@Injectable({ providedIn: 'root' })
export class OntimizeDMSServiceResponseAdapter implements ServiceResponseAdapter<BaseServiceResponse> {

  public adapt(res: HttpResponse<any>): BaseServiceResponse {
    let code = 1;
    let data = [];
    let message = '';
    console.log('adapt =>', res);
    // Adapt the data received from the service
    if (res && !Util.isDefined(res.body)) {
      return new OntimizeServiceResponse(
        res.ok && res.status === 200 ? 0 : 1,
        data,
        message
      );
    } else {

      return new OntimizeServiceResponse(
        res.body.code,
        res.body.data,
        res.body.message,
        res.body.sqlTypes,
        res.body.startRecordIndex,
        res.body.totalQueryRecordsNumber
      );
    }

    // Create Ontimize service response with the data adapted
    return new OntimizeServiceResponse(code, data, message);
  }
}
