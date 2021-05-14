import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//import { AuthService } from '../auth/auth.service';
import {SignupInfo} from '../objects'
import { AuthorizationService } from '../services/authorization.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

userName: string;
password: string;
loginResult:boolean;
alertText: string;
pageContainsAlert: boolean = false;

  constructor(private authService: AuthorizationService,private router: Router) { }

  ngOnInit(): void {
  }

  processLogin(){
    let signupInfo: SignupInfo = {
      userName:this.userName,
      password: this.password
    }

    this.authService.login(signupInfo).subscribe({
      next: (results) => this.onSaveComplete(results),
      error: (err) => console.log(err),
    })

    /*this.loginResult = this.authService.login(this.userName,this.password)
    console.log(this.loginResult)
    if (this.loginResult === true){
      console.log('Routing...')
      return this.router.navigate(['/list']);
    }
    else{
      this.userName = "";
      this.password = "";
    }*/
  }

  onSaveComplete(result): void {
    console.log('============Result:===========');
    console.log(result.message);
    if(result.user == null && result.accessToken == null){
      this.pageContainsAlert = true;
      this.alertText = "Invalid credentials. Please retry."
      return;
    } 
    this.router.navigate(['/list']);
  }

}
