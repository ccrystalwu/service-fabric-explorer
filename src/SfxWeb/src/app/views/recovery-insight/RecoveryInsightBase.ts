import { DataService } from 'src/app/services/data.service';
import { Injector, Directive } from '@angular/core';
import { IResponseMessageHandler } from 'src/app/Common/ResponseMessageHandlers';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRouteSnapshot } from '@angular/router';
import { BaseControllerDirective } from 'src/app/ViewModels/BaseController';

@Directive()
export class RecoveryInsightBaseControllerDirective extends BaseControllerDirective {
    public clusterInsight: string;

    constructor(protected data: DataService, injector: Injector) {
        super(injector);
    }

    common(messageHandler?: IResponseMessageHandler): Observable<any> {
        return this.data.getClusterRecoveryInsight(messageHandler).pipe(map(clusterInsight => {
            this.clusterInsight = JSON.stringify(clusterInsight);
            return true; // Return success, no error handling for now
        }));
    }

    getParams(route: ActivatedRouteSnapshot): void {
        // No params for now
    }
}
