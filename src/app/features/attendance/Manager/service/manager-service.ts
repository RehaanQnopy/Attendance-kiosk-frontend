import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { UsersAttendanceView } from "../model/UsersAttendanceView";


@Injectable({
    providedIn:'root'
})
export class ManagerService {

    private baseUrl: string = `${environment.baseUrl}/manager`;

    //Had a type error here, be cautious when using withCredentials and use it everytiem fro the service file
    public opts = { withCredentials: true }; 

    constructor(private http: HttpClient) {};
    public getAllUsersAttendance() : Observable<UsersAttendanceView[]> 
    {
        console.log(`maanger-service: Making the call to the Backend`);
        return this.http.get<UsersAttendanceView[]>(`${this.baseUrl}/home`, this.opts).pipe(catchError(err => {
            console.log(`manager-service: Error in making the get call for the UsersAttendanceData`);
            throw new Error(err);
        }))
    }

}
