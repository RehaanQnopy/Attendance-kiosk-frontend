import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';


@Injectable({
    providedIn:'root'
})
export class AttendancePageService 
{


    constructor(private http: HttpClient) {};

    mongoGetAttendanceData() {
        return this.http.get('').pipe((catchError (error => {
            console.log('There was an error in making the GET call to the mongoDB server');
            return throwError(()=>
                new Error('Error in making the GET call')
            )
        })))
    }

}